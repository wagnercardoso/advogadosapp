import React from 'react';

interface JusticeLogoProps {
  className?: string;
  size?: number;
}

export const JusticeLogo: React.FC<JusticeLogoProps> = ({ className = 'w-9 h-9', size = 36 }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_2px_8px_rgba(212,175,55,0.35)]"
      >
        {/* Glow / Outer Shield accent */}
        <path
          d="M32 4L48 10V28C48 40.5 32 58 32 58C32 58 16 40.5 16 28V10L32 4Z"
          fill="#111622"
          stroke="#C5A059"
          strokeWidth="1.5"
          strokeLinejoin="round"
          opacity="0.85"
        />

        {/* Central Pillar / Sword */}
        <line x1="32" y1="12" x2="32" y2="48" stroke="#DFB86C" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="32" cy="12" r="2.5" fill="#FFE599" stroke="#C5A059" strokeWidth="1" />
        <line x1="28" y1="48" x2="36" y2="48" stroke="#C5A059" strokeWidth="2" strokeLinecap="round" />

        {/* Balance Beam */}
        <line x1="18" y1="20" x2="46" y2="20" stroke="#E5C058" strokeWidth="2" strokeLinecap="round" />

        {/* Left Scale Strings & Pan */}
        <line x1="20" y1="20" x2="15" y2="31" stroke="#C5A059" strokeWidth="1" strokeDasharray="1 1" />
        <line x1="20" y1="20" x2="25" y2="31" stroke="#C5A059" strokeWidth="1" strokeDasharray="1 1" />
        <path
          d="M13 31C13 34.5 16.5 37 20 37C23.5 37 27 34.5 27 31H13Z"
          fill="#C5A059"
          fillOpacity="0.4"
          stroke="#DFB86C"
          strokeWidth="1.5"
        />

        {/* Right Scale Strings & Pan */}
        <line x1="44" y1="20" x2="39" y2="31" stroke="#C5A059" strokeWidth="1" strokeDasharray="1 1" />
        <line x1="44" y1="20" x2="49" y2="31" stroke="#C5A059" strokeWidth="1" strokeDasharray="1 1" />
        <path
          d="M37 31C37 34.5 40.5 37 44 37C47.5 37 51 34.5 51 31H37Z"
          fill="#C5A059"
          fillOpacity="0.4"
          stroke="#DFB86C"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
};
