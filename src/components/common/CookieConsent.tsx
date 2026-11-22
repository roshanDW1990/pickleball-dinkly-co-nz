import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Cookie, X } from 'lucide-react';
import {
  getConsent,
  setConsent,
  trackPageView,
  OPEN_COOKIE_PREFERENCES_EVENT,
  type ConsentChoice,
} from '../../lib/analytics';

export const CookieConsent: React.FC = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(() => getConsent() === null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const open = () => setVisible(true);
    window.addEventListener(OPEN_COOKIE_PREFERENCES_EVENT, open);
    return () => window.removeEventListener(OPEN_COOKIE_PREFERENCES_EVENT, open);
  }, []);

  useEffect(() => {
    if (!visible) {
      setEntered(false);
      return;
    }
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, [visible]);

  const choose = (choice: ConsentChoice) => {
    setConsent(choice);
    if (choice === 'accepted') trackPageView(location.pathname);
    setVisible(false);
  };

  if (!visible) return null;

  const current = getConsent();

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie preferences"
      className={`fixed z-[60] inset-x-4 bottom-4 sm:inset-x-auto sm:left-6 sm:bottom-6 sm:max-w-md transition-all duration-500 ease-out ${
        entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      <div className="relative bg-slate-900 text-white rounded-2xl shadow-2xl ring-1 ring-white/10 p-6">
        {current && (
          <button
            onClick={() => setVisible(false)}
            className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close cookie preferences"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-green-500/15 flex items-center justify-center">
            <Cookie className="h-5 w-5 text-green-400" />
          </div>
          <div className="pr-4">
            <h2 className="text-base font-semibold leading-tight mb-2">We value your privacy</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              We'd like to use analytics cookies to understand how players use Dinkly so we can make it better.
              We never share your name, email or phone number.{' '}
              <Link to="/cookies" className="text-green-400 hover:text-green-300 underline underline-offset-2">
                Read our Cookie Policy
              </Link>
            </p>
            {current && (
              <p className="mt-2 text-xs text-slate-400">
                Current choice: {current === 'accepted' ? 'Analytics allowed' : 'Analytics declined'}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <button
            onClick={() => choose('declined')}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-200 bg-white/5 hover:bg-white/10 ring-1 ring-white/15 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={() => choose('accepted')}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-500 shadow-lg shadow-green-900/30 transition-all hover:-translate-y-0.5"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};
