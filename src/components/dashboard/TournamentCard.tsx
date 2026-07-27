import React from 'react';
import { Calendar, MapPin, Users, DollarSign, Trophy } from 'lucide-react';
import { Button } from '../common/Button';
import { Tournament } from '../../types';

interface TournamentCardProps {
  tournament: Tournament;
  onRegister: (tournamentId: string) => void;
  isRegistered?: boolean;
  loading?: boolean;
}

export const TournamentCard: React.FC<TournamentCardProps> = ({ 
  tournament, 
  onRegister, 
  isRegistered = false,
  loading = false
}) => {
  const getStatusColor = (status: Tournament['status']) => {
    switch (status) {
      case 'Registration':
        return 'bg-green-100 text-green-800';
      case 'Ongoing':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-gray-100 text-gray-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSurfaceIcon = (surface: Tournament['surface']) => {
    return Trophy; // Using Trophy as a generic icon
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NZ', {
      day: '2-digit',
      month: '2-digit',
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

  const SurfaceIcon = getSurfaceIcon(tournament.surface);

  const isRegistrationClosed = () => {
    // The deadline is a date string (YYYY-MM-DD). Registration stays open
    // until midnight at the END of that day in New Zealand time.
    // NZ is UTC+12 (NZST winter) or UTC+13 (NZDT summer).
    // Midnight NZ end-of-day = start of next calendar day in NZ.
    // Using NZST (UTC+12): next day 00:00 NZ = next day -12:00 UTC = deadline day 12:00 UTC.
    // This is the conservative (later) cutoff, ensuring registration is always
    // open until at least midnight NZ regardless of daylight saving.
    const [year, month, day] = tournament.registrationDeadline.split('-').map(Number);
    const deadlineEndUTC = Date.UTC(year, month - 1, day, 12, 0, 0, 0);
    return Date.now() > deadlineEndUTC;
  };

  const registrationClosed = isRegistrationClosed();

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">{tournament.name}</h3>
        </div>
        <div className="bg-green-100 p-2 rounded-lg">
          <SurfaceIcon className="h-6 w-6 text-green-600" />
        </div>
      </div>

      <p className="text-slate-600 mb-4 line-clamp-2">{tournament.description}</p>

      <div className="space-y-3 mb-4">
        <div className="flex items-center text-sm text-slate-600">
          <Calendar className="h-4 w-4 mr-2" />
          {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
        </div>
        <div className="flex items-center text-sm text-slate-600">
          <Calendar className="h-4 w-4 mr-2" />
          <span className="font-medium">Midpoint:</span>
          <span className="ml-1">{calculateMidpoint(tournament.startDate, tournament.endDate)}</span>
        </div>
        <div className="flex items-center text-sm text-slate-600">
          <MapPin className="h-4 w-4 mr-2" />
          <span className="truncate">{tournament.location}</span>
        </div>
        <div className="flex items-center text-sm text-slate-600">
          <DollarSign className="h-4 w-4 mr-2" />
          Entry Fee: ${tournament.entryFee}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-slate-200">
        <div className="text-sm text-slate-600">
          Registration until {formatDate(tournament.registrationDeadline)}
        </div>
        {registrationClosed && !isRegistered && (
          <span className="text-red-600 font-semibold text-sm">Registrations Closed</span>
        )}
        {!registrationClosed && (tournament.status === 'Registration' || tournament.status === 'Approved') && !isRegistered && (
          <Button
            onClick={() => onRegister(tournament.id)}
            loading={loading}
            size="sm"
            disabled={tournament.currentParticipants >= tournament.maxParticipants}
          >
            {tournament.currentParticipants >= tournament.maxParticipants ? 'Full' : 'Register & Pay'}
          </Button>
        )}
        {isRegistered && (
          <span className="text-green-600 font-semibold text-sm">Registered ✓</span>
        )}
      </div>
    </div>
  );
};