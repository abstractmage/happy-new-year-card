import { useEffect, useState } from "react";
import type { Nullable, Size } from '../types';

export const useElementSize = <T extends HTMLElement>(
  ref: React.RefObject<Nullable<T>>
): Size => {
  const [size, setSize] = useState<Size>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;

    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      setSize({
        width: rect.width,
        height: rect.height,
      });
    };

    updateSize(); // начальный расчет

    const observer = new ResizeObserver(() => {
      updateSize();
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return size;
};
