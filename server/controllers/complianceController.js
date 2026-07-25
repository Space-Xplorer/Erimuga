// controllers/complianceController.js
// Implements the two data-principal rights the app must honour under the DPDP
// Act 2023: access (export my data) and erasure (delete my account).
import bcrypt from 'bcrypt';
import userModel from '../models/userModel.js';
import Order from '../models/orderModel.js';
import Review from '../models/reviewModel.js';

// Right to access / portability — everything we hold about the signed-in user,
// as plain JSON they can download. Orders come from their snapshots.
export const exportMyData = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).select('-password -__v').lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const orders = await Order.find({ userID: req.user._id }).select('-__v').lean();
    const reviews = await Review.find({ userId: req.user._id }).select('-__v').lean();

    const payload = {
      exportedAt: new Date().toISOString(),
      note:
        'This file contains the personal data Erimuga holds about your account. ' +
        'Order records are retained as required by tax and accounting law even after account deletion.',
      account: user,
      orders,
      reviews,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="erimuga-my-data.json"');
    res.status(200).send(JSON.stringify(payload, null, 2));
  } catch (err) {
    res.status(500).json({ error: 'Failed to export data', details: err.message });
  }
};

/**
 * Right to erasure. We anonymise rather than hard-delete because order records
 * are transaction documents the business is legally required to retain (Income
 * Tax / GST). DPDP permits retention for legal compliance, so we strip every
 * identifying field, block future login, and keep the row only as a
 * non-identifying tombstone that keeps retained orders referentially intact.
 */
export const deleteMyAccount = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isDeleted) return res.status(400).json({ error: 'Account already deleted' });

    // Re-authenticate: password-based accounts must confirm their password;
    // Google-only accounts confirm by typing the exact phrase on the client,
    // which arrives as `confirmText`.
    const hasPassword = Boolean(user.password) && !user.googleId;
    if (hasPassword) {
      const { password } = req.body;
      if (!password) return res.status(400).json({ error: 'Please enter your password to confirm' });
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ error: 'Incorrect password' });
    } else if (req.body.confirmText !== 'DELETE') {
      return res.status(400).json({ error: 'Type DELETE to confirm' });
    }

    // Reviews carry the reviewer's name — remove them outright.
    await Review.deleteMany({ userId: user._id });

    // Scrub every identifying field. Phone is unset and email becomes a unique
    // per-id tombstone so neither collides across multiple deletions.
    user.name = 'Deleted user';
    user.email = `deleted-${user._id}@removed.invalid`;
    user.phonenumber = undefined;
    user.password = undefined;
    user.googleId = undefined;
    user.addresses = [];
    user.cartData = [];
    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save();

    // End the session so the now-anonymised account is signed out everywhere.
    req.logout(() => {
      req.session?.destroy(() => {
        res.clearCookie('erimuga.sid');
        res.status(200).json({
          message:
            'Your account has been deleted. Order records are retained where the law requires, ' +
            'with your personal details removed.',
        });
      });
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete account', details: err.message });
  }
};
