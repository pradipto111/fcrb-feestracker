import { useEffect, useLayoutEffect, useRef, useState } from "react";

type UseMarqueeOptions = {
  speedPxPerSec?: number;
  paused?: boolean;
  disabled?: boolean;
};

export function useMarquee({ speedPxPerSec = 60, paused = false, disabled = false }: UseMarqueeOptions) {
  const sequenceRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const [offsetPx, setOffsetPx] = useState(0);
  const [sequenceWidthPx, setSequenceWidthPx] = useState(0);

  useLayoutEffect(() => {
    if (!sequenceRef.current) return;

    const el = sequenceRef.current;
    const ro = new ResizeObserver(() => {
      const w = el.getBoundingClientRect().width;
      if (!Number.isFinite(w) || w <= 0) return;
      setSequenceWidthPx(w);
      offsetRef.current = w > 0 ? offsetRef.current % w : 0;
      setOffsetPx(offsetRef.current);
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (disabled) return;
    if (paused) return;
    if (!sequenceWidthPx || sequenceWidthPx <= 0) return;

    const tick = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = Math.min(0.05, (ts - lastTsRef.current) / 1000); // clamp dt to avoid big jumps
      lastTsRef.current = ts;

      offsetRef.current += speedPxPerSec * dt;
      if (offsetRef.current >= sequenceWidthPx) offsetRef.current -= sequenceWidthPx;
      setOffsetPx(offsetRef.current);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
    };
  }, [disabled, paused, speedPxPerSec, sequenceWidthPx]);

  return {
    sequenceRef,
    offsetPx,
    sequenceWidthPx,
  };
}


