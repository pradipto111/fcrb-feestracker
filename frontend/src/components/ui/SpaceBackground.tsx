import React from 'react';
import { colors } from '../../theme/design-tokens';

interface SpaceBackgroundProps {
  children?: React.ReactNode;
  variant?: 'full' | 'subtle';
  style?: React.CSSProperties;
}

export const SpaceBackground: React.FC<SpaceBackgroundProps> = ({
  children,
  variant = 'subtle',
  style,
}) => {
  // Generate random star positions for subtle starfield
  const stars = React.useMemo(() => {
    return Array.from({ length: variant === 'full' ? 100 : 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.3,
    }));
  }, [variant]);

  // Fallback backgrounds so we don't depend on a non-existent colors.space palette
  const nebulaBackground =
    'radial-gradient(circle at 0% 0%, rgba(4, 61, 208, 0.35) 0%, transparent 55%), ' +
    'radial-gradient(circle at 100% 100%, rgba(245, 179, 0, 0.30) 0%, transparent 55%), ' +
    colors.club.background;

  const starfieldOverlay =
    'radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%), ' +
    'radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.08) 0%, transparent 55%)';

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100%',
        height: '100%',
        background: nebulaBackground,
        overflow: 'visible',
        ...style,
      }}
    >
      {/* Starfield */}
      {variant === 'full' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: starfieldOverlay,
            opacity: 0.4,
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Stars (RealVerse Floating Particles) */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, pointerEvents: 'none' }}>
        {stars.map((star) => {
          const delay = Math.random() * 6;
          return (
            <div
              key={star.id}
              className="rv-star"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: `${delay}s`,
                opacity: star.opacity,
              }}
            />
          );
        })}
      </div>

      {/* Nebula accents */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(4, 61, 208, 0.2) 0%, transparent 70%)`,
          filter: 'blur(60px)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(255, 169, 0, 0.15) 0%, transparent 70%)`,
          filter: 'blur(80px)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Content - Always render on top */}
      {children && (
        <div style={{ 
          position: 'relative', 
          zIndex: 100, 
          width: '100%', 
          minHeight: '100%',
          pointerEvents: 'auto',
        }}>
          {children}
        </div>
      )}
    </div>
  );
};

