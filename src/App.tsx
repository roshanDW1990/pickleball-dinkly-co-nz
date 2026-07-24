import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthPage } from './components/auth/AuthPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { UpcomingTournamentsPage } from './pages/UpcomingTournamentsPage';
import { DetailsPage } from './pages/DetailsPage';
import { RegistrationsPage } from './pages/RegistrationsPage';
import { PublicPageLayout } from './components/common/PublicPageLayout';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { FAQPage } from './pages/FAQPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { RulesAndRegulationsPage } from './pages/RulesAndRegulationsPage';
import { CodeOfConductPage } from './pages/CodeOfConductPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { ResultsPage } from './pages/ResultsPage';
import { StandingsPage } from './pages/StandingsPage';
import { LeagueStandingsPage } from './pages/LeagueStandingsPage';
import { ArchivedStandingsPage } from './pages/ArchivedStandingsPage';
import { MatchHistoryPage } from './pages/MatchHistoryPage';
import { AdminDashboard } from './admin/pages/AdminDashboard';
import { ScrollToTop } from './components/common/ScrollToTop';
import { useAuth } from './hooks/useAuth';
import { ToastProvider } from './components/common/Toast';

function AppContent() {
  const { isAuthenticated, user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      if (location.pathname === '/auth') {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, loading, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<AuthPage />} />
      <Route path="/about" element={
        <PublicPageLayout user={user} onSignOut={signOut}>
          <AboutPage />
        </PublicPageLayout>
      } />
      <Route path="/contact" element={
        <PublicPageLayout user={user} onSignOut={signOut}>
          <ContactPage />
        </PublicPageLayout>
      } />
      <Route path="/faq" element={
        <PublicPageLayout user={user} onSignOut={signOut}>
          <FAQPage />
        </PublicPageLayout>
      } />
      <Route path="/how-it-works" element={
        <PublicPageLayout user={user} onSignOut={signOut}>
          <HowItWorksPage />
        </PublicPageLayout>
      } />
      <Route path="/privacy-policy" element={
        <PublicPageLayout user={user} onSignOut={signOut}>
          <PrivacyPolicyPage />
        </PublicPageLayout>
      } />
      <Route path="/rules-and-regulations" element={
        <PublicPageLayout user={user} onSignOut={signOut}>
          <RulesAndRegulationsPage />
        </PublicPageLayout>
      } />
      <Route path="/code-of-conduct" element={
        <PublicPageLayout user={user} onSignOut={signOut}>
          <CodeOfConductPage />
        </PublicPageLayout>
      } />
      <Route path="/terms-of-service" element={
        <PublicPageLayout user={user} onSignOut={signOut}>
          <TermsOfServicePage />
        </PublicPageLayout>
      } />
      <Route
        path="/dashboard"
        element={
          isAuthenticated && user ? (
            <Dashboard user={user} onSignOut={signOut} />
          ) : (
            <AuthPage />
          )
        }
      />
      <Route path="/upcoming-tournaments" element={
        <UpcomingTournamentsPage user={user} onSignOut={signOut} />
      } />
      <Route
        path="/details"
        element={
          isAuthenticated && user ? (
            <DetailsPage user={user} onSignOut={signOut} />
          ) : (
            <AuthPage />
          )
        }
      />
      <Route
        path="/registrations"
        element={
          isAuthenticated && user ? (
            <RegistrationsPage user={user} onSignOut={signOut} />
          ) : (
            <AuthPage />
          )
        }
      />
      <Route
        path="/results"
        element={
          isAuthenticated && user ? (
            <ResultsPage user={user} onSignOut={signOut} />
          ) : (
            <AuthPage />
          )
        }
      />
      <Route path="/standings" element={
        <StandingsPage user={user} onSignOut={signOut} />
      } />
      <Route path="/standings/archived" element={
        <ArchivedStandingsPage user={user} onSignOut={signOut} />
      } />
      <Route path="/standings/:leagueId" element={
        <LeagueStandingsPage user={user} onSignOut={signOut} />
      } />
      <Route
        path="/match-history"
        element={
          isAuthenticated && user ? (
            <MatchHistoryPage user={user} onSignOut={signOut} />
          ) : (
            <AuthPage />
          )
        }
      />
      <Route
        path="/admin"
        element={
          isAuthenticated && user && user.isAdmin ? (
            <AdminDashboard user={user} onSignOut={signOut} />
          ) : isAuthenticated && user ? (
            <Dashboard user={user} onSignOut={signOut} />
          ) : (
            <AuthPage />
          )
        }
      />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ToastProvider>
      <Router>
        <AppContent />
      </Router>
    </ToastProvider>
  );
}

export default App;