import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import RailCard from './RailCard';

/**
 * One category, rendered as an editorial band: a tall image on one side and
 * the category's name, story line and product rail on the other.
 *
 * `reverse` flips the sides on desktop. On mobile the order is always
 * image -> title -> tagline -> rail, because a story reads top-down regardless
 * of which side the picture sat on.
 */
const CategoryBand = ({ category, index, reverse }) => {
  const railRef = useRef(null);

  const scrollRail = (direction) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * rail.clientWidth * 0.8, behavior: 'smooth' });
  };

  const numeral = String(index + 1).padStart(2, '0');
  const hasImage = Boolean(category.homepageImage?.url);
  const products = category.products || [];

  return (
    <section className="border-t border-paper-deep py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-14 ${
            reverse ? 'lg:flex-row-reverse' : ''
          }`}
        >
          {/* Editorial image ------------------------------------------------ */}
          <div className="w-full lg:w-5/12 shrink-0">
            <Link to={`/collection/${category.slug}`} className="group block">
              {hasImage ? (
                <div className="overflow-hidden bg-paper-dim">
                  <img
                    src={category.homepageImage.url}
                    alt={category.name}
                    loading="lazy"
                    className="aspect-4/5 w-full object-cover transition-transform duration-1200 ease-out group-hover:scale-[1.03]"
                  />
                </div>
              ) : (
                /* No photograph yet — a typographic panel reads as a deliberate
                   choice, where a stretched low-res image reads as broken. */
                <div className="flex aspect-4/5 w-full items-center justify-center bg-paper-deep px-6">
                  <span className="text-center font-display text-4xl italic text-ink-soft sm:text-5xl">
                    {category.name}
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* Text + rail ---------------------------------------------------- */}
          <div className="w-full min-w-0 lg:w-7/12">
            <div className="flex items-center gap-4">
              <span className="font-display text-2xl leading-none text-accent">{numeral}</span>
              <span className="h-px flex-1 bg-paper-deep" />
            </div>

            <h2 className="mt-5 font-display text-4xl leading-none text-ink sm:text-5xl md:text-6xl">
              {category.name}
            </h2>

            {category.tagline && (
              <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-ink-soft">
                {category.tagline}
              </p>
            )}

            {products.length > 0 ? (
              <>
                <div className="relative mt-9">
                  <div ref={railRef} className="rail pb-2">
                    {products.map((product) => (
                      <RailCard key={product._id} product={product} />
                    ))}
                  </div>

                  {/* Desktop-only affordance; mobile just swipes. */}
                  {products.length > 2 && (
                    <>
                      <button
                        type="button"
                        onClick={() => scrollRail(-1)}
                        aria-label={`Scroll ${category.name} left`}
                        className="absolute -left-4 top-[35%] hidden h-9 w-9 items-center justify-center rounded-full bg-paper/90 text-ink-soft shadow-sm backdrop-blur transition hover:text-brand lg:flex"
                      >
                        <FaChevronLeft className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollRail(1)}
                        aria-label={`Scroll ${category.name} right`}
                        className="absolute -right-4 top-[35%] hidden h-9 w-9 items-center justify-center rounded-full bg-paper/90 text-ink-soft shadow-sm backdrop-blur transition hover:text-brand lg:flex"
                      >
                        <FaChevronRight className="h-3 w-3" />
                      </button>
                    </>
                  )}
                </div>

                <Link
                  to={`/collection/${category.slug}`}
                  className="group mt-8 inline-flex items-center gap-2 border-b border-ink/25 pb-1 text-sm text-ink transition-colors hover:border-brand hover:text-brand"
                >
                  View all {category.name}
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                    &rarr;
                  </span>
                </Link>
              </>
            ) : (
              <p className="mt-8 text-sm italic text-ink-muted">
                Pieces in this collection are on their way.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryBand;
