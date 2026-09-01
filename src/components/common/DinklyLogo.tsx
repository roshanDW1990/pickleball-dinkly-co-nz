import React from 'react';

interface DinklyLogoProps {
  className?: string;
}

export const DinklyLogo: React.FC<DinklyLogoProps> = ({ className }) => (
  <img src="/dinkly-logo.svg" alt="Dinkly" className={className} />
);
