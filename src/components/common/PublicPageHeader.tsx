import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { DinklyLogo } from './DinklyLogo';
import { Button } from './Button';
import { User as UserType } from '../../types';

interface PublicPageHeaderProps {
  user?: UserType | null;
  onSignOut?: () => void;
}

export const PublicPageHeader: React.FC<PublicPageHeaderProps> = ({ user, onSignOut }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <DinklyLogo className="h-9 w-9 mr-2" />
            <h1 className="text-xl font-bold text-slate-800">Dinkly</h1>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/standings" className="text-slate-600 hover:text-green-600 transition-colors">
              Standings
            </Link>
            <Link to="/about" className="text-slate-600 hover:text-green-600 transition-colors">
              About
            </Link>
            <Link to="/how-it-works" className="text-slate-600 hover:text-green-600 transition-colors">
              How It Works
            </Link>
            <Link to="/faq" className="text-slate-600 hover:text-green-600 transition-colors">
              FAQ
            </Link>
            <Link to="/contact" className="text-slate-600 hover:text-green-600 transition-colors">
              Contact
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center space-x-2"
                >
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden md:inline text-slate-700">My Account</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSignOut}
                  className="text-slate-600 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/?mode=signin')}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
