import { useState, useEffect } from 'react';

const useWindowHeight = () => {
  const [height, setHeight] = useState(window.innerHeight);

  useEffect(() => {
    const setMeasuredHeight = () => {
      if (!(typeof window !== 'undefined' && typeof document !== 'undefined')) {
        setHeight(null);
        return;
      }

      setHeight(window.innerHeight);
    }

    window.addEventListener('resize', setMeasuredHeight)
    return () => window.removeEventListener('resize', setMeasuredHeight);
  });

  return height;
}

export default useWindowHeight;
