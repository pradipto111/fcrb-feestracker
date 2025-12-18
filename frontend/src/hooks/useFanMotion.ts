import { useReducedMotion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

export type FanMotion = {
  pageEnter: {
    initial: any;
    animate: any;
    transition: any;
  };
  cardReveal: {
    hidden: any;
    show: any;
  };
  staggerGrid: {
    hidden: any;
    show: any;
  };
  hoverLift: any;
  modalOpen: {
    hidden: any;
    show: any;
    exit: any;
  };
  carouselShift: any;
  viewportOnce: { once: boolean; amount: number };
};

export function useFanMotion(): FanMotion {
  const reduce = useReducedMotion();

  const pageEnter = {
    initial: reduce ? {} : { opacity: 0, y: 10, filter: "blur(6px)" },
    animate: reduce ? {} : { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: reduce ? 0 : 0.45, ease },
  };

  const cardReveal = {
    hidden: reduce ? { opacity: 1 } : { opacity: 0, y: 14, filter: "blur(6px)" },
    show: reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.45, ease } },
  };

  const staggerGrid = {
    hidden: { opacity: 1 },
    show: { opacity: 1, transition: { staggerChildren: reduce ? 0 : 0.06 } },
  };

  const hoverLift = reduce ? undefined : { y: -3, scale: 1.01, transition: { duration: 0.18, ease } };

  const modalOpen = {
    hidden: reduce ? { opacity: 1 } : { opacity: 0, scale: 0.98, y: 10, filter: "blur(8px)" },
    show: reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.25, ease } },
    exit: reduce ? { opacity: 1 } : { opacity: 0, scale: 0.98, y: 8, filter: "blur(8px)", transition: { duration: 0.2, ease } },
  };

  const carouselShift = reduce ? undefined : { x: 0, transition: { duration: 0.35, ease } };

  return {
    pageEnter,
    cardReveal,
    staggerGrid,
    hoverLift,
    modalOpen,
    carouselShift,
    viewportOnce: { once: true, amount: 0.25 },
  };
}



