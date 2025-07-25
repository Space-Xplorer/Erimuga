import { useState, useEffect } from 'react';

const useScreenSize = () => {
  const [productCount, setProductCount] = useState(getInitialCount());

  function getInitialCount() {
    const width = window.innerWidth;
    if (width >= 1024) return 4;      // lg breakpoint
    if (width >= 768) return 3;       // md breakpoint
    if (width >= 640) return 2;       // sm breakpoint
    return 1;                         // mobile
  }

  useEffect(() => {
    function handleResize() {
      const newCount = getInitialCount();
      if (newCount !== productCount) {
        setProductCount(newCount);
      }
    }

    // Add debounced resize listener
    let timeoutId = null;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [productCount]);

  return productCount;
};

export default useScreenSize;
