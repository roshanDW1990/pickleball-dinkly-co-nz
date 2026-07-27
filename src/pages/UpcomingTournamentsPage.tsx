import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PublicPageHeader } from '../components/common/PublicPageHeader';
import { Footer } from '../components/common/Footer';
import { TournamentCard } from '../components/dashboard/TournamentCard';
import { useTournaments } from '../hooks/useTournaments';
import { User } from '../types';
import { Trophy, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/common/Toast';

interface UpcomingTournamentsPageProps {
  user?: User | null;
  onSignOut?: () => void;
}

export const UpcomingTournamentsPage: React.FC<UpcomingTournamentsPageProps> = ({ user, onSignOut }) => {
  const { tournaments, loading, isRegistered, fetchRegistrations } = useTournaments(user?.id);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [processingTournament, setProcessingTournament] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const registration = searchParams.get('registration');
    const tournamentId = searchParams.get('tournament');
    const sessionId = searchParams.get('session_id');
    const registrationId = searchParams.get('registration_id');

    if (registration === 'success' && tournamentId) {
      setSuccessMessage('Payment confirmed! Your registration is being processed...');

      const verifyAndRefresh = async () => {
        if (sessionId && registrationId) {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`;
              await fetch(apiUrl, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${session.access_token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ session_id: sessionId, registration_id: registrationId }),
              });
            }
          } catch (err) {
            console.error('Error verifying payment:', err);
          }
        }
        fetchRegistrations();
        setSuccessMessage('Registration successful! You will receive a confirmation email shortly.');
      };

      verifyAndRefresh();

      const timer = setTimeout(() => {
        setSuccessMessage(null);
        searchParams.delete('registration');
        searchParams.delete('tournament');
        searchParams.delete('session_id');
        searchParams.delete('registration_id');
        setSearchParams(searchParams);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [searchParams, setSearchParams, fetchRegistrations]);

  const handleRegister = async (tournamentId: string) => {
    if (!user) {
      navigate('/?mode=signin');
      return;
    }

    try {
      setProcessingTournament(tournamentId);

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate('/?mode=signin');
        return;
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tournamentId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create checkout session');
      }

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast(error instanceof Error ? error.message : 'Failed to process registration', 'error');
    } finally {
      setProcessingTournament(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <PublicPageHeader user={user} onSignOut={onSignOut} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center text-slate-600 hover:text-green-600 mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          ) : (
            <Link
              to="/"
              className="inline-flex items-center text-slate-600 hover:text-green-600 mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          )}

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-green-600 p-3 rounded-lg mr-4">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Upcoming Leagues</h1>
                <p className="text-slate-600">Browse and register for leagues</p>
              </div>
            </div>
            <div className="text-slate-600">
              <span className="font-medium">{tournaments.length}</span> league{tournaments.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : tournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {tournaments.map(tournament => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
                onRegister={handleRegister}
                loading={processingTournament === tournament.id}
                isRegistered={isRegistered(tournament.id)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
            <Trophy className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No leagues found</h3>
            <p className="text-slate-600">
              There are no upcoming leagues at the moment. Check back soon!
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
