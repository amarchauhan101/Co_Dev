import { useEffect, useState, useRef } from "react";

export default function useResizeObserver(ref, callback) {
  const [size, setSize] = useState();
  const prevSize = useRef({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref?.current || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect || {};
      const roundedWidth = Math.round(width);
      const roundedHeight = Math.round(height);

      const hasChanged =
        roundedWidth !== prevSize.current.width ||
        roundedHeight !== prevSize.current.height;

      if (hasChanged) {
        prevSize.current = { width: roundedWidth, height: roundedHeight };
        setSize({ width: roundedWidth, height: roundedHeight });

        console.log("✅ Size changed:", {
          width: roundedWidth,
          height: roundedHeight,
        });

        if (callback) callback(); // e.g., virtualizer.measure()
      }
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, callback]);

  return size;
}
