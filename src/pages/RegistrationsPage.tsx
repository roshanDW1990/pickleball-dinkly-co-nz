import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Trophy, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Header } from '../components/dashboard/Header';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface RegistrationsPageProps {
  user: User;
  onSignOut: () => void;
}

interface TournamentRegistration {
  id: string;
  tournament_id: string;
  amount_paid: number;
  payment_status: string;
  created_at: string;
  tournament: {
    name: string;
    location: string;
    start_date: string;
    end_date: string;
    status: string;
    entry_fee: number;
    organizer: string;
  };
}

export const RegistrationsPage: React.FC<RegistrationsPageProps> = ({ user, onSignOut }) => {
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRegistrations();
  }, [user.id]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('tournament_registrations')
        .select(`
          id,
          tournament_id,
          amount_paid,
          payment_status,
          created_at,
          tournament:tournaments (
            name,
            location,
            start_date,
            end_date,
            status,
            entry_fee,
            organizer
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRegistrations(data || []);
    } catch (err) {
      console.error('Error fetching registrations:', err);
      setError('Failed to load registrations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentRegistrations = registrations.filter(
    (reg) => {
      const startDate = new Date(reg.tournament.start_date);
      const endDate = new Date(reg.tournament.end_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return endDate >= today && (reg.tournament.status === 'Approved' || reg.tournament.status === 'Pending');
    }
  );

  const finishedRegistrations = registrations.filter(
    (reg) => {
      const endDate = new Date(reg.tournament.end_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return endDate < today;
    }
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string, startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let displayStatus = 'Upcoming';
    let styleClass = 'bg-blue-100 text-blue-700';

    if (end < today) {
      displayStatus = 'Completed';
      styleClass = 'bg-slate-100 text-slate-700';
    } else if (start <= today && end >= today) {
      displayStatus = 'Ongoing';
      styleClass = 'bg-green-100 text-green-700';
    }

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styleClass}`}>
        {displayStatus}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    if (status === 'completed') {
      return (
        <div className="flex items-center space-x-1 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Paid</span>
        </div>
      );
    } else if (status === 'failed') {
      return (
        <div className="flex items-center space-x-1 text-red-600">
          <XCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Failed</span>
        </div>
      );
    }
    return null;
  };

  const RegistrationCard = ({ registration }: { registration: TournamentRegistration }) => (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-800 mb-1">
            {registration.tournament.name}
          </h3>
          <p className="text-sm text-slate-600">{registration.tournament.organizer}</p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          {getStatusBadge(registration.tournament.status, registration.tournament.start_date, registration.tournament.end_date)}
          {getPaymentStatusBadge(registration.payment_status)}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-slate-600">
          <MapPin className="h-4 w-4 mr-2 text-slate-400" />
          <span className="text-sm">{registration.tournament.location}</span>
        </div>

        <div className="flex items-center text-slate-600">
          <Calendar className="h-4 w-4 mr-2 text-slate-400" />
          <span className="text-sm">
            {formatDate(registration.tournament.start_date)} - {formatDate(registration.tournament.end_date)}
          </span>
        </div>

        <div className="flex items-center text-slate-600">
          <Trophy className="h-4 w-4 mr-2 text-slate-400" />
          <span className="text-sm">Registered on {formatDate(registration.created_at)}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
        <span className="text-sm text-slate-600">Entry Fee:</span>
        <span className="text-lg font-semibold text-slate-800">
          ${registration.amount_paid.toFixed(2)}
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <Header user={user} onSignOut={onSignOut} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">My Registrations</h1>
          <p className="text-slate-600">View and manage your league registrations</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : registrations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
            <Trophy className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No Registrations Yet</h3>
            <p className="text-slate-600">
              You haven't registered for any leagues. Browse upcoming leagues to get started!
            </p>
          </div>
        ) : (
          <>
            {currentRegistrations.length > 0 && (
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center">
                  <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">
                    {currentRegistrations.length}
                  </span>
                  Current Registrations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentRegistrations.map((registration) => (
                    <RegistrationCard key={registration.id} registration={registration} />
                  ))}
                </div>
              </div>
            )}

            {finishedRegistrations.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center">
                  <span className="bg-slate-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">
                    {finishedRegistrations.length}
                  </span>
                  History
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {finishedRegistrations.map((registration) => (
                    <RegistrationCard key={registration.id} registration={registration} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
