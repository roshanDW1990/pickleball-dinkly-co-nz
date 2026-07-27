import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PublicPageHeader } from '../components/common/PublicPageHeader';
import { Footer } from '../components/common/Footer';
import { Trophy, ArrowLeft, Calendar, MapPin } from 'lucide-react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface LeagueStandingsPageProps {
  user?: User | null;
  onSignOut?: () => void;
}

interface League {
  id: string;
  name: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  status: string;
  format: string;
}

interface GroupStanding {
  group_id: string;
  group_name: string;
  players: PlayerStanding[];
}

interface PlayerStanding {
  player_id: string;
  player_name: string;
  matches_played: number;
  wins: number;
  losses: number;
  points: number;
  bonus_points: number;
  total_points: number;
  sets_won: number;
}

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

export const LeagueStandingsPage: React.FC<LeagueStandingsPageProps> = ({ user, onSignOut }) => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const [league, setLeague] = useState<League | null>(null);
  const [standings, setStandings] = useState<GroupStanding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (leagueId) {
      fetchLeagueData();
      fetchStandings();
    }
  }, [leagueId]);

  const fetchLeagueData = async () => {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', leagueId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching league:', error);
    } else {
      setLeague(data);
    }
  };

  const fetchStandings = async () => {
    setLoading(true);

    const { data: tournamentData } = await supabase
      .from('tournaments')
      .select('start_date, end_date')
      .eq('id', leagueId)
      .maybeSingle();

    const midpointDate = tournamentData ? new Date((new Date(tournamentData.start_date).getTime() + new Date(tournamentData.end_date).getTime()) / 2) : null;

    const { data: groups, error: groupsError } = await supabase
      .from('tournament_groups')
      .select('id, name')
      .eq('tournament_id', leagueId)
      .order('name');

    if (groupsError) {
      console.error('Error fetching groups:', groupsError);
      setLoading(false);
      return;
    }

    const groupStandings: GroupStanding[] = [];

    for (const group of groups || []) {
      const { data: members, error: membersError } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', group.id);

      if (membersError) {
        console.error('Error fetching group members:', membersError);
        continue;
      }

      const playerStandings: PlayerStanding[] = [];

      for (const member of members || []) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', member.user_id)
          .maybeSingle();

        const { data: matches } = await supabase
          .from('matches')
          .select('id, player1_id, player2_id, result_approved')
          .eq('group_id', group.id)
          .or(`player1_id.eq.${member.user_id},player2_id.eq.${member.user_id}`)
          .eq('result_approved', true);

        let wins = 0;
        let losses = 0;
        let setsWon = 0;
        let matchesBeforeMidpoint = 0;
        const matchesPlayed = matches?.length || 0;

        for (const match of matches || []) {
          const { data: result } = await supabase
            .from('match_results')
            .select('winner_id, status, player1_set1_score, player1_set2_score, player1_set3_score, player2_set1_score, player2_set2_score, player2_set3_score, date_completed')
            .eq('match_id', match.id)
            .eq('status', 'approved')
            .maybeSingle();

          if (result) {
            if (result.winner_id === member.user_id) {
              wins++;
            } else {
              losses++;
            }

            if (midpointDate && result.date_completed && new Date(result.date_completed) <= midpointDate) {
              matchesBeforeMidpoint++;
            }

            const isPlayer1 = match.player1_id === member.user_id;

            if (isPlayer1) {
              if ((result.player1_set1_score || 0) > (result.player2_set1_score || 0)) setsWon++;
              if ((result.player1_set2_score || 0) > (result.player2_set2_score || 0)) setsWon++;
              if ((result.player1_set3_score || 0) > (result.player2_set3_score || 0)) setsWon++;
            } else {
              if ((result.player2_set1_score || 0) > (result.player1_set1_score || 0)) setsWon++;
              if ((result.player2_set2_score || 0) > (result.player1_set2_score || 0)) setsWon++;
              if ((result.player2_set3_score || 0) > (result.player1_set3_score || 0)) setsWon++;
            }
          }
        }

        let points = (wins * 2) + (losses * 1);
        const bonusPoints = matchesBeforeMidpoint >= 3 ? 2 : 0;
        const totalPoints = points + bonusPoints;

        playerStandings.push({
          player_id: member.user_id,
          player_name: profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown',
          matches_played: matchesPlayed,
          wins,
          losses,
          points,
          bonus_points: bonusPoints,
          total_points: totalPoints,
          sets_won: setsWon
        });
      }

      playerStandings.sort((a, b) => {
        if (b.total_points !== a.total_points) return b.total_points - a.total_points;
        if (b.wins !== a.wins) return b.wins - a.wins;
        if (a.losses !== b.losses) return a.losses - b.losses;
        return b.sets_won - a.sets_won;
      });

      groupStandings.push({
        group_id: group.id,
        group_name: group.name,
        players: playerStandings
      });
    }

    setStandings(groupStandings);
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NZ', {
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
          <div className="flex items-center gap-6 mb-4">
            <Link
              to="/"
              className="inline-flex items-center text-slate-600 hover:text-green-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <Link
              to="/standings"
              className="inline-flex items-center text-slate-600 hover:text-green-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to All Standings
            </Link>
          </div>

          {league && (
            <>
              <div className="flex items-center mb-4">
                <div className="bg-green-600 p-3 rounded-lg mr-4">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-800">{league.name}</h1>
                  <p className="text-slate-600">{league.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-slate-600 bg-white rounded-lg p-4 border border-slate-200">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(league.start_date)} - {formatDate(league.end_date)}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {league.location}
                </div>
                <div className="flex items-center">
                  {(() => {
                    const ds = getDisplayStatus(league.start_date, league.end_date);
                    return (
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${ds.className}`}>
                        {ds.label}
                      </span>
                    );
                  })()}
                </div>
              </div>
            </>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : standings.length > 0 ? (
          <div className="space-y-6 max-w-3xl mx-auto">
            {standings.map((group) => (
              <div key={group.group_id} className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden w-[640px] mx-auto">
                <div className="bg-slate-800 text-white px-4 py-2">
                  <h2 className="text-xl font-bold">{group.group_name}</h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-2 text-left text-xs font-bold text-slate-700 uppercase tracking-wider w-[200px]">
                          Player
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-slate-700 uppercase tracking-wider w-[50px]">
                          MP
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-slate-700 uppercase tracking-wider w-[50px]">
                          PTS
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-amber-600 uppercase tracking-wider w-[75px]">
                          Bonus PTS
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-green-700 uppercase tracking-wider w-[75px]">
                          Total PTS
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-slate-700 uppercase tracking-wider w-[50px]">
                          W
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-slate-700 uppercase tracking-wider w-[50px]">
                          L
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {group.players.length > 0 ? (
                        group.players.map((player, index) => (
                          <tr key={player.player_id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <td className="px-4 py-3 whitespace-nowrap w-[200px]">
                              <div className="text-sm font-semibold text-slate-900">
                                {player.player_name}
                              </div>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-center text-sm text-slate-700 w-[50px]">
                              {player.matches_played}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-center w-[50px]">
                              <span className="text-sm font-bold text-slate-700">
                                {player.points}
                              </span>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-center w-[75px]">
                              <span className={`text-sm font-bold ${player.bonus_points > 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                                {player.bonus_points}
                              </span>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-center w-[75px]">
                              <span className="text-sm font-bold text-green-600">
                                {player.total_points}
                              </span>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-center text-sm text-slate-700 w-[50px]">
                              {player.wins}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-center text-sm text-slate-700 w-[50px]">
                              {player.losses}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-6 text-center text-sm text-slate-500">
                            No players in this group yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
            <Trophy className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No Standings Available</h3>
            <p className="text-slate-600">
              Standings will appear once groups are created and matches are completed.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
