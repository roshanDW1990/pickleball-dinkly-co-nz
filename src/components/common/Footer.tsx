import React from 'react';
import { Instagram, Facebook } from 'lucide-react';
import { DinklyLogo } from './DinklyLogo';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <DinklyLogo className="h-10 w-10 mr-3" />
              <div>
                <h3 className="text-xl font-bold">Dinkly</h3>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Building the ultimate platform for pickleball enthusiasts to connect, compete, and grow together in local communities worldwide.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-slate-700 p-2 rounded-lg hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 transition-all duration-300 transform hover:scale-110"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>


              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-slate-700 p-2 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-110"
                aria-label="Like us on Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/about" 
                  className="text-slate-400 hover:text-green-400 transition-colors duration-200 text-sm flex items-center group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-green-400 transition-all duration-200 mr-0 group-hover:mr-2"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-slate-400 hover:text-green-400 transition-colors duration-200 text-sm flex items-center group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-green-400 transition-all duration-200 mr-0 group-hover:mr-2"></span>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/upcoming-tournaments"
                  className="text-slate-400 hover:text-green-400 transition-colors duration-200 text-sm flex items-center group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-green-400 transition-all duration-200 mr-0 group-hover:mr-2"></span>
                  Leagues
                </Link>
              </li>
              <li>
                <Link
                  to="/standings"
                  className="text-slate-400 hover:text-green-400 transition-colors duration-200 text-sm flex items-center group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-green-400 transition-all duration-200 mr-0 group-hover:mr-2"></span>
                  Standings
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/faq" 
                  className="text-slate-400 hover:text-green-400 transition-colors duration-200 text-sm flex items-center group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-green-400 transition-all duration-200 mr-0 group-hover:mr-2"></span>
                  FAQ
                </Link>
              </li>
              <li>
                <Link 
                  to="/how-it-works" 
                  className="text-slate-400 hover:text-green-400 transition-colors duration-200 text-sm flex items-center group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-green-400 transition-all duration-200 mr-0 group-hover:mr-2"></span>
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/privacy-policy" 
                  className="text-slate-400 hover:text-green-400 transition-colors duration-200 text-sm flex items-center group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-green-400 transition-all duration-200 mr-0 group-hover:mr-2"></span>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/rules-and-regulations" 
                  className="text-slate-400 hover:text-green-400 transition-colors duration-200 text-sm flex items-center group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-green-400 transition-all duration-200 mr-0 group-hover:mr-2"></span>
                  Rules & Regulations
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms-of-service" 
                  className="text-slate-400 hover:text-green-400 transition-colors duration-200 text-sm flex items-center group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-green-400 transition-all duration-200 mr-0 group-hover:mr-2"></span>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link 
                  to="/code-of-conduct" 
                  className="text-slate-400 hover:text-green-400 transition-colors duration-200 text-sm flex items-center group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-green-400 transition-all duration-200 mr-0 group-hover:mr-2"></span>
                  Code of Conduct
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-slate-700 pt-8 mb-8">
          <div className="max-w-md mx-auto text-center">
            <h4 className="text-lg font-semibold mb-2 text-white">Stay Updated</h4>
            <p className="text-slate-400 text-sm mb-4">
              Get the latest league announcements and community updates
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-slate-400"
              />
              <button className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-r-lg transition-colors duration-200 font-medium">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-slate-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Dinkly. All rights reserved. Built with passion for pickleball players everywhere.
          </div>
          <div className="flex space-x-6 text-sm">
            <Link to="/cookies" className="text-slate-400 hover:text-green-400 transition-colors duration-200">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};