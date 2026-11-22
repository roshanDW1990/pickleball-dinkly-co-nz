const MEASUREMENT_ID = 'G-QN4NDD66D4';
const CONSENT_KEY = 'dinkly_cookie_consent';
export const OPEN_COOKIE_PREFERENCES_EVENT = 'dinkly:open-cookie-preferences';

export type ConsentChoice = 'accepted' | 'declined';

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

const isLiveSite = () =>
  import.meta.env.PROD && !['localhost', '127.0.0.1'].includes(window.location.hostname);

export const getConsent = (): ConsentChoice | null => {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === 'accepted' || value === 'declined' ? value : null;
  } catch {
    return null;
  }
};

const isTrackingAllowed = () => isLiveSite() && getConsent() === 'accepted';

const loadGoogleAnalytics = () => {
  if (window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag.js requires the raw arguments object, not an array
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, { send_page_view: false, anonymize_ip: true });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);
};

export const initAnalytics = () => {
  if (!isTrackingAllowed()) return;
  (window as unknown as Record<string, boolean>)[`ga-disable-${MEASUREMENT_ID}`] = false;
  loadGoogleAnalytics();
};

export const setConsent = (choice: ConsentChoice) => {
  try {
    localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    // Storage unavailable (private mode); choice applies to this visit only
  }
  if (choice === 'accepted') {
    initAnalytics();
  } else {
    (window as unknown as Record<string, boolean>)[`ga-disable-${MEASUREMENT_ID}`] = true;
  }
};

export const openCookiePreferences = () => {
  window.dispatchEvent(new Event(OPEN_COOKIE_PREFERENCES_EVENT));
};

const PAGE_TITLES: Record<string, string> = {
  '/': 'Home',
  '/upcoming-leagues': 'Leagues',
  '/standings': 'League Standings',
  '/standings/archived': 'Archived Standings',
  '/faq': 'FAQ',
  '/how-it-works': 'How It Works',
  '/about': 'About',
  '/contact': 'Contact',
  '/dashboard': 'Member Dashboard',
  '/details': 'My Details',
  '/registrations': 'My Registrations',
  '/results': 'Submit Results',
  '/match-history': 'Match History',
  '/privacy-policy': 'Privacy Policy',
  '/cookies': 'Cookie Policy',
  '/terms-of-service': 'Terms of Service',
  '/rules-and-regulations': 'Rules & Regulations',
  '/code-of-conduct': 'Code of Conduct',
  '/refund-policy': 'Refund Policy',
  '/reset-password': 'Reset Password',
};

const getPageTitle = (path: string) => {
  if (PAGE_TITLES[path]) return PAGE_TITLES[path];
  if (path.startsWith('/standings/')) return 'League Standings - League';
  return 'Dinkly';
};

export const isExcludedPath = (path: string) => path.startsWith('/admin');

export const trackPageView = (path: string) => {
  if (!isTrackingAllowed() || isExcludedPath(path) || !window.gtag) return;
  window.gtag('event', 'page_view', {
    page_title: getPageTitle(path),
    page_path: path,
    page_location: `${window.location.origin}${path}`,
  });
};

export const trackEvent = (name: string, params: Record<string, string | number> = {}) => {
  if (!isTrackingAllowed() || isExcludedPath(window.location.pathname) || !window.gtag) return;
  window.gtag('event', name, params);
};
