import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, User, LogOut, ChevronDown, Shield } from 'lucide-react';
import { DinklyLogo } from '../common/DinklyLogo';
import { Button } from '../common/Button';
import { User as UserType } from '../../types';

interface HeaderProps {
  user: UserType;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onSignOut }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity cursor-pointer">
            <DinklyLogo className="h-9 w-9 mr-2" />
            <h1 className="text-xl font-bold text-slate-800">Dinkly</h1>
          </Link>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/upcoming-tournaments" className="text-slate-600 hover:text-green-600 transition-colors">
              Upcoming Leagues
            </Link>
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

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors duration-200">
              <Bell className="h-5 w-5" />
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 hover:bg-slate-50 rounded-lg p-2 transition-colors duration-200"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-slate-800">{user.firstName} {user.lastName}</p>
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-600 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-150"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate('/details');
                    }}
                  >
                    Details
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-150"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate('/results');
                    }}
                  >
                    Results
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-150"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate('/match-history');
                    }}
                  >
                    Match History
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-150"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate('/registrations');
                    }}
                  >
                    Registrations
                  </button>
                  {user.isAdmin && (
                    <>
                      <hr className="my-2 border-slate-200" />
                      <a
                        href="/admin"
                        className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 transition-colors duration-150 flex items-center space-x-2"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Shield className="h-4 w-4" />
                        <span>Admin Panel</span>
                      </a>
                    </>
                  )}
                  <hr className="my-2 border-slate-200" />
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 flex items-center space-x-2"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onSignOut();
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};