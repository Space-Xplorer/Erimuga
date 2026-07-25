import React, { useEffect, useState } from 'react';
import axios from '../config/axios';
import Carousel from '../components/Carousel';
import CategoryBands from '../components/Home/CategoryBands';
import BrandStory from '../components/Home/BrandStory';

// One request for the whole page. The previous homepage made three, two of
// which downloaded the entire product catalogue to filter it in the browser.
const Home = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    axios
      .get('/homepage')
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <div className="py-32 text-center text-sm text-ink-muted">Loading…</div>;
  }

  return (
    <div className="bg-paper">
      <Carousel slides={data?.banners} />
      <CategoryBands
        categories={data?.categories}
        heading={data?.categorySection?.heading}
        subtext={data?.categorySection?.subtext}
      />
      <BrandStory story={data?.brandStory} />
    </div>
  );
};

export default Home;
