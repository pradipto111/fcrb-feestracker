import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from "framer-motion";

interface InfiniteCarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  speed?: number;
  pauseOnHover?: boolean;
  cardWidth?: number;
  gap?: number;
}

export function InfiniteCarousel<T>({
  items,
  renderItem,
  speed = 0.6,
  pauseOnHover = true,
  cardWidth = 280,
  gap = 24,
}: InfiniteCarouselProps<T>) {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const [paused, setPaused] = useState(false);

  const totalWidth = (cardWidth + gap) * items.length;

  useAnimationFrame((_, delta) => {
    if (reduceMotion) return;
    if (pauseOnHover && paused) return;
    if (!items.length) return;

    const deltaPx = (speed * delta) / 10;
    let current = x.get();
    current -= deltaPx;
    if (current <= -totalWidth) {
      current += totalWidth;
    }
    x.set(current);
  });

  useEffect(() => {
    x.set(0);
  }, [totalWidth, x]);

  const trackItems = [...items, ...items];

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        paddingBottom: 8,
      }}
      onMouseEnter={() => pauseOnHover && setPaused(true)}
      onMouseLeave={() => pauseOnHover && setPaused(false)}
      onTouchStart={() => pauseOnHover && setPaused(true)}
      onTouchEnd={() => pauseOnHover && setPaused(false)}
    >
      <motion.div
        style={{
          display: "flex",
          gap,
          x,
          willChange: "transform",
        }}
      >
        {trackItems.map((item, index) => (
          <div
            key={index}
            style={{
              flex: "0 0 auto",
              width: cardWidth,
            }}
          >
            {renderItem(item, index % items.length)}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

