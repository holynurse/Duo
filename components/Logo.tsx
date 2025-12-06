import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  variant?: 'default' | 'medical';
}

// Two overlapping speech bubbles to represent "Duo"
const Logo: React.FC<LogoProps> = ({ size = 64, className = '', variant = 'default' }) => {
  const primary = variant === 'medical' ? '#0f766e' : '#2563eb';
  const secondary = variant === 'medical' ? '#14b8a6' : '#38bdf8';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      aria-label="Duo logo"
      role="img"
      fill="none"
    >
      <path
        d="M8 18c0-6.075 4.925-11 11-11h19c6.075 0 11 4.925 11 11v11c0 6.075-4.925 11-11 11H23l-7 7v-7h-4c-6.075 0-11-4.925-11-11V18Z"
        fill={primary}
      />
      <path
        d="M24 27c0-5.523 4.477-10 10-10h13c5.523 0 10 4.477 10 10v9c0 5.523-4.477 10-10 10h-6l-5.5 5.5V46h-2.5c-5.523 0-10-4.477-10-10v-9Z"
        fill={secondary}
        opacity="0.92"
      />
    </svg>
  );
};

export default Logo;
