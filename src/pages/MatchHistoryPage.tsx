import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy, TrendingUp, Users, XCircle, Calendar, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Header } from '../components/dashboard/Header';
import { Footer } from '../components/common/Footer';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface MatchHistoryPageProps {
  user: User;
  onSignOut: () => void;
}

interface MatchHistoryEntry {
  resultId: string;
  matchId: string;
  tournamentId: string;
  tournamentName: string;
  dateCompleted: string | null;
  opponentName: string;
  mySet1: number | null;
  mySet2: number | null;
  mySet3: number | null;
  oppSet1: number | null;
  oppSet2: number | null;
  oppSet3: number | null;
  won: boolean;
}

export const MatchHistoryPage: React.FC<MatchHistoryPageProps> = ({ user, onSignOut }) => {
  const [history, setHistory] = useState<MatchHistoryEntry[]>([]);
  const [filtered, setFiltered] = useState<MatchHistoryEntry[]>([]);
  const [tournaments, setTournaments] = useState<{ id: string; name: string }[]>([]);
  const [selectedTournament, setSelectedTournament] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const PAGE_SIZE = 10;

  useEffect(() => {
    fetchHistory();
  }, [user.id]);

  useEffect(() => {
    if (selectedTournament === 'all') {
      setFiltered(history);
    } else {
      setFiltered(history.filter(h => h.tournamentId === selectedTournament));
    }
    setCurrentPage(1);
  }, [selectedTournament, history]);

  const fetchHistory = async () => {
    setLoading(true);

    const { data: matchesData, error: matchesError } = await supabase
      .from('matches')
      .select(`
        id,
        tournament_id,
        player1_id,
        player2_id,
        tournament:tournament_id (name),
        player1:player1_id (first_name, last_name),
        player2:player2_id (first_name, last_name)
      `)
      .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`);

    if (matchesError || !matchesData) {
      setLoading(false);
      return;
    }

    const matchIds = matchesData.map(m => m.id);
    if (matchIds.length === 0) {
      setLoading(false);
      return;
    }

    const { data: resultsData, error: resultsError } = await supabase
      .from('match_results')
      .select('*')
      .in('match_id', matchIds)
      .eq('status', 'approved')
      .order('date_completed', { ascending: false });

    if (resultsError || !resultsData) {
      setLoading(false);
      return;
    }

    const matchMap = new Map(matchesData.map(m => [m.id, m]));

    const entries: MatchHistoryEntry[] = resultsData.map(r => {
      const match = matchMap.get(r.match_id);
      if (!match) return null;

      const isPlayer1 = match.player1_id === user.id;
      const opponent = isPlayer1 ? match.player2 : match.player1;
      const opponentName = opponent
        ? `${opponent.first_name} ${opponent.last_name}`
        : 'Unknown';

      const mySet1 = isPlayer1 ? r.player1_set1_score : r.player2_set1_score;
      const mySet2 = isPlayer1 ? r.player1_set2_score : r.player2_set2_score;
      const mySet3 = isPlayer1 ? r.player1_set3_score : r.player2_set3_score;
      const oppSet1 = isPlayer1 ? r.player2_set1_score : r.player1_set1_score;
      const oppSet2 = isPlayer1 ? r.player2_set2_score : r.player1_set2_score;
      const oppSet3 = isPlayer1 ? r.player2_set3_score : r.player1_set3_score;

      return {
        resultId: r.id,
        matchId: match.id,
        tournamentId: match.tournament_id,
        tournamentName: (match.tournament as any)?.name ?? 'Unknown Tournament',
        dateCompleted: r.date_completed,
        opponentName,
        mySet1,
        mySet2,
        mySet3,
        oppSet1,
        oppSet2,
        oppSet3,
        won: r.winner_id === user.id,
      };
    }).filter(Boolean) as MatchHistoryEntry[];

    setHistory(entries);
    setFiltered(entries);

    const seen = new Set<string>();
    const uniqueTournaments: { id: string; name: string }[] = [];
    for (const e of entries) {
      if (!seen.has(e.tournamentId)) {
        seen.add(e.tournamentId);
        uniqueTournaments.push({ id: e.tournamentId, name: e.tournamentName });
      }
    }
    setTournaments(uniqueTournaments);
    setLoading(false);
  };

  const wins = filtered.filter(h => h.won).length;
  const losses = filtered.length - wins;
  const winRate = filtered.length > 0 ? Math.round((wins / filtered.length) * 100) : 0;

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-NZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatScore = (entry: MatchHistoryEntry) => {
    const sets: string[] = [];
    if (entry.mySet1 !== null && entry.oppSet1 !== null) sets.push(`${entry.mySet1}–${entry.oppSet1}`);
    if (entry.mySet2 !== null && entry.oppSet2 !== null) sets.push(`${entry.mySet2}–${entry.oppSet2}`);
    if (entry.mySet3 !== null && entry.oppSet3 !== null) sets.push(`${entry.mySet3}–${entry.oppSet3}`);
    return sets.length > 0 ? sets.join(', ') : '—';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header user={user} onSignOut={onSignOut} />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Page header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-green-600 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-800">Match History</h1>
          <p className="text-slate-500 mt-1">All your approved match results</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto" />
            <p className="text-slate-500 mt-4">Loading match history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16 text-center">
            <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-700 font-medium mb-1">No match history yet</p>
            <p className="text-sm text-slate-500">Approved match results will appear here once your matches are completed.</p>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-1">
                  <div className="bg-slate-100 p-2 rounded-lg">
                    <Users className="h-4 w-4 text-slate-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-800">{filtered.length}</p>
                <p className="text-xs text-slate-500 mt-0.5">Played</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-1">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Trophy className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-green-600">{wins}</p>
                <p className="text-xs text-slate-500 mt-0.5">Wins</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-1">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <XCircle className="h-4 w-4 text-red-500" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-red-500">{losses}</p>
                <p className="text-xs text-slate-500 mt-0.5">Losses</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-1">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-blue-600">{winRate}%</p>
                <p className="text-xs text-slate-500 mt-0.5">Win Rate</p>
              </div>
            </div>

            {/* Filter */}
            {tournaments.length > 1 && (
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-4 w-4 text-slate-400" />
                <select
                  value={selectedTournament}
                  onChange={e => setSelectedTournament(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white text-slate-700 font-medium focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Leagues</option>
                  {tournaments.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Match table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Desktop table */}
              <table className="w-full hidden sm:table">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">League</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Opponent</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Score (you – opp)</th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.map(entry => (
                    <tr key={entry.resultId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                        {formatDate(entry.dateCompleted)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-800 max-w-[200px] truncate">
                        {entry.tournamentName}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {entry.opponentName}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-slate-700">
                        {formatScore(entry)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {entry.won ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            <Trophy className="h-3 w-3" />
                            Win
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                            <XCircle className="h-3 w-3" />
                            Loss
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile card list */}
              <div className="sm:hidden divide-y divide-slate-100">
                {paginated.map(entry => (
                  <div key={entry.resultId} className="px-4 py-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{entry.opponentName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{entry.tournamentName}</p>
                      </div>
                      {entry.won ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 shrink-0">
                          <Trophy className="h-3 w-3" />
                          Win
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600 shrink-0">
                          <XCircle className="h-3 w-3" />
                          Loss
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-mono text-slate-700">{formatScore(entry)}</span>
                      <span>{formatDate(entry.dateCompleted)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-sm text-slate-500">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} results
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors ${
                        page === currentPage
                          ? 'bg-green-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};
