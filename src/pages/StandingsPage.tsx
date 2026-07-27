import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PublicPageHeader } from '../components/common/PublicPageHeader';
import { Footer } from '../components/common/Footer';
import { Trophy, ArrowRight, ArrowLeft, Calendar, Users } from 'lucide-react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface StandingsPageProps {
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
}

export const StandingsPage: React.FC<StandingsPageProps> = ({ user, onSignOut }) => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveLeagues();
  }, []);

  const getDisplayStatus = (startDate: string, endDate: string): { label: string; className: string } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (today > start && today < end) {
      return { label: 'Ongoing', className: 'bg-green-100 text-green-800' };
    }
    return { label: 'Upcoming', className: 'bg-blue-100 text-blue-800' };
  };

  const fetchActiveLeagues = async () => {
    setLoading(true);

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .in('status', ['Approved', 'Ongoing'])
      .eq('archived', false)
      .gt('end_date', today)
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Error fetching leagues:', error);
    } else {
      setLeagues(data || []);
    }

    setLoading(false);
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
          <Link
            to="/"
            className="inline-flex items-center text-slate-600 hover:text-green-600 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center mb-4">
            <div className="bg-green-600 p-3 rounded-lg mr-4">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">League Standings</h1>
              <p className="text-slate-600">View current league standings and rankings</p>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <Link
              to="/standings"
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium"
            >
              Active Leagues
            </Link>
            <Link
              to="/standings/archived"
              className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              Archived Leagues
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : leagues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leagues.map(league => (
              <Link
                key={league.id}
                to={`/standings/${league.id}`}
                className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{league.name}</h3>
                    {(() => {
                      const ds = getDisplayStatus(league.start_date, league.end_date);
                      return (
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${ds.className}`}>
                          {ds.label}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Trophy className="h-6 w-6 text-green-600" />
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

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <span className="text-green-600 font-semibold text-sm">View Standings</span>
                  <ArrowRight className="h-5 w-5 text-green-600" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
            <Trophy className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No Active Leagues</h3>
            <p className="text-slate-600">
              There are no ongoing leagues at the moment. Check back soon!
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
