import React from 'react';

interface DinklyLogoProps {
  className?: string;
}

export const DinklyLogo: React.FC<DinklyLogoProps> = ({ className }) => (
  <svg
    viewBox="0 0 200 200"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <radialGradient id="dl-ball" cx="37%" cy="32%" r="65%" fx="34%" fy="29%">
        <stop offset="0%"   stopColor="#bbf7d0"/>
        <stop offset="28%"  stopColor="#22c55e"/>
        <stop offset="65%"  stopColor="#16a34a"/>
        <stop offset="100%" stopColor="#14532d"/>
      </radialGradient>
      <radialGradient id="dl-hole" cx="38%" cy="28%" r="62%">
        <stop offset="0%"   stopColor="#1a3d1a"/>
        <stop offset="100%" stopColor="#020a02"/>
      </radialGradient>
      <linearGradient id="dl-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stopColor="#22c55e"/>
        <stop offset="100%" stopColor="#16a34a"/>
      </linearGradient>
      <clipPath id="dl-clip">
        <circle cx="100" cy="100" r="62"/>
      </clipPath>
    </defs>

    {/* Green rounded-square background */}
    <rect x="4" y="4" width="192" height="192" rx="40" ry="40" fill="url(#dl-bg)"/>

    {/* Ball body */}
    <circle cx="100" cy="100" r="64" fill="url(#dl-ball)"/>
    <circle cx="100" cy="100" r="64" fill="none" stroke="#0d4d1f" strokeWidth="1.8"/>

    {/* Holes clipped to ball surface */}
    <g clipPath="url(#dl-clip)" fill="url(#dl-hole)">
      {/* Row 1 */}
      <circle cx="74"  cy="48"  r="6"/>
      <circle cx="100" cy="44"  r="6"/>
      <circle cx="126" cy="48"  r="6"/>
      {/* Row 2 */}
      <circle cx="58"  cy="67"  r="6"/>
      <circle cx="84"  cy="63"  r="6"/>
      <circle cx="116" cy="63"  r="6"/>
      <circle cx="142" cy="67"  r="6"/>
      {/* Row 3 */}
      <circle cx="46"  cy="88"  r="6"/>
      <circle cx="72"  cy="84"  r="6"/>
      <circle cx="100" cy="82"  r="6"/>
      <circle cx="128" cy="84"  r="6"/>
      <circle cx="154" cy="88"  r="6"/>
      {/* Row 4 equator */}
      <circle cx="42"  cy="108" r="6"/>
      <circle cx="68"  cy="104" r="6"/>
      <circle cx="97"  cy="103" r="6"/>
      <circle cx="126" cy="104" r="6"/>
      <circle cx="154" cy="109" r="6"/>
      {/* Row 5 */}
      <circle cx="54"  cy="127" r="6"/>
      <circle cx="80"  cy="123" r="6"/>
      <circle cx="108" cy="122" r="6"/>
      <circle cx="136" cy="126" r="6"/>
      {/* Row 6 */}
      <circle cx="68"  cy="144" r="6"/>
      <circle cx="98"  cy="142" r="6"/>
      <circle cx="128" cy="145" r="6"/>
      {/* Row 7 */}
      <circle cx="88"  cy="158" r="6"/>
      <circle cx="112" cy="157" r="6"/>
    </g>

    {/* Specular gloss highlight */}
    <ellipse cx="76" cy="72" rx="18" ry="12"
      fill="white" opacity="0.18"
      transform="rotate(-35,76,72)"
    />
  </svg>
);
