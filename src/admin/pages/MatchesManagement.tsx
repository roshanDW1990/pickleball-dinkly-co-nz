import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Target, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';

interface Tournament {
  id: string;
  name: string;
}

interface TournamentGroup {
  id: string;
  name: string;
}

interface GroupMember {
  user_id: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
}

interface Match {
  id: string;
  tournament_id: string;
  group_id: string | null;
  player1_id: string;
  player2_id: string;
  round_number: number;
  match_number: number;
  status: string;
  scheduled_time: string | null;
  player1: {
    first_name: string;
    last_name: string;
  };
  player2: {
    first_name: string;
    last_name: string;
  };
  group?: {
    name: string;
  };
}

export const MatchesManagement: React.FC = () => {
  const { toast } = useToast();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('');
  const [groups, setGroups] = useState<TournamentGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');
  const [matches, setMatches] = useState<Match[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMatchesInSelectedGroup, setHasMatchesInSelectedGroup] = useState(false);

  const [newMatch, setNewMatch] = useState({
    player1_id: '',
    player2_id: '',
    group_id: '',
    round_number: 1,
    match_number: 1,
  });

  useEffect(() => {
    fetchTournaments();
  }, []);

  useEffect(() => {
    if (selectedTournamentId) {
      fetchGroups();
      fetchMatches();
    }
  }, [selectedTournamentId, selectedGroupId]);

  const fetchTournaments = async () => {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('tournaments')
      .select('id, name, start_date, end_date, status')
      .eq('status', 'Approved')
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

  const fetchGroups = async () => {
    const { data, error } = await supabase
      .from('tournament_groups')
      .select('id, name')
      .eq('tournament_id', selectedTournamentId)
      .order('name');

    if (error) {
      console.error('Error fetching groups:', error);
      return;
    }

    setGroups(data || []);
  };

  const fetchMatches = async () => {
    let query = supabase
      .from('matches')
      .select(`
        *,
        player1:profiles!matches_player1_id_profiles_fkey (first_name, last_name),
        player2:profiles!matches_player2_id_profiles_fkey (first_name, last_name),
        group:tournament_groups!matches_group_id_fkey (name)
      `)
      .eq('tournament_id', selectedTournamentId)
      .order('round_number')
      .order('match_number');

    if (selectedGroupId !== 'all') {
      query = query.eq('group_id', selectedGroupId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching matches:', error);
      return;
    }

    setMatches(data || []);

    if (selectedGroupId !== 'all') {
      setHasMatchesInSelectedGroup(data && data.length > 0);
    } else {
      setHasMatchesInSelectedGroup(false);
    }
  };

  const fetchGroupMembers = async (groupId: string) => {
    const { data: members, error } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId);

    if (error) {
      console.error('Error fetching group members:', error);
      return;
    }

    if (!members || members.length === 0) {
      setGroupMembers([]);
      return;
    }

    const userIds = members.map(m => m.user_id);
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', userIds);

    if (profileError) {
      console.error('Error fetching profiles:', profileError);
      return;
    }

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
    setGroupMembers(
      members
        .filter(m => profileMap.has(m.user_id))
        .map(m => ({ user_id: m.user_id, profiles: profileMap.get(m.user_id)! }))
    );
  };

  const handleCreateMatch = async () => {
    if (!newMatch.player1_id || !newMatch.player2_id) {
      toast('Please select both players', 'warning');
      return;
    }

    if (newMatch.player1_id === newMatch.player2_id) {
      toast('Players must be different', 'warning');
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('matches')
      .insert([{
        tournament_id: selectedTournamentId,
        group_id: newMatch.group_id || null,
        player1_id: newMatch.player1_id,
        player2_id: newMatch.player2_id,
        round_number: newMatch.round_number,
        match_number: newMatch.match_number,
        status: 'scheduled',
      }]);

    if (error) {
      console.error('Error creating match:', error);
      toast('Failed to create match', 'error');
    } else {
      setNewMatch({
        player1_id: '',
        player2_id: '',
        group_id: '',
        round_number: 1,
        match_number: 1,
      });
      setShowCreateModal(false);
      fetchMatches();
    }
    setLoading(false);
  };

  const handleDeleteMatch = async (matchId: string) => {
    if (!confirm('Are you sure you want to delete this match?')) {
      return;
    }

    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', matchId);

    if (error) {
      console.error('Error deleting match:', error);
      toast('Failed to delete match', 'error');
    } else {
      fetchMatches();
    }
  };

  const handleGenerateRoundRobin = async () => {
    if (!selectedGroupId || selectedGroupId === 'all') {
      toast('Please select a specific group to generate matches', 'warning');
      return;
    }

    const { data: existingMatches, error: matchCheckError } = await supabase
      .from('matches')
      .select('id')
      .eq('tournament_id', selectedTournamentId)
      .eq('group_id', selectedGroupId)
      .limit(1);

    if (matchCheckError) {
      console.error('Error checking existing matches:', matchCheckError);
      toast('Failed to check for existing matches', 'error');
      return;
    }

    if (existingMatches && existingMatches.length > 0) {
      toast('Matches already exist for this group. Delete existing matches first to regenerate.', 'warning');
      return;
    }

    const { data: members, error } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', selectedGroupId);

    if (error || !members || members.length < 2) {
      toast('Need at least 2 players in the group', 'warning');
      return;
    }

    const playerIds = members.map(m => m.user_id);
    const roundRobinMatches = [];
    let matchNumber = 1;

    for (let i = 0; i < playerIds.length; i++) {
      for (let j = i + 1; j < playerIds.length; j++) {
        roundRobinMatches.push({
          tournament_id: selectedTournamentId,
          group_id: selectedGroupId,
          player1_id: playerIds[i],
          player2_id: playerIds[j],
          round_number: 1,
          match_number: matchNumber++,
          status: 'scheduled',
        });
      }
    }

    setLoading(true);
    const { error: insertError } = await supabase
      .from('matches')
      .insert(roundRobinMatches);

    if (insertError) {
      console.error('Error generating matches:', insertError);
      toast('Failed to generate matches', 'error');
    } else {
      fetchMatches();
    }
    setLoading(false);
  };

  const openCreateModal = () => {
    if (selectedGroupId !== 'all') {
      setNewMatch({ ...newMatch, group_id: selectedGroupId });
      fetchGroupMembers(selectedGroupId);
    }
    setShowCreateModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-slate-800">Matches Management</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={handleGenerateRoundRobin}
            disabled={loading || selectedGroupId === 'all' || hasMatchesInSelectedGroup}
            title={hasMatchesInSelectedGroup ? 'Matches already exist for this group' : ''}
          >
            Generate Round Robin
          </Button>
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4 mr-2" />
            Create Match
          </Button>
        </div>
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
            Filter by Group
          </label>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Groups</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 mb-4">No matches created yet</p>
          <Button onClick={openCreateModal}>
            Create First Match
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Round
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Match #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Group
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Player 1
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Player 2
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {matches.map((match) => (
                <tr key={match.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {match.round_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {match.match_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {match.group?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {match.player1.first_name} {match.player1.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {match.player2.first_name} {match.player2.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      match.status === 'completed' ? 'bg-green-100 text-green-800' :
                      match.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {match.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleDeleteMatch(match.id)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Match"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Group
            </label>
            <select
              value={newMatch.group_id}
              onChange={(e) => {
                setNewMatch({ ...newMatch, group_id: e.target.value });
                if (e.target.value) {
                  fetchGroupMembers(e.target.value);
                }
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select Group</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Player 1
            </label>
            <select
              value={newMatch.player1_id}
              onChange={(e) => setNewMatch({ ...newMatch, player1_id: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select Player</option>
              {groupMembers.map((member) => (
                <option key={member.user_id} value={member.user_id}>
                  {member.profiles.first_name} {member.profiles.last_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Player 2
            </label>
            <select
              value={newMatch.player2_id}
              onChange={(e) => setNewMatch({ ...newMatch, player2_id: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select Player</option>
              {groupMembers.map((member) => (
                <option key={member.user_id} value={member.user_id}>
                  {member.profiles.first_name} {member.profiles.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Round Number
              </label>
              <input
                type="number"
                min="1"
                value={newMatch.round_number}
                onChange={(e) => setNewMatch({ ...newMatch, round_number: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Match Number
              </label>
              <input
                type="number"
                min="1"
                value={newMatch.match_number}
                onChange={(e) => setNewMatch({ ...newMatch, match_number: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateMatch} disabled={loading}>
              {loading ? 'Creating...' : 'Create Match'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
