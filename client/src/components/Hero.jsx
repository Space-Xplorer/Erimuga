import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const images = [
  'https://images.unsplash.com/photo-1585241936935-84dc81d8fb06?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600180758890-eac0269a216f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1585241747280-2434d2db0293?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1630409353282-1e79ef34f66e?auto=format&fit=crop&w=800&q=80',
];

const Hero = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => setIndex((prev) => (prev - 1 + images.length) % images.length);
  const nextSlide = () => setIndex((prev) => (prev + 1) % images.length);

  return (
    <section className="bg-[#7E4A35] text-[#F9F5F1] py-16 px-6 sm:px-10 md:px-20">
      <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between gap-10">
        {/* Text Section */}
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Timeless Style.<br className="hidden sm:block" /> Rustic Charm.
          </h1>
          <p className="text-base sm:text-lg md:text-xl mb-6 text-[#FDEBD0]">
            Explore our earthy collections crafted for those who love elegance with a touch of the wild.
          </p>
          <Link
            to="/collection"
            className="inline-block bg-[#D4A373] text-white font-semibold px-6 py-3 rounded hover:bg-[#c88d56] transition"
          >
            Shop the Collection
          </Link>
        </div>

        {/* Carousel Section */}
        <div className="w-full md:w-1/2 relative">
          <img
            src={images[index]}
            alt={`Slide ${index + 1}`}
            className="w-full h-64 sm:h-80 md:h-[22rem] lg:h-[26rem] object-cover rounded shadow-lg transition duration-500"
          />

          {/* Carousel Controls */}
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-2 sm:left-4 transform -translate-y-1/2 bg-[#D4A373] text-white p-2 rounded-full hover:bg-[#c88d56] z-10"
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-2 sm:right-4 transform -translate-y-1/2 bg-[#D4A373] text-white p-2 rounded-full hover:bg-[#c88d56] z-10"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
