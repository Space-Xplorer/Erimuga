import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../config/axios';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

/**
 * Hero carousel.
 *
 * Slides normally arrive from the single /homepage request via the `slides`
 * prop. It still self-fetches when rendered without one, so the component
 * stays usable on its own.
 */
const Carousel = ({ slides: slidesProp }) => {
    const [fetched, setFetched] = useState([]);
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    const slides = slidesProp ?? fetched;
    const controlled = slidesProp !== undefined;

    useEffect(() => {
        if (controlled) return;
        axios.get('/banners')
            .then(res => setFetched(Array.isArray(res.data) ? res.data : []))
            .catch(() => setFetched([]));
    }, [controlled]);

    useEffect(() => {
        if (slides.length < 2 || paused) return;
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [slides.length, paused]);

    if (slides.length === 0) return null;

    const slide = slides[index] || slides[0];
    const prevSlide = () => setIndex((prev) => (prev - 1 + slides.length) % slides.length);
    const nextSlide = () => setIndex((prev) => (prev + 1) % slides.length);

    return (
        <section
            /* -mt-20 pulls the hero up under the transparent navbar (h-20), so
               the image runs edge to edge behind it instead of starting below. */
            className="relative -mt-20 h-svh min-h-105 overflow-hidden bg-ink"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <div className="absolute inset-0">
                {/* All slides stay mounted and cross-fade, so switching doesn't
                    flash a blank frame while the next image decodes. */}
                {slides.map((s, i) => (
                    <img
                        key={s._id || i}
                        src={s.imageUrl}
                        alt={s.heading || `Slide ${i + 1}`}
                        aria-hidden={i !== index}
                        className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ${
                            i === index ? 'opacity-100' : 'opacity-0'
                        }`}
                    />
                ))}
                <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/45 to-black/10" />
            </div>

            <div className="relative z-10 flex h-full items-center px-6 pt-20 sm:px-10 md:px-20">
                <div className="mx-auto w-full max-w-7xl">
                    <div className="w-full text-paper md:w-3/5 lg:w-1/2">
                        {slide.heading && (
                            <h1 className="whitespace-pre-line font-display text-5xl leading-[1.05] sm:text-6xl md:text-7xl">
                                {slide.heading}
                            </h1>
                        )}
                        {slide.subtext && (
                            <p className="mt-6 max-w-md text-[0.95rem] leading-relaxed text-paper/80">
                                {slide.subtext}
                            </p>
                        )}
                        {slide.ctaLabel && slide.ctaLink && (
                            <Link
                                to={slide.ctaLink}
                                className="group mt-9 inline-flex items-center gap-2 border-b border-paper/40 pb-1.5 text-sm tracking-wide text-paper transition-colors hover:border-paper"
                            >
                                {slide.ctaLabel}
                                <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                                    &rarr;
                                </span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {slides.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        aria-label="Previous slide"
                        className="absolute left-3 top-1/2 z-20 -translate-y-1/2 p-3 text-paper/70 transition hover:text-paper sm:left-6"
                    >
                        <FaChevronLeft />
                    </button>
                    <button
                        onClick={nextSlide}
                        aria-label="Next slide"
                        className="absolute right-3 top-1/2 z-20 -translate-y-1/2 p-3 text-paper/70 transition hover:text-paper sm:right-6"
                    >
                        <FaChevronRight />
                    </button>

                    <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2.5">
                        {slides.map((s, i) => (
                            <button
                                key={s._id || i}
                                onClick={() => setIndex(i)}
                                aria-label={`Go to slide ${i + 1}`}
                                aria-current={i === index}
                                className={`h-px w-8 transition-colors ${
                                    i === index ? 'bg-paper' : 'bg-paper/35 hover:bg-paper/60'
                                }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
};

export default Carousel;
