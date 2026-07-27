import React from 'react';

interface DinklyLogoProps {
  className?: string;
}

export const DinklyLogo: React.FC<DinklyLogoProps> = ({ className }) => (
  <svg
    viewBox="0 0 200 200"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ filter: 'drop-shadow(0 10px 28px rgba(0,80,0,0.28))' }}
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
      <clipPath id="dl-clip">
        <circle cx="100" cy="100" r="87"/>
      </clipPath>
    </defs>

    {/* Ball body */}
    <circle cx="100" cy="100" r="90" fill="url(#dl-ball)"/>
    {/* Dark edge */}
    <circle cx="100" cy="100" r="90" fill="none" stroke="#0d4d1f" strokeWidth="2.5"/>

    {/* 26 holes clipped to ball surface */}
    <g clipPath="url(#dl-clip)" fill="url(#dl-hole)">
      {/* Row 1 */}
      <circle cx="63"  cy="30"  r="8.5"/>
      <circle cx="100" cy="24"  r="8.5"/>
      <circle cx="137" cy="30"  r="8.5"/>
      {/* Row 2 */}
      <circle cx="42"  cy="56"  r="8.5"/>
      <circle cx="78"  cy="50"  r="8.5"/>
      <circle cx="122" cy="50"  r="8.5"/>
      <circle cx="158" cy="56"  r="8.5"/>
      {/* Row 3 */}
      <circle cx="27"  cy="83"  r="8.5"/>
      <circle cx="63"  cy="77"  r="8.5"/>
      <circle cx="100" cy="74"  r="8.5"/>
      <circle cx="137" cy="77"  r="8.5"/>
      <circle cx="173" cy="83"  r="8.5"/>
      {/* Row 4 equator */}
      <circle cx="22"  cy="108" r="8.5"/>
      <circle cx="58"  cy="104" r="8.5"/>
      <circle cx="97"  cy="102" r="8.5"/>
      <circle cx="136" cy="104" r="8.5"/>
      <circle cx="173" cy="109" r="8.5"/>
      {/* Row 5 */}
      <circle cx="38"  cy="133" r="8.5"/>
      <circle cx="74"  cy="129" r="8.5"/>
      <circle cx="113" cy="128" r="8.5"/>
      <circle cx="152" cy="132" r="8.5"/>
      {/* Row 6 */}
      <circle cx="58"  cy="157" r="8.5"/>
      <circle cx="98"  cy="154" r="8.5"/>
      <circle cx="140" cy="158" r="8.5"/>
      {/* Row 7 */}
      <circle cx="88"  cy="178" r="8.5"/>
      <circle cx="118" cy="176" r="8.5"/>
    </g>

    {/* Specular gloss highlight */}
    <ellipse cx="68" cy="57" rx="26" ry="17"
      fill="white" opacity="0.22"
      transform="rotate(-35,68,57)"
    />
  </svg>
);
