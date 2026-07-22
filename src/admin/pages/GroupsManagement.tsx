import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Plus, Trash2, UserPlus, Mail, AlertTriangle, Send } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';

interface Tournament {
  id: string;
  name: string;
}

interface TournamentGroup {
  id: string;
  tournament_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface Registration {
  id: string;
  user_id: string;
  payment_status: string;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
    pickleball_level: string;
    dupr_rating: string | null;
    location: string;
  };
}

interface GroupMember {
  id: string;
  user_id: string;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
    pickleball_level: string;
    dupr_rating: string | null;
  };
}

const LEVEL_COLORS: Record<string, string> = {
  Beginner: 'bg-blue-100 text-blue-700',
  Intermediate: 'bg-amber-100 text-amber-700',
  Advanced: 'bg-green-100 text-green-700',
};

export const GroupsManagement: React.FC = () => {
  const { toast } = useToast();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('');
  const [groups, setGroups] = useState<TournamentGroup[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [groupMembers, setGroupMembers] = useState<Record<string, GroupMember[]>>({});
  const [availableRegistrations, setAvailableRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);

  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
  });

  // Email confirmation modal
  const [showEmailConfirmModal, setShowEmailConfirmModal] = useState(false);
  const [pendingEmailGroup, setPendingEmailGroup] = useState<{ id: string; name: string } | null>(null);

  // Delete group confirmation modal
  const [showDeleteGroupModal, setShowDeleteGroupModal] = useState(false);
  const [pendingDeleteGroupId, setPendingDeleteGroupId] = useState<string | null>(null);

  // Remove member confirmation modal
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false);
  const [pendingRemoveMember, setPendingRemoveMember] = useState<{ memberId: string; groupId: string } | null>(null);

  useEffect(() => {
    fetchTournaments();
  }, []);

  useEffect(() => {
    if (selectedTournamentId) {
      fetchGroups();
    }
  }, [selectedTournamentId]);

  useEffect(() => {
    groups.forEach(group => {
      fetchGroupMembers(group.id);
    });
  }, [groups]);

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
      .select('*')
      .eq('tournament_id', selectedTournamentId)
      .order('name');

    if (error) {
      console.error('Error fetching groups:', error);
      return;
    }

    setGroups(data || []);
  };

  const fetchGroupMembers = async (groupId: string) => {
    const { data: members, error } = await supabase
      .from('group_members')
      .select('id, user_id')
      .eq('group_id', groupId);

    if (error) {
      console.error('Error fetching group members:', error);
      return;
    }

    if (!members || members.length === 0) {
      setGroupMembers(prev => ({
        ...prev,
        [groupId]: []
      }));
      return;
    }

    const userIds = members.map(m => m.user_id);

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, pickleball_level, dupr_rating')
      .in('id', userIds);

    if (profileError) {
      console.error('Error fetching profiles:', profileError);
      return;
    }

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    const combined = members
      .filter(m => profileMap.has(m.user_id))
      .map(m => ({
        id: m.id,
        user_id: m.user_id,
        profiles: profileMap.get(m.user_id)!
      }));

    setGroupMembers(prev => ({
      ...prev,
      [groupId]: combined
    }));
  };

  const fetchAvailableRegistrations = async (groupId: string) => {
    const { data: allGroupsInTournament } = await supabase
      .from('tournament_groups')
      .select('id')
      .eq('tournament_id', selectedTournamentId);

    const groupIds = allGroupsInTournament?.map(g => g.id) || [];

    const { data: existingMembers } = await supabase
      .from('group_members')
      .select('user_id')
      .in('group_id', groupIds);

    const existingUserIds = existingMembers?.map(m => m.user_id) || [];

    const { data: registrations, error: regError } = await supabase
      .from('tournament_registrations')
      .select('id, user_id, payment_status')
      .eq('tournament_id', selectedTournamentId);

    if (regError) {
      console.error('Error fetching registrations:', regError);
      return;
    }

    if (!registrations || registrations.length === 0) {
      setAvailableRegistrations([]);
      return;
    }

    const userIds = registrations
      .filter(reg => !existingUserIds.includes(reg.user_id))
      .map(reg => reg.user_id);

    if (userIds.length === 0) {
      setAvailableRegistrations([]);
      return;
    }

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, pickleball_level, dupr_rating, location')
      .in('id', userIds);

    if (profileError) {
      console.error('Error fetching profiles:', profileError);
      return;
    }

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    const combined = registrations
      .filter(reg => !existingUserIds.includes(reg.user_id) && profileMap.has(reg.user_id))
      .map(reg => ({
        id: reg.id,
        user_id: reg.user_id,
        payment_status: reg.payment_status,
        profiles: profileMap.get(reg.user_id)!
      }));

    setAvailableRegistrations(combined);
  };

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim()) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('tournament_groups')
      .insert([{
        tournament_id: selectedTournamentId,
        name: newGroup.name,
        description: newGroup.description || null,
      }])
      .select();

    if (error) {
      console.error('Error creating group:', error);
      toast(`Failed to create group: ${error.message}`, 'error');
    } else {
      setNewGroup({ name: '', description: '' });
      setShowCreateModal(false);
      await fetchGroups();
    }
    setLoading(false);
  };

  const handleDeleteGroup = async () => {
    if (!pendingDeleteGroupId) return;

    const { error } = await supabase
      .from('tournament_groups')
      .delete()
      .eq('id', pendingDeleteGroupId);

    if (error) {
      console.error('Error deleting group:', error);
      toast('Failed to delete group', 'error');
    } else {
      fetchGroups();
    }
    setShowDeleteGroupModal(false);
    setPendingDeleteGroupId(null);
  };

  const handleAddMember = async (registrationId: string, userId: string) => {
    setLoading(true);
    const { error } = await supabase
      .from('group_members')
      .insert([{
        group_id: selectedGroupId,
        user_id: userId,
        registration_id: registrationId,
      }]);

    if (error) {
      console.error('Error adding member:', error);
      toast('Failed to add member', 'error');
    } else {
      await fetchGroupMembers(selectedGroupId);
      await fetchAvailableRegistrations(selectedGroupId);
    }
    setLoading(false);
  };

  const handleRemoveMember = async () => {
    if (!pendingRemoveMember) return;
    const { memberId, groupId } = pendingRemoveMember;

    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      console.error('Error removing member:', error);
      toast('Failed to remove member', 'error');
    } else {
      await fetchGroupMembers(groupId);
      if (showAddMemberModal && selectedGroupId === groupId) {
        await fetchAvailableRegistrations(groupId);
      }
    }
    setShowRemoveMemberModal(false);
    setPendingRemoveMember(null);
  };

  const openAddMemberModal = (groupId: string) => {
    setSelectedGroupId(groupId);
    fetchAvailableRegistrations(groupId);
    setShowAddMemberModal(true);
  };

  const handleSendGroupEmails = async () => {
    if (!pendingEmailGroup) return;
    const { id: groupId, name: groupName } = pendingEmailGroup;
    setShowEmailConfirmModal(false);
    setPendingEmailGroup(null);
    setLoading(true);

    try {
      const tournament = tournaments.find(t => t.id === selectedTournamentId);
      if (!tournament) {
        toast('Tournament not found', 'error');
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast('You must be logged in to send emails', 'error');
        setLoading(false);
        return;
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-group-contact-email`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId,
          groupName,
          tournamentName: tournament.name,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast(`Emails sent to ${result.emailsSent.length} member${result.emailsSent.length !== 1 ? 's' : ''}${result.emailsFailed.length > 0 ? ` (${result.emailsFailed.length} failed)` : ''}`, result.emailsFailed.length > 0 ? 'warning' : 'success');
      } else {
        toast(`Failed to send emails: ${result.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('Error sending emails:', error);
      toast('Failed to send emails. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const pendingEmailMembers = pendingEmailGroup ? (groupMembers[pendingEmailGroup.id] || []) : [];
  const PREVIEW_LIMIT = 5;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-slate-800">Groups Management</h1>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg border border-slate-200">
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

      {groups.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 mb-4">No groups created yet for this tournament</p>
          <Button onClick={() => setShowCreateModal(true)}>
            Create First Group
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {groups.map((group) => (
            <div key={group.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-200">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">{group.name}</h3>
                  {group.description && (
                    <p className="text-sm text-slate-600 mt-1">{group.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      const members = groupMembers[group.id] || [];
                      if (members.length === 0) { toast('No members in this group to send emails to.', 'warning'); return; }
                      setPendingEmailGroup({ id: group.id, name: group.name });
                      setShowEmailConfirmModal(true);
                    }}
                    disabled={loading || !groupMembers[group.id]?.length}
                    title="Send contact info to all group members"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email Contacts
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => openAddMemberModal(group.id)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => { setPendingDeleteGroupId(group.id); setShowDeleteGroupModal(true); }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-6">
                {groupMembers[group.id]?.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">No members added yet</p>
                ) : (
                  <div className="space-y-2">
                    {groupMembers[group.id]?.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-slate-800">
                            {member.profiles.first_name} {member.profiles.last_name}
                          </p>
                          <div className="flex gap-4 mt-1">
                            <p className="text-sm text-slate-600">{member.profiles.email}</p>
                            <p className="text-sm font-medium text-green-700">
                              Level: {member.profiles.pickleball_level}
                            </p>
                            {member.profiles.dupr_rating && (
                              <p className="text-sm text-slate-600">
                                DUPR: {member.profiles.dupr_rating}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => { setPendingRemoveMember({ memberId: member.id, groupId: group.id }); setShowRemoveMemberModal(true); }}
                          className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Group"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Group Name
            </label>
            <input
              type="text"
              value={newGroup.name}
              onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
              placeholder="e.g., Pool A, Bracket 1"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={newGroup.description}
              onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
              placeholder="Additional information about this group"
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateGroup} disabled={loading || !newGroup.name.trim()}>
              {loading ? 'Creating...' : 'Create Group'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showAddMemberModal}
        onClose={() => {
          setShowAddMemberModal(false);
          setSelectedGroupId('');
        }}
        title="Add Member to Group"
      >
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {availableRegistrations.length === 0 ? (
            <p className="text-slate-600 text-center py-8">
              No available registrations to add
            </p>
          ) : (
            availableRegistrations.map((reg) => (
              <div
                key={reg.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 border border-slate-200"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-800">
                      {reg.profiles.first_name} {reg.profiles.last_name}
                    </p>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      reg.payment_status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {reg.payment_status}
                    </span>
                  </div>
                  <div className="flex gap-4 mt-1 flex-wrap">
                    <p className="text-sm text-slate-600">{reg.profiles.email}</p>
                    <p className="text-sm text-slate-600">{reg.profiles.location}</p>
                  </div>
                  <div className="flex gap-4 mt-1">
                    <p className="text-sm font-medium text-green-700">
                      Level: {reg.profiles.pickleball_level}
                    </p>
                    {reg.profiles.dupr_rating && (
                      <p className="text-sm font-medium text-blue-700">
                        DUPR: {reg.profiles.dupr_rating}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleAddMember(reg.id, reg.user_id)}
                  disabled={loading}
                >
                  Add
                </Button>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* ── Email Contacts Confirmation Modal ── */}
      <Modal isOpen={showEmailConfirmModal} onClose={() => { setShowEmailConfirmModal(false); setPendingEmailGroup(null); }} size="sm">
        <div className="space-y-5">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Send className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Send Group Contacts</h2>
              <p className="text-sm text-slate-500 mt-0.5">Contact details will be shared among all members</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-0.5">Group</p>
              <p className="font-semibold text-slate-800">{pendingEmailGroup?.name}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
              <Users className="h-3.5 w-3.5" />
              {pendingEmailMembers.length} {pendingEmailMembers.length === 1 ? 'member' : 'members'}
            </span>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            Each member will receive an email containing the <span className="font-medium text-slate-700">name, email address, and skill level</span> of every other player in their group so they can coordinate matches.
          </p>

          {pendingEmailMembers.length > 0 && (
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Recipients</p>
              </div>
              <ul className="divide-y divide-slate-100">
                {pendingEmailMembers.slice(0, PREVIEW_LIMIT).map((m) => (
                  <li key={m.id} className="flex items-center justify-between px-4 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{m.profiles.first_name} {m.profiles.last_name}</p>
                      <p className="text-xs text-slate-500">{m.profiles.email}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${LEVEL_COLORS[m.profiles.pickleball_level] ?? 'bg-slate-100 text-slate-600'}`}>
                      {m.profiles.pickleball_level}
                    </span>
                  </li>
                ))}
                {pendingEmailMembers.length > PREVIEW_LIMIT && (
                  <li className="px-4 py-2 text-xs text-slate-400 text-center">
                    +{pendingEmailMembers.length - PREVIEW_LIMIT} more recipients
                  </li>
                )}
              </ul>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-1">
            <Button variant="secondary" onClick={() => { setShowEmailConfirmModal(false); setPendingEmailGroup(null); }}>
              Cancel
            </Button>
            <Button onClick={handleSendGroupEmails} disabled={loading}>
              <Mail className="h-4 w-4 mr-2" />
              {loading ? 'Sending...' : `Send to ${pendingEmailMembers.length}`}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Delete Group Confirmation Modal ── */}
      <Modal isOpen={showDeleteGroupModal} onClose={() => { setShowDeleteGroupModal(false); setPendingDeleteGroupId(null); }} size="sm">
        <div className="space-y-5">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Delete Group</h2>
              <p className="text-sm text-slate-500 mt-0.5">This action cannot be undone</p>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            All members will be removed from this group. Registered players will still appear in the tournament registrations.
          </p>
          <div className="flex gap-3 justify-end pt-1">
            <Button variant="secondary" onClick={() => { setShowDeleteGroupModal(false); setPendingDeleteGroupId(null); }}>
              Cancel
            </Button>
            <button
              onClick={handleDeleteGroup}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete Group
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Remove Member Confirmation Modal ── */}
      <Modal isOpen={showRemoveMemberModal} onClose={() => { setShowRemoveMemberModal(false); setPendingRemoveMember(null); }} size="sm">
        <div className="space-y-5">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Remove Member</h2>
              <p className="text-sm text-slate-500 mt-0.5">This will remove the player from the group</p>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            The player will be removed from this group but will remain registered in the tournament and can be added to another group.
          </p>
          <div className="flex gap-3 justify-end pt-1">
            <Button variant="secondary" onClick={() => { setShowRemoveMemberModal(false); setPendingRemoveMember(null); }}>
              Cancel
            </Button>
            <button
              onClick={handleRemoveMember}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Remove Member
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
