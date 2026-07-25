import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Cookie / data-use consent notice.
 *
 * Erimuga only sets a strictly-necessary session cookie (login + cart). There
 * is no analytics or advertising cookie today, so this is a transparency notice
 * plus a recorded consent, as DPDP expects.
 *
 * The choice is stored in localStorage with a version and expiry, so a
 * returning visitor is not nagged — the banner reappears only when the record
 * is missing, expired, or the version is bumped (e.g. if the policy changes).
 */
const STORAGE_KEY = 'erimuga_consent';
const CONSENT_VERSION = 1;       // bump when the cookie/data practices change
const VALID_DAYS = 180;

const readConsent = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.v !== CONSENT_VERSION) return null;
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) return null;
    return parsed;
  } catch {
    return null;
  }
};

const ConsentBanner = () => {
  // Start hidden; decide after mount so SSR/first paint never flashes the bar
  // at someone who already consented.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!readConsent()) setVisible(true);
  }, []);

  const record = (choice) => {
    const now = Date.now();
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          v: CONSENT_VERSION,
          choice, // 'all' | 'necessary'
          acceptedAt: new Date(now).toISOString(),
          expiresAt: now + VALID_DAYS * 24 * 60 * 60 * 1000,
        })
      );
    } catch { /* private mode / storage disabled — banner simply reappears next visit */ }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie and data use consent"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-paper-deep bg-paper/95 backdrop-blur"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm leading-relaxed text-ink-soft">
          We use a single essential cookie to keep you signed in and remember your cart. We don't use
          advertising or tracking cookies. See our{' '}
          <Link to="/privacy" className="text-brand underline underline-offset-2">Privacy Policy</Link>{' '}
          for how we handle your data under the DPDP Act.
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={() => record('necessary')}
            className="rounded-lg border border-paper-deep px-4 py-2 text-sm font-medium text-ink-soft transition hover:border-ink-muted"
          >
            Necessary only
          </button>
          <button
            onClick={() => record('all')}
            className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;
