import { useState, useEffect } from 'react';

const useScreenSize = () => {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getProductCount = () => {
    if (screenWidth >= 1024) return 4;      // lg: 4 columns
    if (screenWidth >= 768) return 3;       // md: 3 columns
    if (screenWidth >= 640) return 2;       // sm: 2 columns
    return 1;                               // mobile: 1 column
  };

  return getProductCount();
};

export default useScreenSize;
