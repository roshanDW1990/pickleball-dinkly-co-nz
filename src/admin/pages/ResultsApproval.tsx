import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';

interface Tournament {
  id: string;
  name: string;
}

interface MatchResult {
  id: string;
  match_id: string;
  submitted_by: string;
  player1_set1_score: number | null;
  player1_set2_score: number | null;
  player1_set3_score: number | null;
  player2_set1_score: number | null;
  player2_set2_score: number | null;
  player2_set3_score: number | null;
  winner_id: string;
  status: string;
  notes: string | null;
  comments: string | null;
  location: string | null;
  admin_notes: string | null;
  created_at: string;
  submitter: {
    first_name: string;
    last_name: string;
  };
  winner: {
    first_name: string;
    last_name: string;
  };
  match: {
    round_number: number;
    match_number: number;
    player1: {
      first_name: string;
      last_name: string;
    };
    player2: {
      first_name: string;
      last_name: string;
    };
    group: {
      name: string;
    } | null;
  };
}

export const ResultsApproval: React.FC = () => {
  const { toast } = useToast();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('');
  const [results, setResults] = useState<MatchResult[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [selectedResult, setSelectedResult] = useState<MatchResult | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectReasonError, setRejectReasonError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');

  useEffect(() => {
    fetchTournaments();
  }, []);

  useEffect(() => {
    if (selectedTournamentId) {
      fetchResults();
    }
  }, [selectedTournamentId, filterStatus]);

  const fetchTournaments = async () => {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('tournaments')
      .select('id, name, start_date, end_date, status')
      .in('status', ['Approved', 'Ongoing'])
      .gte('end_date', today)
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error fetching tournaments:', error);
      return;
    }

    setTournaments(data || []);
    if (data && data.length > 0) {
      setSelectedTournamentId(data[0].id);
    }
  };

  const fetchResults = async () => {
    const { data: matchesData, error: matchesError } = await supabase
      .from('matches')
      .select('id')
      .eq('tournament_id', selectedTournamentId);

    if (matchesError) {
      console.error('Error fetching matches:', matchesError);
      return;
    }

    const matchIds = matchesData.map(m => m.id);

    if (matchIds.length === 0) {
      setResults([]);
      return;
    }

    let query = supabase
      .from('match_results')
      .select(`
        *,
        submitter:submitted_by (first_name, last_name),
        winner:winner_id (first_name, last_name),
        match:match_id (
          round_number,
          match_number,
          player1:player1_id (first_name, last_name),
          player2:player2_id (first_name, last_name),
          group:group_id (name)
        )
      `)
      .in('match_id', matchIds)
      .order('updated_at', { ascending: false });

    if (filterStatus !== 'all') {
      query = query.eq('status', filterStatus);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching results:', error);
      return;
    }

    setResults(data || []);
  };

  const handleApprove = async (resultId: string) => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('match_results')
      .update({
        status: 'approved',
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
        admin_notes: adminNotes || null,
      })
      .eq('id', resultId);

    if (error) {
      console.error('Error approving result:', error);
      toast('Failed to approve result', 'error');
    } else {
      await updateMatchStatus(selectedResult?.match_id || '', true);

      // Send approval emails to both players (fire-and-forget)
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        await fetch(`${supabaseUrl}/functions/v1/send-approval-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ result_id: resultId }),
        });
      } catch (emailErr) {
        console.error('Failed to send approval emails:', emailErr);
      }

      setShowReviewModal(false);
      setAdminNotes('');
      setSelectedResult(null);
      fetchResults();
      toast('Match result approved and players notified.', 'success');
    }
    setLoading(false);
  };

  const openRejectModal = () => {
    setRejectReason(adminNotes);
    setRejectReasonError('');
    setEmailStatus('idle');
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      setRejectReasonError('Please provide a reason for rejection before submitting.');
      return;
    }

    setLoading(true);
    setEmailStatus('sending');
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user || !selectedResult) {
      setLoading(false);
      setEmailStatus('failed');
      return;
    }

    const { error } = await supabase
      .from('match_results')
      .update({
        status: 'rejected',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        admin_notes: rejectReason,
      })
      .eq('id', selectedResult.id);

    if (error) {
      console.error('Error rejecting result:', error);
      toast('Failed to reject result', 'error');
      setLoading(false);
      setEmailStatus('failed');
      return;
    }

    // Send rejection emails to both players
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

      await fetch(`${supabaseUrl}/functions/v1/send-rejection-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          result_id: selectedResult.id,
          rejection_reason: rejectReason,
        }),
      });

      setEmailStatus('sent');
    } catch (emailErr) {
      console.error('Failed to send rejection emails:', emailErr);
      setEmailStatus('failed');
    }

    setShowRejectModal(false);
    setShowReviewModal(false);
    setAdminNotes('');
    setRejectReason('');
    setSelectedResult(null);
    fetchResults();
    setLoading(false);
  };

  const updateMatchStatus = async (matchId: string, approved: boolean = false) => {
    const updates: Record<string, unknown> = { status: 'completed' };
    if (approved) {
      updates.result_approved = true;
    }

    const { error } = await supabase
      .from('matches')
      .update(updates)
      .eq('id', matchId);

    if (error) {
      console.error('Error updating match status:', error);
    }
  };

  const openReviewModal = (result: MatchResult) => {
    setSelectedResult(result);
    setAdminNotes(result.admin_notes || '');
    setShowReviewModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'disputed': return 'bg-orange-100 text-orange-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Clock className="h-8 w-8 text-green-600" />
        <h1 className="text-3xl font-bold text-slate-800">Results Approval</h1>
      </div>

      <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Select League
          </label>
          <select
            value={selectedTournamentId}
            onChange={(e) => setSelectedTournamentId(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {tournaments.map((tournament) => (
              <option key={tournament.id} value={tournament.id}>
                {tournament.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Filter by Status
          </label>
          <div className="flex gap-2">
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No results found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((result) => (
            <div key={result.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(result.status)}`}>
                        {result.status}
                      </span>
                      {result.match.group && (
                        <span className="text-sm text-slate-600">{result.match.group.name}</span>
                      )}
                      <span className="text-sm text-slate-600">
                        Round {result.match.round_number}, Match {result.match.match_number}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      Submitted by {result.submitter.first_name} {result.submitter.last_name} on{' '}
                      {new Date(result.created_at).toLocaleDateString('en-NZ', {
                        day: '2-digit', month: '2-digit', year: 'numeric'
                      })}
                    </p>
                  </div>
                  {result.status === 'pending' && (
                    <Button onClick={() => openReviewModal(result)} size="sm">
                      Review
                    </Button>
                  )}
                </div>

                <div className="bg-slate-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2 text-center">
                        {result.match.player1.first_name} {result.match.player1.last_name}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-white rounded px-3 py-2">
                          <span className="text-xs text-slate-600">1st Set</span>
                          <span className="text-lg font-bold text-slate-900">{result.player1_set1_score ?? '-'}</span>
                        </div>
                        <div className="flex items-center justify-between bg-white rounded px-3 py-2">
                          <span className="text-xs text-slate-600">2nd Set</span>
                          <span className="text-lg font-bold text-slate-900">{result.player1_set2_score ?? '-'}</span>
                        </div>
                        {result.player1_set3_score !== null && (
                          <div className="flex items-center justify-between bg-white rounded px-3 py-2">
                            <span className="text-xs text-slate-600">3rd Set</span>
                            <span className="text-lg font-bold text-slate-900">{result.player1_set3_score}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2 text-center">
                        {result.match.player2.first_name} {result.match.player2.last_name}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-white rounded px-3 py-2">
                          <span className="text-xs text-slate-600">1st Set</span>
                          <span className="text-lg font-bold text-slate-900">{result.player2_set1_score ?? '-'}</span>
                        </div>
                        <div className="flex items-center justify-between bg-white rounded px-3 py-2">
                          <span className="text-xs text-slate-600">2nd Set</span>
                          <span className="text-lg font-bold text-slate-900">{result.player2_set2_score ?? '-'}</span>
                        </div>
                        {result.player2_set3_score !== null && (
                          <div className="flex items-center justify-between bg-white rounded px-3 py-2">
                            <span className="text-xs text-slate-600">3rd Set</span>
                            <span className="text-lg font-bold text-slate-900">{result.player2_set3_score}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-center mt-3 text-sm text-slate-600">
                    Winner: {result.winner.first_name} {result.winner.last_name}
                  </p>
                </div>

                {result.comments && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-slate-700 mb-1">Player Comments:</p>
                    <p className="text-sm text-slate-600 bg-slate-50 rounded p-3">{result.comments}</p>
                  </div>
                )}

                {result.location && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-slate-700 mb-1">Location:</p>
                    <p className="text-sm text-slate-600 bg-slate-50 rounded p-3">{result.location}</p>
                  </div>
                )}

                {result.admin_notes && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">Admin Notes:</p>
                    <p className="text-sm text-slate-600 bg-blue-50 rounded p-3">{result.admin_notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setSelectedResult(null);
          setAdminNotes('');
        }}
        title="Review Match Result"
      >
        {selectedResult && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2 text-center">
                    {selectedResult.match.player1.first_name} {selectedResult.match.player1.last_name}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-white rounded px-3 py-2">
                      <span className="text-xs text-slate-600">1st Set</span>
                      <span className="text-lg font-bold text-slate-900">{selectedResult.player1_set1_score ?? '-'}</span>
                    </div>
                    <div className="flex items-center justify-between bg-white rounded px-3 py-2">
                      <span className="text-xs text-slate-600">2nd Set</span>
                      <span className="text-lg font-bold text-slate-900">{selectedResult.player1_set2_score ?? '-'}</span>
                    </div>
                    {selectedResult.player1_set3_score !== null && (
                      <div className="flex items-center justify-between bg-white rounded px-3 py-2">
                        <span className="text-xs text-slate-600">3rd Set</span>
                        <span className="text-lg font-bold text-slate-900">{selectedResult.player1_set3_score}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2 text-center">
                    {selectedResult.match.player2.first_name} {selectedResult.match.player2.last_name}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-white rounded px-3 py-2">
                      <span className="text-xs text-slate-600">1st Set</span>
                      <span className="text-lg font-bold text-slate-900">{selectedResult.player2_set1_score ?? '-'}</span>
                    </div>
                    <div className="flex items-center justify-between bg-white rounded px-3 py-2">
                      <span className="text-xs text-slate-600">2nd Set</span>
                      <span className="text-lg font-bold text-slate-900">{selectedResult.player2_set2_score ?? '-'}</span>
                    </div>
                    {selectedResult.player2_set3_score !== null && (
                      <div className="flex items-center justify-between bg-white rounded px-3 py-2">
                        <span className="text-xs text-slate-600">3rd Set</span>
                        <span className="text-lg font-bold text-slate-900">{selectedResult.player2_set3_score}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-center mt-3 text-sm text-slate-600">
                Winner: {selectedResult.winner.first_name} {selectedResult.winner.last_name}
              </p>
            </div>

            {selectedResult.comments && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Player Comments</label>
                <p className="text-sm text-slate-600 bg-slate-50 rounded p-3">{selectedResult.comments}</p>
              </div>
            )}

            {selectedResult.location && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                <p className="text-sm text-slate-600 bg-slate-50 rounded p-3">{selectedResult.location}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Admin Notes</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about your decision (required for rejection)"
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="secondary"
                onClick={openRejectModal}
                disabled={loading}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => handleApprove(selectedResult.id)}
                disabled={loading}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Rejection Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => { setShowRejectModal(false); setRejectReasonError(''); }}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-red-50 border-b border-red-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Reject Match Result</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Both players will be notified by email</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {selectedResult && (
                <div className="bg-slate-50 rounded-lg px-4 py-3 text-sm text-slate-700">
                  <span className="font-medium">
                    {selectedResult.match.player1.first_name} {selectedResult.match.player1.last_name}
                  </span>
                  <span className="text-slate-400 mx-2">vs</span>
                  <span className="font-medium">
                    {selectedResult.match.player2.first_name} {selectedResult.match.player2.last_name}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => {
                    setRejectReason(e.target.value);
                    if (e.target.value.trim()) setRejectReasonError('');
                  }}
                  placeholder="Explain why this result is being rejected. This message will be sent to both players..."
                  rows={4}
                  autoFocus
                  className={`w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none transition-colors ${
                    rejectReasonError ? 'border-red-400 bg-red-50' : 'border-slate-300'
                  }`}
                />
                {rejectReasonError && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                    {rejectReasonError}
                  </p>
                )}
                <p className="mt-1.5 text-xs text-slate-400">
                  This reason will be included in the notification email sent to both players.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
              <button
                onClick={() => { setShowRejectModal(false); setRejectReasonError(''); }}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={loading}
                className="px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    {emailStatus === 'sending' ? 'Sending...' : 'Rejecting...'}
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    Confirm Rejection
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
