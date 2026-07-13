import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../config/axios';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Carousel = () => {
    const [slides, setSlides] = useState([]);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        axios.get('/banners')
            .then(res => setSlides(Array.isArray(res.data) ? res.data : []))
            .catch(() => setSlides([]));
    }, []);

    useEffect(() => {
        if (slides.length < 2) return;
        // Auto-advance carousel every 4 seconds
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % slides.length);
        }, 4000);

        return () => clearInterval(timer);
    }, [slides.length]);

    if (slides.length === 0) return null;

    const slide = slides[index] || slides[0];
    const prevSlide = () => setIndex((prev) => (prev - 1 + slides.length) % slides.length);
    const nextSlide = () => setIndex((prev) => (prev + 1) % slides.length);

    return (
        <section className="relative h-[calc(100vh-80px)] overflow-hidden">
            {/* Background Carousel */}
            <div className="absolute inset-0 w-full h-full">
                <img
                    src={slide.imageUrl}
                    alt={slide.heading || `Slide ${index + 1}`}
                    className="w-full h-full object-cover object-center transition duration-500"
                />
                {/* Dark overlay for better text visibility */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 h-full px-6 sm:px-10 md:px-20 flex items-center">
                <div className="max-w-7xl mx-auto w-full">
                    {/* Text Section */}
                    <div className="w-full md:w-1/2 text-left text-[#F9F5F1]">
                        {slide.heading && (
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight whitespace-pre-line">
                                {slide.heading}
                            </h1>
                        )}
                        {slide.subtext && (
                            <p className="text-base sm:text-lg md:text-xl mb-6 text-[#FDEBD0]">
                                {slide.subtext}
                            </p>
                        )}
                        {slide.ctaLabel && slide.ctaLink && (
                            <Link
                                to={slide.ctaLink}
                                className="inline-block bg-[#B22222] text-white font-semibold px-6 py-3 rounded hover:bg-[#B22222]/20 transition"
                            >
                                {slide.ctaLabel}
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Carousel Controls */}
            {slides.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute z-20 top-1/2 left-4 transform -translate-y-1/2 bg-none text-white p-2 rounded-full hover:bg-[#c88d56]/30"
                    >
                        <FaChevronLeft />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute z-20 top-1/2 right-4 transform -translate-y-1/2 bg-none text-white p-2 rounded-full hover:bg-[#c88d56]/30"
                    >
                        <FaChevronRight />
                    </button>
                </>
            )}
        </section>
    );
};

export default Carousel;
