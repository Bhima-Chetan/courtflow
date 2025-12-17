'use client';

import './animated-logo.css';

interface AnimatedLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function AnimatedLogo({ size = 'md', showText = true }: AnimatedLogoProps) {
  const sizeMap = {
    sm: 32,
    md: 40,
    lg: 56
  };

  const textSizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const logoSize = sizeMap[size];

  return (
    <div className="flex items-center gap-3">
      <div className="animated-logo-container" style={{ width: logoSize, height: logoSize }}>
        <img 
          src="/courtflow-logo.png" 
          alt="CourtFlow Logo" 
          className="animated-logo-image"
        />
      </div>
      {showText && (
        <div className="animated-logo-text">
          <h1 className={`${textSizeClasses[size]} font-bold logo-title`}>
            {'CourtFlow'.split('').map((letter, index) => (
              <span 
                key={index} 
                className="logo-char"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {letter}
              </span>
            ))}
          </h1>
          <p className="text-xs text-dark-400 logo-subtitle">Premium Court Booking</p>
        </div>
      )}
    </div>
  );
}
