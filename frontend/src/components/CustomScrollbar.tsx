import React, { useEffect, useState, useRef } from "react";
import { motion, useScroll, useSpring, useTransform, useMotionValue } from "framer-motion";
import { colors } from "../theme/design-tokens";

interface CustomScrollbarProps {
  containerRef?: React.RefObject<HTMLElement>;
}

export const CustomScrollbar: React.FC<CustomScrollbarProps> = () => {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [documentHeight, setDocumentHeight] = useState(document.documentElement.scrollHeight);
  const trackRef = useRef<HTMLDivElement>(null);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      setViewportHeight(window.innerHeight);
      setDocumentHeight(document.documentElement.scrollHeight);
    };

    window.addEventListener("resize", updateDimensions);
    window.addEventListener("scroll", updateDimensions);
    return () => {
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("scroll", updateDimensions);
    };
  }, []);

  // Calculate scrollbar height based on viewport
  const scrollbarHeight = useTransform(smoothProgress, () => {
    const visibleRatio = viewportHeight / documentHeight;
    return Math.max(visibleRatio * 100, 32); // Minimum 32% height (4x increase) for better grabability
  });

  // Calculate scrollbar position in percentage
  const scrollbarTopPercent = useTransform(smoothProgress, (progress) => {
    const height = scrollbarHeight.get();
    return progress * (100 - height);
  });

  // Get drag constraints
  const getDragConstraints = () => {
    if (!trackRef.current) return { top: 0, bottom: 0 };
    const trackHeight = trackRef.current.clientHeight;
    const thumbHeightPercent = scrollbarHeight.get();
    const thumbHeightPx = (thumbHeightPercent / 100) * trackHeight;
    return {
      top: 0,
      bottom: trackHeight - thumbHeightPx,
    };
  };

  // Hide scrollbar when at top or bottom
  useEffect(() => {
    const unsubscribe = smoothProgress.on("change", (latest) => {
      if (latest < 0.01 || latest > 0.99) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    });
    return () => unsubscribe();
  }, [smoothProgress]);

  // Handle track click to scroll
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return; // Don't scroll if dragging
    
    const track = e.currentTarget;
    const rect = track.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const percentage = clickY / rect.height;
    
    const scrollableHeight = documentHeight - viewportHeight;
    const targetScroll = percentage * scrollableHeight;
    
    // Use Lenis if available, otherwise fallback to native scroll
    const lenis = (window as any).lenis;
    if (lenis) {
      lenis.scrollTo(targetScroll, { duration: 1.2 });
    } else {
      window.scrollTo({
        top: targetScroll,
        behavior: "smooth",
      });
    }
  };

  // Handle drag to scroll - properly map thumb position to scroll position
  const handleDrag = (_event: any, info: any) => {
    if (!trackRef.current) return;
    
    const track = trackRef.current;
    const rect = track.getBoundingClientRect();
    const trackHeight = rect.height;
    const thumbHeightPercent = scrollbarHeight.get();
    const thumbHeightPx = (thumbHeightPercent / 100) * trackHeight;
    
    // Get the absolute mouse Y position
    const mouseY = info.point.y;
    const trackTop = rect.top;
    
    // Calculate thumb top position relative to track (where the top edge of thumb should be)
    // Constrain thumb to stay within track bounds (0 to trackHeight - thumbHeightPx)
    const relativeY = mouseY - trackTop;
    const thumbTop = Math.max(0, Math.min(relativeY - thumbHeightPx / 2, trackHeight - thumbHeightPx));
    
    // Calculate scroll progress (0 to 1) based on thumb position
    const scrollRange = trackHeight - thumbHeightPx;
    const scrollProgress = scrollRange > 0 ? thumbTop / scrollRange : 0;
    
    // Convert scroll progress to actual scroll position
    const scrollableHeight = Math.max(0, documentHeight - viewportHeight);
    const targetScroll = scrollProgress * scrollableHeight;
    
    // Update scroll position immediately during drag using native scroll
    // Lenis is already stopped in onDragStart, so this will work smoothly
    window.scrollTo({
      top: Math.max(0, Math.min(targetScroll, scrollableHeight)),
      behavior: "auto", // Instant scroll during drag
    });
  };

  // Color transitions based on scroll progress
  const gradientColors = useTransform(smoothProgress, (progress) => {
    // Transition from blue to orange as you scroll
    const blueOpacity = 0.9 - progress * 0.3;
    const orangeOpacity = 0.6 + progress * 0.3;
    return {
      blue: `rgba(4, 61, 208, ${blueOpacity})`,
      orange: `rgba(255, 169, 0, ${orangeOpacity})`,
      cyan: `rgba(0, 224, 255, ${0.4 + progress * 0.2})`,
    };
  });

  return (
    <motion.div
      ref={trackRef}
      style={{
        position: "fixed",
        right: "0px",
        top: "0px",
        bottom: "0px",
        width: "64px",
        height: "100vh",
        maxHeight: "100vh",
        zIndex: 9999,
        pointerEvents: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsDragging(false);
      }}
      initial={{ opacity: 0, x: 0 }}
      animate={{ 
        opacity: isVisible ? (isHovered || isDragging ? 1 : 0.75) : 0,
        x: 0,
      }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Track - Glassmorphic background with gradient */}
      <motion.div
        style={{
          position: "absolute",
          width: "32px",
          height: "calc(100vh - 0px)",
          maxHeight: "100vh",
          background: "linear-gradient(180deg, rgba(5, 11, 32, 0.5) 0%, rgba(16, 28, 58, 0.5) 100%)",
          borderRadius: "24px 0 0 24px",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRight: "none",
          cursor: "pointer",
          top: 0,
          right: 0,
        }}
        onClick={handleTrackClick}
        animate={{
          width: isHovered || isDragging ? "48px" : "32px",
          borderRadius: isHovered || isDragging ? "24px 0 0 24px" : "24px 0 0 24px",
          background: isHovered || isDragging
            ? "linear-gradient(180deg, rgba(5, 11, 32, 0.7) 0%, rgba(16, 28, 58, 0.7) 100%)"
            : "linear-gradient(180deg, rgba(5, 11, 32, 0.5) 0%, rgba(16, 28, 58, 0.5) 100%)",
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Animated track glow */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "10px",
            background: "linear-gradient(180deg, rgba(4, 61, 208, 0.2) 0%, rgba(255, 169, 0, 0.2) 100%)",
            opacity: 0,
          }}
          animate={{
            opacity: isHovered ? [0, 0.4, 0] : 0,
          }}
          transition={{
            duration: 3,
            repeat: isHovered ? Infinity : 0,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Scrollbar Thumb - Animated with dynamic gradient */}
      <motion.div
        style={{
          position: "absolute",
          width: isHovered || isDragging ? "64px" : "48px",
          height: scrollbarHeight,
          top: scrollbarTopPercent,
          right: 0,
          borderRadius: "24px 0 0 24px",
          cursor: isDragging ? "grabbing" : "grab",
          maxHeight: "calc(100vh - 0px)",
        }}
        drag="y"
        dragConstraints={getDragConstraints}
        dragElastic={0}
        dragMomentum={false}
        onDragStart={() => {
          setIsDragging(true);
          // Stop Lenis when starting to drag scrollbar
          const lenis = (window as any).lenis;
          if (lenis && !lenis.isStopped) {
            lenis.stop();
          }
        }}
        onDragEnd={() => {
          setIsDragging(false);
          // Restart Lenis after drag ends, but sync it with current scroll position first
          const lenis = (window as any).lenis;
          if (lenis && lenis.isStopped) {
            // Sync Lenis scroll position with actual scroll position
            const currentScroll = window.scrollY || document.documentElement.scrollTop;
            lenis.scrollTo(currentScroll, { immediate: true });
            
            // Small delay to ensure scroll position is stable before restarting smooth scroll
            setTimeout(() => {
              lenis.start();
            }, 100);
          }
        }}
        onDrag={handleDrag}
        animate={{
          width: isHovered || isDragging ? "64px" : "48px",
          scale: isHovered || isDragging ? 1.05 : 1,
          borderRadius: "24px 0 0 24px",
        }}
        transition={{
          width: { duration: 0.3 },
          scale: { duration: 0.2 },
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ cursor: "grabbing", scale: 1.02 }}
      >
        {/* Background gradient - dynamically updated */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "10px",
            background: useTransform(
              smoothProgress,
              (progress) => {
                const blueOpacity = 0.9 - progress * 0.3;
                const orangeOpacity = 0.6 + progress * 0.3;
                return `linear-gradient(180deg, rgba(4, 61, 208, ${blueOpacity}) 0%, rgba(255, 169, 0, ${orangeOpacity}) 100%)`;
              }
            ),
            boxShadow: useTransform(
              smoothProgress,
              (progress) => {
                const orangeOpacity = (0.6 + progress * 0.3) * 0.4;
                const blueOpacity = (0.9 - progress * 0.3) * 0.3;
                const blur1 = isHovered ? "25px" : "15px";
                const blur2 = isHovered ? "50px" : "30px";
                return `0 0 ${blur1} rgba(255, 169, 0, ${orangeOpacity}), 0 0 ${blur2} rgba(4, 61, 208, ${blueOpacity})`;
              }
            ),
          }}
        />

        {/* Animated pulsing glow effect */}
        <motion.div
          style={{
            position: "absolute",
            inset: "-2px",
            borderRadius: "10px",
            background: useTransform(
              smoothProgress,
              (progress) => {
                const cyanOpacity = 0.4 + progress * 0.2;
                const orangeOpacity = 0.6 + progress * 0.3;
                return `linear-gradient(180deg, rgba(0, 224, 255, ${cyanOpacity}) 0%, rgba(255, 169, 0, ${orangeOpacity}) 100%)`;
              }
            ),
            opacity: 0,
            filter: "blur(4px)",
          }}
          animate={{
            opacity: isHovered ? [0, 0.8, 0] : [0, 0.4, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Inner shine effect */}
        <motion.div
          style={{
            position: "absolute",
            top: "10%",
            left: "20%",
            width: "60%",
            height: "30%",
            borderRadius: "10px",
            background: "linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%)",
            opacity: 0.6,
          }}
          animate={{
            opacity: isHovered ? [0.6, 0.9, 0.6] : 0.6,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Progress indicator dots - Infinity flow style */}
      <motion.div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "24px 0",
          pointerEvents: "none",
        }}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((progress, index) => {
          const dotOpacity = useTransform(smoothProgress, (current) => {
            const distance = Math.abs(current - progress);
            return distance < 0.03 ? 1 : distance < 0.1 ? 0.5 : 0.2;
          });

          const dotScale = useTransform(smoothProgress, (current) => {
            const distance = Math.abs(current - progress);
            return distance < 0.03 ? 1.8 : distance < 0.1 ? 1.3 : 1;
          });

          const dotColor = useTransform(smoothProgress, (current) => {
            const distance = Math.abs(current - progress);
            if (distance < 0.03) {
              return colors.accent.main;
            }
            return current < progress ? colors.primary.main : "rgba(255, 255, 255, 0.3)";
          });

          return (
            <motion.div
              key={index}
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: dotColor,
                opacity: dotOpacity,
                scale: dotScale,
                boxShadow: useTransform(
                  smoothProgress,
                  (current) => {
                    const distance = Math.abs(current - progress);
                    return distance < 0.03
                      ? `0 0 24px ${colors.accent.main}80`
                      : "none";
                  }
                ),
              }}
            />
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default CustomScrollbar;

