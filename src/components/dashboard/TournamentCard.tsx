import React, { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, DollarSign, Trophy, X } from 'lucide-react';
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
  const [showInfoModal, setShowInfoModal] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const [isClamped, setIsClamped] = useState(false);

  useEffect(() => {
    const el = descriptionRef.current;
    if (el) {
      setIsClamped(el.scrollHeight > el.clientHeight);
    }
  }, [tournament.description]);

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

  const isRegistrationClosed = () => {
    const [year, month, day] = tournament.registrationDeadline.split('-').map(Number);
    const deadlineEndUTC = Date.UTC(year, month - 1, day, 12, 0, 0, 0);
    return Date.now() > deadlineEndUTC;
  };

  const registrationClosed = isRegistrationClosed();

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{tournament.name}</h3>
          </div>
          <div className="bg-green-100 p-2 rounded-lg">
            <Trophy className="h-6 w-6 text-green-600" />
          </div>
        </div>

        <div className="mb-4">
          <p
            ref={descriptionRef}
            className="text-slate-600 line-clamp-2 whitespace-pre-line"
          >
            {tournament.description}
          </p>
          {isClamped && (
            <button
              onClick={() => setShowInfoModal(true)}
              className="text-green-600 hover:text-green-700 text-sm font-medium mt-1 hover:underline transition-colors"
            >
              (click for more info)
            </button>
          )}
        </div>

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

      {showInfoModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowInfoModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white pr-4">{tournament.name}</h3>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-white/80 hover:text-white transition-colors flex-shrink-0 p-1 rounded-lg hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(85vh-64px)]">
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">About this League</h4>
                <p className="text-slate-700 whitespace-pre-line leading-relaxed">{tournament.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center text-slate-500 mb-1">
                    <Calendar className="h-4 w-4 mr-1.5" />
                    <span className="text-xs font-medium uppercase">Start Date</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{formatDate(tournament.startDate)}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center text-slate-500 mb-1">
                    <Calendar className="h-4 w-4 mr-1.5" />
                    <span className="text-xs font-medium uppercase">End Date</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{formatDate(tournament.endDate)}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center text-slate-500 mb-1">
                    <Calendar className="h-4 w-4 mr-1.5" />
                    <span className="text-xs font-medium uppercase">Midpoint</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{calculateMidpoint(tournament.startDate, tournament.endDate)}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center text-slate-500 mb-1">
                    <MapPin className="h-4 w-4 mr-1.5" />
                    <span className="text-xs font-medium uppercase">Location</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{tournament.location}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center text-slate-500 mb-1">
                    <DollarSign className="h-4 w-4 mr-1.5" />
                    <span className="text-xs font-medium uppercase">Entry Fee</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">${tournament.entryFee}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center text-slate-500 mb-1">
                    <Calendar className="h-4 w-4 mr-1.5" />
                    <span className="text-xs font-medium uppercase">Register By</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{formatDate(tournament.registrationDeadline)}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="px-5 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
