import React from 'react';
import { PublicPageHeader } from './PublicPageHeader';
import { Footer } from './Footer';
import { User } from '../../types';

interface PublicPageLayoutProps {
  children: React.ReactNode;
  user?: User | null;
  onSignOut?: () => void;
}

export const PublicPageLayout: React.FC<PublicPageLayoutProps> = ({ children, user, onSignOut }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <PublicPageHeader user={user} onSignOut={onSignOut} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};
