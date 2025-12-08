import React from 'react';
import { keyframes } from '@emotion/react';

// Animation keyframes
export const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

export const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
`;

export const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

export const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 5px rgba(255, 169, 0, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 169, 0, 0.8), 0 0 30px rgba(255, 169, 0, 0.6);
  }
`;

export const orbit = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// React animation components
export const AnimatedCard: React.FC<{ 
  children: React.ReactNode; 
  delay?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, style }) => {
  return (
    <div
      style={{
        animation: `fadeIn 0.6s ease-out ${delay}s both`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const FloatingElement: React.FC<{ 
  children: React.ReactNode;
  duration?: number;
}> = ({ children, duration = 3 }) => {
  return (
    <div
      style={{
        animation: `float ${duration}s ease-in-out infinite`,
      }}
    >
      {children}
    </div>
  );
};

export const PulsingBadge: React.FC<{ 
  children: React.ReactNode;
  variant?: 'primary' | 'accent' | 'success';
}> = ({ children, variant = 'accent' }) => {
  const colors = {
    primary: 'rgba(4, 61, 208, 0.8)',
    accent: 'rgba(255, 169, 0, 0.8)',
    success: 'rgba(42, 153, 107, 0.8)',
  };

  return (
    <div
      style={{
        animation: `pulse 2s ease-in-out infinite, glow 2s ease-in-out infinite`,
        display: 'inline-block',
      }}
    >
      {children}
    </div>
  );
};


