import Banner from '../models/bannerModel.js';
import cloudinary, { uploadToCloudinary } from '../config/cloudinary.js';
import fs from 'fs';

// Public — storefront carousel
export const getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    res.status(200).json(banners);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
};

// Admin — full list including inactive, for the management UI
export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: 1 });
    res.status(200).json(banners);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
};

export const createBanner = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'An image is required' });

    const result = await uploadToCloudinary(req.file.path, { folder: 'erimuga/banners' });
    fs.unlinkSync(req.file.path);

    const { heading, subtext, ctaLabel, ctaLink, order, isActive } = req.body;
    const banner = await Banner.create({
      imageUrl: result.url,
      public_id: result.public_id,
      heading: heading || '',
      subtext: subtext || '',
      ctaLabel: ctaLabel || '',
      ctaLink: ctaLink || '',
      order: Number(order) || 0,
      isActive: isActive === undefined ? true : isActive === 'true' || isActive === true,
    });

    res.status(201).json({ message: 'Banner created', banner });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create banner', details: err.message });
  }
};

export const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ error: 'Banner not found' });

    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, { folder: 'erimuga/banners' });
      fs.unlinkSync(req.file.path);
      if (banner.public_id) {
        await cloudinary.uploader.destroy(banner.public_id).catch(() => {});
      }
      banner.imageUrl = result.url;
      banner.public_id = result.public_id;
    }

    const { heading, subtext, ctaLabel, ctaLink, order, isActive } = req.body;
    if (heading !== undefined) banner.heading = heading;
    if (subtext !== undefined) banner.subtext = subtext;
    if (ctaLabel !== undefined) banner.ctaLabel = ctaLabel;
    if (ctaLink !== undefined) banner.ctaLink = ctaLink;
    if (order !== undefined) banner.order = Number(order) || 0;
    if (isActive !== undefined) banner.isActive = isActive === 'true' || isActive === true;

    await banner.save();
    res.status(200).json({ message: 'Banner updated', banner });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update banner', details: err.message });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ error: 'Banner not found' });

    if (banner.public_id) {
      await cloudinary.uploader.destroy(banner.public_id).catch(() => {});
    }
    await Banner.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Banner deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete banner', details: err.message });
  }
};
