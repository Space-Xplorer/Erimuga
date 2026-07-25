import React from 'react';
import CategoryBand from './CategoryBand';

const CategoryBands = ({ categories = [], heading, subtext }) => {
  if (categories.length === 0) return null;

  return (
    <div className="bg-paper">
      {(heading || subtext) && (
        <div className="mx-auto max-w-7xl px-4 pt-16 pb-10 text-center sm:px-6 lg:px-8 md:pt-24 md:pb-14">
          {heading && (
            <h2 className="font-display text-3xl italic text-ink sm:text-4xl">{heading}</h2>
          )}
          {subtext && (
            <p className="mx-auto mt-4 max-w-xl text-[0.95rem] leading-relaxed text-ink-soft">
              {subtext}
            </p>
          )}
        </div>
      )}

      {categories.map((category, i) => (
        <CategoryBand
          key={category._id}
          category={category}
          index={i}
          // Alternate which side the photograph sits on so the page reads as a
          // lookbook rather than a repeating template.
          reverse={i % 2 === 1}
        />
      ))}
    </div>
  );
};

export default CategoryBands;
