import React from 'react';
import { Link } from 'react-router-dom';

// The "about the maker" block. Entirely admin-driven and hidden until enabled,
// so an empty brand story never leaves a blank slab on the homepage.
const BrandStory = ({ story }) => {
  if (!story?.enabled) return null;
  if (!story.heading && !story.body && !story.imageUrl) return null;

  return (
    <section className="border-t border-paper-deep bg-paper-dim py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-10 md:flex-row md:gap-16">
          {story.imageUrl && (
            <div className="w-full md:w-5/12">
              <img
                src={story.imageUrl}
                alt={story.heading || 'About Erimuga'}
                loading="lazy"
                className="aspect-4/5 w-full object-cover"
              />
            </div>
          )}

          <div className={story.imageUrl ? 'w-full md:w-7/12' : 'mx-auto max-w-2xl text-center'}>
            <p className="eyebrow">Our Story</p>

            {story.heading && (
              <h2 className="mt-4 font-display text-3xl leading-tight text-ink sm:text-4xl md:text-5xl">
                {story.heading}
              </h2>
            )}

            {story.body && (
              <p className="mt-6 whitespace-pre-line text-[0.95rem] leading-[1.9] text-ink-soft">
                {story.body}
              </p>
            )}

            {story.ctaLabel && story.ctaLink && (
              <Link
                to={story.ctaLink}
                className="group mt-8 inline-flex items-center gap-2 border-b border-ink/25 pb-1 text-sm text-ink transition-colors hover:border-brand hover:text-brand"
              >
                {story.ctaLabel}
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                  &rarr;
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandStory;
