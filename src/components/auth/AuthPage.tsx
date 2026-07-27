import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Users, Calendar, Award, Trophy, ArrowRight, UserPlus, Users as Users2, Heart } from 'lucide-react';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { EmailVerificationPage } from './EmailVerificationPage';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { HeaderAuth } from './HeaderAuth';
import { PublicPageHeader } from '../common/PublicPageHeader';
import { Footer } from '../common/Footer';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAuth } from '../../hooks/useAuth';

export const AuthPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const { signIn, signUp, signOut, resendVerification, sendPasswordResetLink, loading, pendingVerification, user, pendingVerificationEmail } = useAuth();

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signin') {
      handleOpenSignIn();
    } else if (mode === 'signup') {
      handleOpenSignUp();
    }
  }, [searchParams]);

  const handleOpenSignIn = () => {
    setIsSignUpModalOpen(false);
    setIsForgotPasswordModalOpen(false);
    setIsSignInModalOpen(true);
  };

  const handleOpenSignUp = () => {
    setIsSignInModalOpen(false);
    setIsForgotPasswordModalOpen(false);
    setIsSignUpModalOpen(true);
  };

  const handleOpenForgotPassword = () => {
    setIsSignInModalOpen(false);
    setIsSignUpModalOpen(false);
    setIsForgotPasswordModalOpen(true);
  };

  const closeAllModals = () => {
    setIsSignInModalOpen(false);
    setIsSignUpModalOpen(false);
    setIsForgotPasswordModalOpen(false);
  };

  if (pendingVerification && pendingVerificationEmail) {
    return (
      <EmailVerificationPage
        user={user}
        userEmail={pendingVerificationEmail}
        onResendVerification={resendVerification}
        onBackToSignIn={() => {
          closeAllModals();
          handleOpenSignIn();
        }}
        loading={loading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      {user ? (
        <PublicPageHeader user={user} onSignOut={signOut} />
      ) : (
        <HeaderAuth
          isSignUp={false}
          onSwitchToSignIn={handleOpenSignIn}
          onSwitchToSignUp={handleOpenSignUp}
        />
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-emerald-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              Play More Pickleball
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Join local round-robin leagues, meet new players, and enjoy competitive games that fit your schedule.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/70 transition-all duration-300 transform hover:-translate-y-1">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Local Community</h3>
              <p className="text-slate-600">Find and connect with pickleball players in your area</p>
            </div>
            <Link to="/upcoming-tournaments" className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/70 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
              <Calendar className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Leagues</h3>
              <p className="text-slate-600">Join competitive leagues and organised matches</p>
            </Link>
            <Link to="/standings" className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/70 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
              <Award className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Rankings</h3>
              <p className="text-slate-600">Track your progress and climb the leaderboards</p>
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">How It Works</h2>
          <div className="w-20 h-1 bg-green-600 mx-auto rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/90 transition-all duration-300 transform hover:-translate-y-1 shadow-sm">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4 relative">
              <UserPlus className="h-6 w-6 text-green-600" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-600 text-white text-xs font-bold rounded-full flex items-center justify-center">1</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Create your profile</h3>
            <p className="text-slate-600 text-sm">Tell us your location and skill level.</p>
          </div>
          <div className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/90 transition-all duration-300 transform hover:-translate-y-1 shadow-sm">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4 relative">
              <Users2 className="h-6 w-6 text-green-600" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-600 text-white text-xs font-bold rounded-full flex items-center justify-center">2</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Join the community</h3>
            <p className="text-slate-600 text-sm">Connect with local players and groups.</p>
          </div>
          <div className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/90 transition-all duration-300 transform hover:-translate-y-1 shadow-sm">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4 relative">
              <svg className="h-6 w-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="9.5" cy="9.5" rx="6.5" ry="6.5" transform="rotate(-45 9.5 9.5)" />
                <line x1="14" y1="14" x2="21" y2="21" />
                <circle cx="7.5" cy="9.5" r="1" fill="currentColor" stroke="none" />
                <circle cx="11.5" cy="9.5" r="1" fill="currentColor" stroke="none" />
                <circle cx="9.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
                <circle cx="9.5" cy="11.5" r="1" fill="currentColor" stroke="none" />
              </svg>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-600 text-white text-xs font-bold rounded-full flex items-center justify-center">3</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Play and compete</h3>
            <p className="text-slate-600 text-sm">Sign up for leagues and events.</p>
          </div>
          <div className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/90 transition-all duration-300 transform hover:-translate-y-1 shadow-sm">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4 relative">
              <Heart className="h-6 w-6 text-green-600" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-600 text-white text-xs font-bold rounded-full flex items-center justify-center">4</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Grow your network</h3>
            <p className="text-slate-600 text-sm">Build lasting friendships on and off the court.</p>
          </div>
        </div>
      </div>

      {/* Upcoming Tournaments Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-2xl p-8 md:p-12 border border-green-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
              <Trophy className="h-8 w-8 text-white" />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Discover Upcoming Leagues
            </h2>

            <p className="text-xl text-green-50 max-w-2xl mx-auto mb-8">
              Join exciting pickleball leagues in your area. Compete with players at your skill level and climb the rankings!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/upcoming-tournaments">
                <Button
                  variant="outline"
                  className="bg-white text-green-600 border-white hover:bg-green-50 hover:text-green-700 font-semibold px-8 py-3 text-lg"
                >
                  Upcoming Leagues
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={isSignInModalOpen} onClose={closeAllModals} size="md">
        <SignInForm
          onSignIn={signIn}
          loading={loading}
          onSwitchToSignUp={handleOpenSignUp}
          onForgotPassword={handleOpenForgotPassword}
          onSuccess={closeAllModals}
        />
      </Modal>

      <Modal isOpen={isSignUpModalOpen} onClose={closeAllModals} size="lg">
        <SignUpForm
          onSignUp={signUp}
          loading={loading}
          onSwitchToSignIn={handleOpenSignIn}
          onSuccess={closeAllModals}
        />
      </Modal>

      <Modal isOpen={isForgotPasswordModalOpen} onClose={closeAllModals} size="md">
        <ForgotPasswordForm
          onSendResetLink={sendPasswordResetLink}
          onBackToSignIn={handleOpenSignIn}
          loading={loading}
        />
      </Modal>

      {/* Footer */}
      <Footer />
    </div>
  );
};