/**
 * PageTransition Component
 * Provides smooth page transitions using AnimatePresence
 * Wraps route content for fade/slide transitions
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { pageVariants } from '../lib/animations/homepageAnimations';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{
          width: '100%',
          minHeight: '100vh',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}



