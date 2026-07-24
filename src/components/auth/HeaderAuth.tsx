import React from 'react';
import { DinklyLogo } from '../common/DinklyLogo';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';

interface HeaderAuthProps {
  isSignUp: boolean;
  onSwitchToSignIn: () => void;
  onSwitchToSignUp: () => void;
}

export const HeaderAuth: React.FC<HeaderAuthProps> = ({
  isSignUp,
  onSwitchToSignIn,
  onSwitchToSignUp
}) => {
  return (
    <header className="relative z-10 bg-white/95 backdrop-blur-md border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <DinklyLogo className="h-10 w-10 mr-2" />
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Dinkly</h1>
            </div>
          </Link>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/upcoming-tournaments"
              className="text-slate-700 hover:text-green-600 font-medium transition-colors duration-200 relative group"
            >
              Leagues
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link
              to="/how-it-works"
              className="text-slate-700 hover:text-green-600 font-medium transition-colors duration-200 relative group"
            >
              How It Works
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link
              to="/about"
              className="text-slate-700 hover:text-green-600 font-medium transition-colors duration-200 relative group"
            >
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link
              to="/contact"
              className="text-slate-700 hover:text-green-600 font-medium transition-colors duration-200 relative group"
            >
              Contact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-200 group-hover:w-full"></span>
            </Link>
            
            <div className="flex items-center space-x-3 ml-6 pl-6 border-l border-slate-200">
              <Button
                onClick={onSwitchToSignIn}
                variant={!isSignUp ? "primary" : "ghost"}
                size="sm"
                className={!isSignUp ? "shadow-md" : "text-slate-700 hover:text-green-600"}
              >
                Log In
              </Button>
              <Button
                onClick={onSwitchToSignUp}
                variant={isSignUp ? "primary" : "outline"}
                size="sm"
                className={isSignUp ? "shadow-md" : "border-green-600 text-green-600 hover:bg-green-600 hover:text-white"}
              >
                Sign Up
              </Button>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <Button
              onClick={onSwitchToSignIn}
              variant={!isSignUp ? "primary" : "ghost"}
              size="sm"
              className="text-xs"
            >
              Log In
            </Button>
            <Button
              onClick={onSwitchToSignUp}
              variant={isSignUp ? "primary" : "outline"}
              size="sm"
              className="text-xs"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};