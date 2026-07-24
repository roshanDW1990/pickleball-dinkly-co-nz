import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PublicPageHeader } from '../components/common/PublicPageHeader';
import { Footer } from '../components/common/Footer';
import { Trophy, ArrowRight, Calendar, Users, Trash2 } from 'lucide-react';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/common/Toast';

interface ArchivedStandingsPageProps {
  user?: User | null;
  onSignOut?: () => void;
}

interface League {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  format: string;
  archived: boolean;
}

export const ArchivedStandingsPage: React.FC<ArchivedStandingsPageProps> = ({ user, onSignOut }) => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    checkAdminStatus();
    fetchArchivedLeagues();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle();

    if (!error && data) {
      setIsAdmin(data.is_admin || false);
    }
  };

  const fetchArchivedLeagues = async () => {
    setLoading(true);

    const today = new Date().toISOString().split('T')[0];

    const { data: manuallyArchived, error: archivedError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('archived', true)
      .order('start_date', { ascending: false });

    const { data: endedLeagues, error: endedError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('archived', false)
      .lt('end_date', today)
      .order('start_date', { ascending: false });

    if (archivedError || endedError) {
      console.error('Error fetching archived leagues:', archivedError || endedError);
    } else {
      const combined = [...(manuallyArchived || []), ...(endedLeagues || [])];
      const unique = combined.filter((league, index, self) =>
        index === self.findIndex(l => l.id === league.id)
      );
      setLeagues(unique);
    }

    setLoading(false);
  };

  const handleDelete = async (leagueId: string, leagueName: string) => {
    if (!isAdmin) return;

    if (!confirm(`Are you sure you want to permanently delete "${leagueName}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(leagueId);

    try {
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', leagueId);

      if (error) throw error;

      setLeagues(leagues.filter(l => l.id !== leagueId));
    } catch (error) {
      console.error('Error deleting league:', error);
      toast('Failed to delete league. Please try again.', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NZ', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateMidpoint = (startDate: string, endDate: string) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const midpoint = new Date((start + end) / 2);
    return midpoint.toLocaleDateString('en-NZ', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <PublicPageHeader user={user} onSignOut={onSignOut} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="bg-slate-600 p-3 rounded-lg mr-4">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Archived League Standings</h1>
              <p className="text-slate-600">View past league standings and results</p>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <Link
              to="/standings"
              className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              Active Leagues
            </Link>
            <Link
              to="/standings/archived"
              className="px-4 py-2 bg-slate-600 text-white rounded-lg font-medium"
            >
              Archived Leagues
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
          </div>
        ) : leagues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leagues.map(league => (
              <div
                key={league.id}
                className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{league.name}</h3>
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-800">
                      Archived
                    </span>
                  </div>
                  <div className="bg-slate-100 p-2 rounded-lg">
                    <Trophy className="h-6 w-6 text-slate-600" />
                  </div>
                </div>

                <p className="text-slate-600 mb-4 line-clamp-2">{league.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-slate-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(league.start_date)} - {formatDate(league.end_date)}
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="font-medium">Midpoint:</span>
                    <span className="ml-1">{calculateMidpoint(league.start_date, league.end_date)}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Users className="h-4 w-4 mr-2" />
                    {league.format}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-200">
                  <Link
                    to={`/standings/${league.id}`}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                  >
                    <span>View Standings</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>

                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(league.id, league.name)}
                      disabled={deleting === league.id}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete League"
                    >
                      {deleting === league.id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 className="h-5 w-5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
            <Trophy className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No Archived Leagues</h3>
            <p className="text-slate-600">
              Archived leagues will appear here once administrators archive completed leagues.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
