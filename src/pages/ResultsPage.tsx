import React, { useState, useEffect } from 'react';
import { Header } from '../components/dashboard/Header';
import { Footer } from '../components/common/Footer';
import { Target, Trophy, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { useToast } from '../components/common/Toast';

interface ResultsPageProps {
  user: User;
  onSignOut: () => void;
}

interface Match {
  id: string;
  tournament_id: string;
  player1_id: string;
  player2_id: string;
  round_number: number;
  match_number: number;
  status: string;
  result_submitted: boolean;
  result_approved: boolean;
  tournament: {
    name: string;
  };
  opponent: {
    first_name: string;
    last_name: string;
  };
  opponentId: string;
  isPlayer1: boolean;
  group: {
    name: string;
  } | null;
  result?: {
    id: string;
    player1_set1_score: number | null;
    player1_set2_score: number | null;
    player1_set3_score: number | null;
    player2_set1_score: number | null;
    player2_set2_score: number | null;
    player2_set3_score: number | null;
    status: string;
    submitted_by: string;
    winner_id: string;
    notes: string | null;
    comments: string | null;
    location: string | null;
    admin_notes: string | null;
  };
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ user, onSignOut }) => {
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [tournaments, setTournaments] = useState<{ id: string; name: string }[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    mySet1Score: '',
    mySet2Score: '',
    mySet3Score: '',
    opponentSet1Score: '',
    opponentSet2Score: '',
    opponentSet3Score: '',
    comments: '',
    location: '',
    dateCompleted: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchMatches();
  }, [user.id]);

  useEffect(() => {
    if (selectedTournamentId === 'all') {
      setMatches(allMatches);
    } else {
      setMatches(allMatches.filter(m => m.tournament_id === selectedTournamentId));
    }
  }, [selectedTournamentId, allMatches]);

  const fetchMatches = async () => {
    setLoading(true);

    const today = new Date().toISOString().split('T')[0];

    const { data: activeTournaments, error: tournamentsError } = await supabase
      .from('tournaments')
      .select('id')
      .gte('end_date', today);

    if (tournamentsError) {
      console.error('Error fetching active tournaments:', tournamentsError);
      setLoading(false);
      return;
    }

    const activeTournamentIds = (activeTournaments || []).map(t => t.id);

    if (activeTournamentIds.length === 0) {
      setAllMatches([]);
      setTournaments([]);
      setMatches([]);
      setLoading(false);
      return;
    }

    const { data: matchesData, error: matchesError } = await supabase
      .from('matches')
      .select(`
        *,
        tournament:tournament_id (name),
        player1:player1_id (first_name, last_name),
        player2:player2_id (first_name, last_name),
        group:group_id (name)
      `)
      .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
      .in('tournament_id', activeTournamentIds)
      .order('round_number')
      .order('match_number');

    if (matchesError) {
      console.error('Error fetching matches:', matchesError);
      setLoading(false);
      return;
    }

    const matchesWithResults = await Promise.all(
      (matchesData || []).map(async (match) => {
        const { data: resultData } = await supabase
          .from('match_results')
          .select('*')
          .eq('match_id', match.id)
          .maybeSingle();

        const isPlayer1 = match.player1_id === user.id;
        const opponent = isPlayer1 ? match.player2 : match.player1;
        const opponentId = isPlayer1 ? match.player2_id : match.player1_id;

        return {
          id: match.id,
          tournament_id: match.tournament_id,
          player1_id: match.player1_id,
          player2_id: match.player2_id,
          round_number: match.round_number,
          match_number: match.match_number,
          status: match.status,
          result_submitted: match.result_submitted || false,
          result_approved: match.result_approved || false,
          tournament: match.tournament,
          opponent,
          opponentId,
          isPlayer1,
          group: match.group,
          result: resultData || undefined,
        };
      })
    );

    setAllMatches(matchesWithResults);

    const uniqueTournaments = matchesWithResults.reduce((acc, match) => {
      if (!acc.find(t => t.id === match.tournament_id)) {
        acc.push({ id: match.tournament_id, name: match.tournament.name });
      }
      return acc;
    }, [] as { id: string; name: string }[]);

    setTournaments(uniqueTournaments);
    setMatches(matchesWithResults);
    setLoading(false);
  };

  const openSubmitModal = (match: Match) => {
    setSelectedMatch(match);

    const r = match.result;
    const isResubmit = r?.status === 'rejected';

    setFormData({
      mySet1Score: isResubmit ? String(match.isPlayer1 ? (r?.player1_set1_score ?? '') : (r?.player2_set1_score ?? '')) : '',
      mySet2Score: isResubmit ? String(match.isPlayer1 ? (r?.player1_set2_score ?? '') : (r?.player2_set2_score ?? '')) : '',
      mySet3Score: isResubmit ? String(match.isPlayer1 ? (r?.player1_set3_score ?? '') : (r?.player2_set3_score ?? '')) : '',
      opponentSet1Score: isResubmit ? String(match.isPlayer1 ? (r?.player2_set1_score ?? '') : (r?.player1_set1_score ?? '')) : '',
      opponentSet2Score: isResubmit ? String(match.isPlayer1 ? (r?.player2_set2_score ?? '') : (r?.player1_set2_score ?? '')) : '',
      opponentSet3Score: isResubmit ? String(match.isPlayer1 ? (r?.player2_set3_score ?? '') : (r?.player1_set3_score ?? '')) : '',
      comments: isResubmit ? (r?.comments ?? '') : '',
      location: isResubmit ? (r?.location ?? '') : '',
      dateCompleted: new Date().toISOString().split('T')[0],
    });
    setShowSubmitModal(true);
  };

  const handleSubmitResult = async () => {
    if (!selectedMatch) return;

    const set1My = parseInt(formData.mySet1Score) || 0;
    const set1Opp = parseInt(formData.opponentSet1Score) || 0;
    const set2My = parseInt(formData.mySet2Score) || 0;
    const set2Opp = parseInt(formData.opponentSet2Score) || 0;
    const set3My = formData.mySet3Score ? parseInt(formData.mySet3Score) : null;
    const set3Opp = formData.opponentSet3Score ? parseInt(formData.opponentSet3Score) : null;

    if (!set1My && !set1Opp && !set2My && !set2Opp) {
      toast('Please enter scores for at least the first two sets.', 'warning');
      return;
    }

    const allScores = [set1My, set1Opp, set2My, set2Opp, set3My, set3Opp].filter((s) => s !== null) as number[];
    if (allScores.some((s) => s > 20)) {
      toast('Scores cannot exceed 20. Please correct the highlighted scores.', 'error');
      return;
    }

    let mySetsWon = 0;
    let oppSetsWon = 0;

    if (set1My > set1Opp) mySetsWon++;
    else if (set1Opp > set1My) oppSetsWon++;

    if (set2My > set2Opp) mySetsWon++;
    else if (set2Opp > set2My) oppSetsWon++;

    if (set3My !== null && set3Opp !== null) {
      if (set3My > set3Opp) mySetsWon++;
      else if (set3Opp > set3My) oppSetsWon++;
    }

    if (mySetsWon === oppSetsWon) {
      toast('There must be a winner. One player must win more sets.', 'warning');
      return;
    }

    setSubmitting(true);

    const winnerId = mySetsWon > oppSetsWon ? user.id : selectedMatch.opponentId;

    const player1Set1 = selectedMatch.isPlayer1 ? set1My : set1Opp;
    const player1Set2 = selectedMatch.isPlayer1 ? set2My : set2Opp;
    const player1Set3 = selectedMatch.isPlayer1 ? set3My : set3Opp;
    const player2Set1 = selectedMatch.isPlayer1 ? set1Opp : set1My;
    const player2Set2 = selectedMatch.isPlayer1 ? set2Opp : set2My;
    const player2Set3 = selectedMatch.isPlayer1 ? set3Opp : set3My;

    const resultPayload = {
      submitted_by: user.id,
      player1_set1_score: player1Set1,
      player1_set2_score: player1Set2,
      player1_set3_score: player1Set3,
      player2_set1_score: player2Set1,
      player2_set2_score: player2Set2,
      player2_set3_score: player2Set3,
      winner_id: winnerId,
      status: 'pending',
      notes: formData.comments || null,
      comments: formData.comments || null,
      location: formData.location || null,
      date_completed: formData.dateCompleted,
      admin_notes: null,
      reviewed_by: null,
      reviewed_at: null,
      updated_at: new Date().toISOString(),
    };

    const isResubmit = selectedMatch.result?.status === 'rejected';

    let error;
    if (isResubmit && selectedMatch.result?.id) {
      ({ error } = await supabase
        .from('match_results')
        .update(resultPayload)
        .eq('id', selectedMatch.result.id));
    } else {
      ({ error } = await supabase
        .from('match_results')
        .insert([{ match_id: selectedMatch.id, ...resultPayload }]));
    }

    if (error) {
      console.error('Error submitting result:', error);
      toast('Failed to submit result. Please try again.', 'error');
    } else {
      const { error: updateError } = await supabase
        .from('matches')
        .update({ status: 'in_progress', result_submitted: true })
        .eq('id', selectedMatch.id);

      if (updateError) {
        console.error('Error updating match status:', updateError);
      }

      setShowSubmitModal(false);
      setSelectedMatch(null);
      fetchMatches();
    }
    setSubmitting(false);
  };

  const getResultDisplay = (match: Match) => {
    if (!match.result) return null;

    const mySet1 = match.isPlayer1 ? match.result.player1_set1_score : match.result.player2_set1_score;
    const mySet2 = match.isPlayer1 ? match.result.player1_set2_score : match.result.player2_set2_score;
    const mySet3 = match.isPlayer1 ? match.result.player1_set3_score : match.result.player2_set3_score;
    const oppSet1 = match.isPlayer1 ? match.result.player2_set1_score : match.result.player1_set1_score;
    const oppSet2 = match.isPlayer1 ? match.result.player2_set2_score : match.result.player1_set2_score;
    const oppSet3 = match.isPlayer1 ? match.result.player2_set3_score : match.result.player1_set3_score;

    const iWon = match.result.winner_id === user.id;
    const iSubmitted = match.result.submitted_by === user.id;

    return {
      mySet1,
      mySet2,
      mySet3,
      oppSet1,
      oppSet2,
      oppSet3,
      iWon,
      iSubmitted,
      status: match.result.status,
    };
  };

  const getStatusBadge = (match: Match) => {
    if (match.result) {
      switch (match.result.status) {
        case 'pending':
          return (
            <span className="flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
              <Clock className="h-3 w-3" />
              Pending Approval
            </span>
          );
        case 'approved':
          return (
            <span className="flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3" />
              Approved
            </span>
          );
        case 'rejected':
          return (
            <span className="flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-red-100 text-red-800">
              <AlertCircle className="h-3 w-3" />
              Rejected
            </span>
          );
        default:
          return null;
      }
    }

    switch (match.status) {
      case 'scheduled':
        return <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Scheduled</span>;
      case 'in_progress':
        return <span className="px-3 py-1 text-xs rounded-full bg-orange-100 text-orange-800">In Progress</span>;
      case 'completed':
        return <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800">Completed</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header user={user} onSignOut={onSignOut} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Target className="h-6 w-6 text-green-600" />
              <h1 className="text-2xl font-bold text-slate-800">My Matches</h1>
            </div>
            {tournaments.length > 1 && (
              <select
                value={selectedTournamentId}
                onChange={(e) => setSelectedTournamentId(e.target.value)}
                className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white text-slate-700 font-medium focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Leagues</option>
                {tournaments.map(tournament => (
                  <option key={tournament.id} value={tournament.id}>
                    {tournament.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <p className="text-sm text-slate-500">View your matches and submit results</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-slate-600 mt-4">Loading matches...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 mb-2">No matches assigned yet</p>
            <p className="text-sm text-slate-500">
              League administrators will assign you to matches once the league starts
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => {
              const result = getResultDisplay(match);
              return (
                <div key={match.id} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-800 leading-tight">
                          {match.tournament.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          {match.group && (
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded">
                              {match.group.name}
                            </span>
                          )}
                          <span>R{match.round_number}</span>
                          <span>·</span>
                          <span>M{match.match_number}</span>
                        </div>
                      </div>
                      {getStatusBadge(match)}
                    </div>

                    <div className="bg-slate-50 rounded-md px-3 py-2">
                      <div className="grid grid-cols-2 gap-2 text-center mb-1">
                        <div>
                          <p className="text-xs text-slate-500">You</p>
                          <p className="text-sm font-semibold text-slate-800">{user.firstName} {user.lastName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Opponent</p>
                          <p className="text-sm font-semibold text-slate-800">{match.opponent.first_name} {match.opponent.last_name}</p>
                        </div>
                      </div>

                      {result && (
                        <>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between bg-white rounded px-2 h-5">
                                <span className="text-xs text-slate-500">Set 1</span>
                                <span className="text-xs font-bold text-slate-900">{result.mySet1 ?? '-'}</span>
                              </div>
                              <div className="flex items-center justify-between bg-white rounded px-2 h-5">
                                <span className="text-xs text-slate-500">Set 2</span>
                                <span className="text-xs font-bold text-slate-900">{result.mySet2 ?? '-'}</span>
                              </div>
                              {result.mySet3 !== null && (
                                <div className="flex items-center justify-between bg-white rounded px-2 h-5">
                                  <span className="text-xs text-slate-500">Set 3</span>
                                  <span className="text-xs font-bold text-slate-900">{result.mySet3}</span>
                                </div>
                              )}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between bg-white rounded px-2 h-5">
                                <span className="text-xs text-slate-500">Set 1</span>
                                <span className="text-xs font-bold text-slate-900">{result.oppSet1 ?? '-'}</span>
                              </div>
                              <div className="flex items-center justify-between bg-white rounded px-2 h-5">
                                <span className="text-xs text-slate-500">Set 2</span>
                                <span className="text-xs font-bold text-slate-900">{result.oppSet2 ?? '-'}</span>
                              </div>
                              {result.oppSet3 !== null && (
                                <div className="flex items-center justify-between bg-white rounded px-2 h-5">
                                  <span className="text-xs text-slate-500">Set 3</span>
                                  <span className="text-xs font-bold text-slate-900">{result.oppSet3}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-2 pt-2 border-t border-slate-200">
                            <p className="text-center text-xs text-slate-600">
                              {result.iWon ? (
                                <span className="flex items-center justify-center gap-1 text-green-600 font-medium">
                                  <Trophy className="h-3 w-3" />
                                  You Won!
                                </span>
                              ) : (
                                <span className="text-slate-500">
                                  Winner: {match.opponent.first_name} {match.opponent.last_name}
                                </span>
                              )}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {match.result?.admin_notes && match.result.status === 'rejected' && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-xs font-medium text-red-800 mb-0.5">Admin Feedback:</p>
                        <p className="text-xs text-red-700">{match.result.admin_notes}</p>
                      </div>
                    )}

                    {(!match.result && !match.result_submitted) || match.result?.status === 'rejected' ? (
                      <div className="flex justify-end mt-2">
                        <Button size="sm" onClick={() => openSubmitModal(match)}>
                          {match.result?.status === 'rejected' ? 'Re-submit Result' : 'Submit Result'}
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />

      <Modal
        isOpen={showSubmitModal}
        onClose={() => {
          setShowSubmitModal(false);
          setSelectedMatch(null);
        }}
        title={selectedMatch?.result?.status === 'rejected' ? 'Re-submit Match Result' : 'Submit Match Result'}
      >
        {selectedMatch && (
          <div className="space-y-6">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-8 text-center">
                <div>
                  <p className="text-base font-semibold text-slate-900">{user.firstName} {user.lastName}</p>
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-900">
                    {selectedMatch.opponent.first_name} {selectedMatch.opponent.last_name}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-[1fr_1fr_auto] gap-4 items-center">
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    placeholder="0"
                    value={formData.mySet1Score}
                    onChange={(e) => setFormData({ ...formData, mySet1Score: e.target.value })}
                    className={`w-full px-4 py-3 text-center text-xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${parseInt(formData.mySet1Score) > 20 ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
                  />
                  {parseInt(formData.mySet1Score) > 20 && (
                    <p className="absolute -bottom-5 left-0 text-xs text-red-600 font-medium">Max 20</p>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    placeholder="0"
                    value={formData.opponentSet1Score}
                    onChange={(e) => setFormData({ ...formData, opponentSet1Score: e.target.value })}
                    className={`w-full px-4 py-3 text-center text-xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${parseInt(formData.opponentSet1Score) > 20 ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
                  />
                  {parseInt(formData.opponentSet1Score) > 20 && (
                    <p className="absolute -bottom-5 left-0 text-xs text-red-600 font-medium">Max 20</p>
                  )}
                </div>
                <span className="text-sm font-medium text-slate-700 w-16 text-right">1st Set</span>
              </div>

              <div className="grid grid-cols-[1fr_1fr_auto] gap-4 items-center">
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    placeholder="0"
                    value={formData.mySet2Score}
                    onChange={(e) => setFormData({ ...formData, mySet2Score: e.target.value })}
                    className={`w-full px-4 py-3 text-center text-xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${parseInt(formData.mySet2Score) > 20 ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
                  />
                  {parseInt(formData.mySet2Score) > 20 && (
                    <p className="absolute -bottom-5 left-0 text-xs text-red-600 font-medium">Max 20</p>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    placeholder="0"
                    value={formData.opponentSet2Score}
                    onChange={(e) => setFormData({ ...formData, opponentSet2Score: e.target.value })}
                    className={`w-full px-4 py-3 text-center text-xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${parseInt(formData.opponentSet2Score) > 20 ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
                  />
                  {parseInt(formData.opponentSet2Score) > 20 && (
                    <p className="absolute -bottom-5 left-0 text-xs text-red-600 font-medium">Max 20</p>
                  )}
                </div>
                <span className="text-sm font-medium text-slate-700 w-16 text-right">2nd Set</span>
              </div>

              <div className="grid grid-cols-[1fr_1fr_auto] gap-4 items-center">
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    placeholder="0"
                    value={formData.mySet3Score}
                    onChange={(e) => setFormData({ ...formData, mySet3Score: e.target.value })}
                    className={`w-full px-4 py-3 text-center text-xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${parseInt(formData.mySet3Score) > 20 ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
                  />
                  {parseInt(formData.mySet3Score) > 20 && (
                    <p className="absolute -bottom-5 left-0 text-xs text-red-600 font-medium">Max 20</p>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    placeholder="0"
                    value={formData.opponentSet3Score}
                    onChange={(e) => setFormData({ ...formData, opponentSet3Score: e.target.value })}
                    className={`w-full px-4 py-3 text-center text-xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${parseInt(formData.opponentSet3Score) > 20 ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
                  />
                  {parseInt(formData.opponentSet3Score) > 20 && (
                    <p className="absolute -bottom-5 left-0 text-xs text-red-600 font-medium">Max 20</p>
                  )}
                </div>
                <span className="text-sm font-medium text-slate-700 w-16 text-right">3rd Set</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Comments
              </label>
              <textarea
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                placeholder="Add any comments about the match..."
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Where did you play
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., City Park Courts, Club XYZ..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Date Completed
              </label>
              <input
                type="date"
                value={formData.dateCompleted}
                onChange={(e) => setFormData({ ...formData, dateCompleted: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowSubmitModal(false);
                  setSelectedMatch(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitResult}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Results'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
