import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const images = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Assamese_couple_in_traditional_attire.jpg/2560px-Assamese_couple_in_traditional_attire.jpg',
  'https://www.poojn.in/wp-content/uploads/2025/04/Assams-Rich-Culture-PeopleAttireandLanguage-Explained.jpeg.jpg',
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
    <section className="relative h-[calc(100vh-80px)] overflow-hidden">
      {/* Background Carousel */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src={images[index]}
          alt={`Slide ${index + 1}`}
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
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
              Timeless Style.<br className="hidden sm:block" /> Rustic Charm.
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-6 text-[#FDEBD0]">
              Explore our earthy collections crafted for those who love elegance with a touch of the wild.
            </p>
            <Link
              to="/collection"
              className="inline-block bg-[#B22222] text-white font-semibold px-6 py-3 rounded hover:bg-[#B22222]/20 transition"
            >
              Shop the Collection
            </Link>
          </div>
        </div>
      </div>

      {/* Carousel Controls */}
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
    </section>
  );
};

export default Hero;
