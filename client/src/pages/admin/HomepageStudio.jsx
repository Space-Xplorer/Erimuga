import { useState } from 'react';
import CarouselTab from '../../components/Admin/Homepage/CarouselTab';
import CategoryBandsTab from '../../components/Admin/Homepage/CategoryBandsTab';
import BrandStoryTab from '../../components/Admin/Homepage/BrandStoryTab';

const TABS = [
  { key: 'carousel', label: 'Carousel', hint: 'The full-screen slides at the top of the homepage.' },
  { key: 'bands', label: 'Category Bands', hint: 'Which collections appear, their image, order and featured pieces.' },
  { key: 'story', label: 'Brand Story', hint: 'The “about the maker” block below the collections.' },
];

/**
 * Single place to edit everything on the homepage. Replaces the old Banners
 * page, which only covered the carousel.
 */
export default function HomepageStudio() {
  const [tab, setTab] = useState('carousel');
  const active = TABS.find((t) => t.key === tab);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">Homepage</h1>
      <p className="text-sm text-gray-500 mb-6">
        Everything a visitor sees before they click through.
      </p>

      <div className="flex gap-1 border-b border-gray-200 mb-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-400 mb-8">{active?.hint}</p>

      {tab === 'carousel' && <CarouselTab />}
      {tab === 'bands' && <CategoryBandsTab />}
      {tab === 'story' && <BrandStoryTab />}
    </div>
  );
}
