import React, { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit2, Trash2, Save, X, Trophy, LogOut, Check, Archive, Users, Target, Clock } from 'lucide-react';
import { DinklyLogo } from '../../components/common/DinklyLogo';
import { Button } from '../../components/common/Button';
import { supabase } from '../../lib/supabase';
import { User } from '../../types';
import { GroupsManagement } from './GroupsManagement';
import { MatchesManagement } from './MatchesManagement';
import { ResultsApproval } from './ResultsApproval';

interface Tournament {
  id?: string;
  name: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  entry_fee: number;
  format: string;
  status?: string;
  archived?: boolean;
  current_participants?: number;
}

interface Registration {
  id: string;
  tournament_id: string;
  user_id: string;
  payment_status: string;
  amount_paid: number;
  registered_at: string;
  stripe_payment_intent_id: string;
  user_email?: string;
  user_profile?: {
    first_name: string;
    last_name: string;
  };
}

const initialFormState: Tournament = {
  name: '',
  description: '',
  location: '',
  start_date: '',
  end_date: '',
  registration_deadline: '',
  entry_fee: 0,
  format: 'Singles'
};

interface AdminDashboardProps {
  user: User;
  onSignOut: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onSignOut }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Tournament>(initialFormState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [viewingRegistrations, setViewingRegistrations] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [mainView, setMainView] = useState<'tournaments' | 'groups' | 'matches' | 'results'>('tournaments');

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const { data: tournamentsData, error: tournamentsError } = await supabase
        .from('tournaments')
        .select('*')
        .order('start_date', { ascending: true });

      if (tournamentsError) throw tournamentsError;

      const { data: registrationsData, error: registrationsError } = await supabase
        .from('tournament_registrations')
        .select('tournament_id');

      if (registrationsError) throw registrationsError;

      const registrationCounts = (registrationsData || []).reduce((acc, reg) => {
        acc[reg.tournament_id] = (acc[reg.tournament_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const tournamentsWithCounts = (tournamentsData || []).map(tournament => ({
        ...tournament,
        current_participants: registrationCounts[tournament.id] || 0
      }));

      setTournaments(tournamentsWithCounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tournaments');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Not authenticated');

      if (editingId) {
        const { error } = await supabase
          .from('tournaments')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tournaments')
          .insert([{ ...formData, created_by: authUser.id }]);

        if (error) throw error;
      }

      setFormData(initialFormState);
      setIsFormOpen(false);
      setEditingId(null);
      fetchTournaments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save tournament');
    }
  };

  const handleEdit = (tournament: Tournament) => {
    setFormData(tournament);
    setEditingId(tournament.id || null);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this league?')) return;

    try {
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchTournaments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tournament');
    }
  };

  const handleCancel = () => {
    setFormData(initialFormState);
    setIsFormOpen(false);
    setEditingId(null);
    setError(null);
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tournaments')
        .update({ status: 'Approved' })
        .eq('id', id);

      if (error) throw error;
      fetchTournaments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve tournament');
    }
  };

  const handleArchive = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tournaments')
        .update({ archived: true })
        .eq('id', id);

      if (error) throw error;
      fetchTournaments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive tournament');
    }
  };

  const fetchRegistrations = async (tournamentId: string) => {
    try {
      setLoadingRegistrations(true);
      setViewingRegistrations(tournamentId);

      const { data: regData, error: regError } = await supabase
        .from('tournament_registrations')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('registered_at', { ascending: false });

      if (regError) throw regError;

      const userIds = (regData || []).map(reg => reg.user_id);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', userIds);

      if (profileError) throw profileError;

      const profileMap = new Map(
        (profileData || []).map(profile => [profile.id, profile])
      );

      const registrationsWithUsers = (regData || []).map(reg => ({
        ...reg,
        user_email: profileMap.get(reg.user_id)?.email,
        user_profile: {
          first_name: profileMap.get(reg.user_id)?.first_name || 'Unknown',
          last_name: profileMap.get(reg.user_id)?.last_name || 'User'
        }
      }));

      setRegistrations(registrationsWithUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch registrations');
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const closeRegistrationsModal = () => {
    setViewingRegistrations(null);
    setRegistrations([]);
  };

  const pendingTournaments = tournaments.filter(t => t.status === 'Pending' && !t.archived);
  const approvedTournaments = tournaments.filter(t => t.status === 'Approved' && !t.archived);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-xl text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="flex items-center hover:opacity-80 transition-opacity cursor-pointer">
              <div className="bg-green-600 p-2 rounded-lg mr-3">
                <DinklyLogo className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Admin Panel</h1>
                <p className="text-xs text-slate-600">Dinkly</p>
              </div>
            </a>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">
                {user.firstName} {user.lastName}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={onSignOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setMainView('tournaments')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  mainView === 'tournaments'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <Trophy className="h-4 w-4" />
                Tournaments
              </button>
              <button
                onClick={() => setMainView('groups')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  mainView === 'groups'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <Users className="h-4 w-4" />
                Groups
              </button>
              <button
                onClick={() => setMainView('matches')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  mainView === 'matches'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <Target className="h-4 w-4" />
                Matches
              </button>
              <button
                onClick={() => setMainView('results')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  mainView === 'results'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <Clock className="h-4 w-4" />
                Results
              </button>
            </div>
          </div>

          {mainView === 'groups' && <GroupsManagement />}
          {mainView === 'matches' && <MatchesManagement />}
          {mainView === 'results' && <ResultsApproval />}

          {mainView === 'tournaments' && (
            <>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-4xl font-bold text-slate-800">League Management</h2>
                  <p className="text-slate-600 mt-2">Create and manage upcoming leagues</p>
                </div>
            {!isFormOpen && (
              <Button
                onClick={() => setIsFormOpen(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>New Tournament</span>
              </Button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {isFormOpen && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800">
                  {editingId ? 'Edit League' : 'Create New League'}
                </h3>
                <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tournament Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Registration Deadline *
                    </label>
                    <input
                      type="date"
                      name="registration_deadline"
                      value={formData.registration_deadline}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Entry Fee ($)
                    </label>
                    <input
                      type="number"
                      name="entry_fee"
                      value={formData.entry_fee}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Format *
                    </label>
                    <select
                      name="format"
                      value={formData.format}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="Singles">Singles</option>
                      <option value="Doubles">Doubles</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex items-center space-x-2"
                  >
                    <Save className="h-5 w-5" />
                    <span>{editingId ? 'Update' : 'Create'} Tournament</span>
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'pending'
                    ? 'bg-green-50 text-green-700 border-b-2 border-green-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Pending Tournaments ({pendingTournaments.length})
              </button>
              <button
                onClick={() => setActiveTab('approved')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'approved'
                    ? 'bg-green-50 text-green-700 border-b-2 border-green-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Approved Tournaments ({approvedTournaments.length})
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {activeTab === 'pending' && pendingTournaments.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-slate-600 text-lg">No pending leagues</p>
                  </div>
                )}

                {activeTab === 'approved' && approvedTournaments.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-slate-600 text-lg">No approved leagues</p>
                  </div>
                )}

                {(activeTab === 'pending' ? pendingTournaments : approvedTournaments).map((tournament) => (
                  <div
                    key={tournament.id}
                    className="bg-slate-50 rounded-lg p-6 border border-slate-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">{tournament.name}</h3>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              tournament.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {tournament.status}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            {activeTab === 'pending' && (
                              <button
                                onClick={() => handleApprove(tournament.id!)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Approve League"
                              >
                                <Check className="h-5 w-5" />
                              </button>
                            )}
                            {activeTab === 'approved' && (
                              <button
                                onClick={() => handleArchive(tournament.id!)}
                                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Archive League"
                              >
                                <Archive className="h-5 w-5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleEdit(tournament)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit League"
                            >
                              <Edit2 className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(tournament.id!)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete League"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-slate-600 mb-4">{tournament.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-4">
                          <div>
                            <p className="text-slate-500 font-medium">Location</p>
                            <p className="text-slate-800">{tournament.location}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 font-medium">Start Date</p>
                            <p className="text-slate-800">{new Date(tournament.start_date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 font-medium">End Date</p>
                            <p className="text-slate-800">{new Date(tournament.end_date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 font-medium">Entry Fee</p>
                            <p className="text-slate-800">${tournament.entry_fee}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 font-medium">Format</p>
                            <p className="text-slate-800">{tournament.format}</p>
                          </div>
                        </div>

                        {activeTab === 'approved' && (
                          <div className="pt-4 border-t border-slate-200">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => fetchRegistrations(tournament.id!)}
                              className="flex items-center space-x-2"
                            >
                              <Users className="h-4 w-4" />
                              <span>View Registrations ({tournament.current_participants || 0})</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
            </>
          )}
        </div>
      </div>

      {viewingRegistrations && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">Tournament Registrations</h3>
              <button
                onClick={closeRegistrationsModal}
                className="text-white hover:text-slate-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {loadingRegistrations ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                  <p className="mt-4 text-slate-600">Loading registrations...</p>
                </div>
              ) : registrations.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 text-lg">No registrations yet</p>
                </div>
              ) : (
                <>
                  <div className="mb-4 p-4 bg-green-50 rounded-lg">
                    <p className="text-green-800 font-semibold">
                      Total Registrations: {registrations.length}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {registrations.map((reg, index) => (
                      <div
                        key={reg.id}
                        className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="text-lg font-bold text-slate-700">#{index + 1}</span>
                              <div>
                                <p className="font-semibold text-slate-800">
                                  {reg.user_profile?.first_name} {reg.user_profile?.last_name}
                                </p>
                                <p className="text-sm text-slate-600">{reg.user_email}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mt-3">
                              <div>
                                <p className="text-slate-500 font-medium">Payment Status</p>
                                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                  reg.payment_status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : reg.payment_status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {reg.payment_status}
                                </span>
                              </div>
                              <div>
                                <p className="text-slate-500 font-medium">Amount Paid</p>
                                <p className="text-slate-800 font-semibold">${reg.amount_paid}</p>
                              </div>
                              <div>
                                <p className="text-slate-500 font-medium">Registered</p>
                                <p className="text-slate-800">
                                  {new Date(reg.registered_at).toLocaleDateString('en-NZ', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                            {reg.stripe_payment_intent_id && (
                              <div className="mt-2 text-xs text-slate-500">
                                Payment ID: {reg.stripe_payment_intent_id}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
