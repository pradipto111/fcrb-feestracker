"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";

type FCRBLoaderProps = {
  isLoading: boolean;
  message?: string;
  crestSrc?: string;
};

const EXIT_DURATION_MS = 350;
const MIN_VISIBLE_MS = 500;

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

export function FCRBLoader({
  isLoading,
  message = "THE PRIDE OF BENGALURU",
  crestSrc = "/fcrb-logo.png",
}: FCRBLoaderProps) {
  const [visible, setVisible] = useState(isLoading);
  const [exiting, setExiting] = useState(false);
  const [flash, setFlash] = useState(false);
  const shownAtRef = useRef<number>(0);
  const hideTimerRef = useRef<number | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (isLoading) {
      const frame = window.requestAnimationFrame(() => {
        setVisible(true);
        setExiting(false);
        setFlash(false);
        shownAtRef.current = Date.now();
      });
      return () => window.cancelAnimationFrame(frame);
    }

    if (!visible) return;

    const elapsed = Date.now() - shownAtRef.current;
    const delay = Math.max(0, MIN_VISIBLE_MS - elapsed);
    hideTimerRef.current = window.setTimeout(() => {
      if (!prefersReducedMotion) {
        setFlash(true);
      }
      setExiting(true);
      hideTimerRef.current = window.setTimeout(() => {
        setVisible(false);
        setExiting(false);
        setFlash(false);
      }, EXIT_DURATION_MS);
    }, delay);

    return () => {
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, [isLoading, visible, prefersReducedMotion]);

  if (!visible) return null;

  return (
    <div
      className={[
        "fcrb-loader",
        exiting ? "is-exiting" : "is-entering",
        prefersReducedMotion ? "is-reduced-motion" : "",
      ].join(" ")}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="fcrb-loader__grain" aria-hidden="true" />
      <div className="fcrb-loader__spotlight" aria-hidden="true" />
      {!prefersReducedMotion && flash ? <div className="fcrb-loader__flash" aria-hidden="true" /> : null}

      <div className="fcrb-loader__stage">
        <div className="fcrb-loader__spark" aria-hidden="true" />
        <div className="fcrb-loader__rays" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, idx) => (
            <span key={idx} style={{ ["--ray-index" as string]: idx } as CSSProperties} />
          ))}
        </div>

        <div className="fcrb-loader__badge" aria-hidden="true">
          <svg className="fcrb-loader__ring-svg" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="82" className="fcrb-loader__ring-path" />
          </svg>

          <div className="fcrb-loader__crest-wrap">
            <div className="fcrb-loader__peacock fcrb-loader__peacock--left" />
            <div className="fcrb-loader__peacock fcrb-loader__peacock--right" />
            <div className="fcrb-loader__center-stripe" />
            <div className="fcrb-loader__sunburst">
              {Array.from({ length: 7 }).map((_, idx) => (
                <span key={idx} style={{ ["--sun-index" as string]: idx } as CSSProperties} />
              ))}
            </div>
            <Image src={crestSrc} alt="" fill sizes="160px" className="fcrb-loader__crest-image" />
          </div>
          {!prefersReducedMotion ? <div className="fcrb-loader__orbit" /> : null}
        </div>
        <div className="fcrb-loader__dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
