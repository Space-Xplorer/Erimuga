import React from 'react';

// Shared shell for the Privacy Policy and Terms pages: a consistent editorial
// header and readable measure for long-form legal text.
const LegalPage = ({ eyebrow, title, updated, children }) => (
  <div className="bg-paper">
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">{title}</h1>
      {updated && <p className="mt-3 text-sm text-ink-muted">Last updated: {updated}</p>}

      <div className="legal mt-10 space-y-8 text-[0.95rem] leading-[1.85] text-ink-soft">
        {children}
      </div>
    </div>
  </div>
);

// Section helper — a display-serif subheading plus body.
export const Section = ({ heading, children }) => (
  <section>
    <h2 className="mb-3 font-display text-2xl text-ink">{heading}</h2>
    <div className="space-y-3">{children}</div>
  </section>
);

export default LegalPage;
