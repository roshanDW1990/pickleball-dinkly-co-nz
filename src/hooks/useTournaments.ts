import { useState, useCallback, useEffect } from 'react';
import { Tournament, Match } from '../types';
import { supabase } from '../lib/supabase';

export const useTournaments = (userId?: string) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [registrations, setRegistrations] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('tournament_registrations')
        .select('tournament_id')
        .eq('user_id', userId)
        .eq('payment_status', 'completed');

      if (error) throw error;

      const registeredTournamentIds = new Set(
        (data || []).map(reg => reg.tournament_id)
      );
      setRegistrations(registeredTournamentIds);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  }, [userId]);

  const fetchTournaments = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('status', 'Approved')
        .eq('archived', false)
        .order('start_date', { ascending: true });

      if (error) throw error;

      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const mappedTournaments: Tournament[] = (data || [])
        .filter(tournament => {
          const endDate = new Date(tournament.end_date);
          return endDate >= oneDayAgo;
        })
        .map(tournament => ({
          id: tournament.id,
          name: tournament.name,
          description: tournament.description,
          organizer: tournament.organizer,
          location: tournament.location,
          startDate: tournament.start_date,
          endDate: tournament.end_date,
          registrationDeadline: tournament.registration_deadline,
          maxParticipants: tournament.max_participants,
          currentParticipants: tournament.current_participants,
          entryFee: tournament.entry_fee,
          prizePool: tournament.prize_pool,
          surface: tournament.surface,
          format: tournament.format,
          skillLevel: tournament.skill_level,
          status: tournament.status,
          participants: [],
          matches: []
        }));

      setTournaments(mappedTournaments);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTournaments();
    fetchRegistrations();
  }, [fetchTournaments, fetchRegistrations]);

  const isRegistered = useCallback((tournamentId: string) => {
    return registrations.has(tournamentId);
  }, [registrations]);

  return {
    tournaments,
    loading,
    isRegistered,
    fetchTournaments,
    fetchRegistrations
  };
};