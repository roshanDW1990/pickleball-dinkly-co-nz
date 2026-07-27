import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { Button } from '../components/common/Button';
import { supabase } from '../lib/supabase';

interface Tournament {
  id?: string;
  name: string;
  description: string;
  organizer: string;
  location: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  max_participants: number;
  current_participants: number;
  entry_fee: number;
  prize_pool: number;
  surface: string;
  format: string;
  skill_level: string;
  status: string;
}

const initialFormState: Tournament = {
  name: '',
  description: '',
  organizer: '',
  location: '',
  start_date: '',
  end_date: '',
  registration_deadline: '',
  max_participants: 32,
  current_participants: 0,
  entry_fee: 0,
  prize_pool: 0,
  surface: 'Hard Court',
  format: 'Single Elimination',
  skill_level: 'Open',
  status: 'Registration'
};

export const AdminPage: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Tournament>(initialFormState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;
      setTournaments(data || []);
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (editingId) {
        const { error } = await supabase
          .from('tournaments')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tournaments')
          .insert([{ ...formData, created_by: user.id }]);

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
    if (!confirm('Are you sure you want to delete this tournament?')) return;

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-xl text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">Tournament Management</h1>
            <p className="text-slate-600 mt-2">Create and manage upcoming tournaments</p>
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
              <h2 className="text-2xl font-bold text-slate-800">
                {editingId ? 'Edit Tournament' : 'Create New Tournament'}
              </h2>
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
                    Organizer *
                  </label>
                  <input
                    type="text"
                    name="organizer"
                    value={formData.organizer}
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
                    Max Participants *
                  </label>
                  <input
                    type="number"
                    name="max_participants"
                    value={formData.max_participants}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Current Participants
                  </label>
                  <input
                    type="number"
                    name="current_participants"
                    value={formData.current_participants}
                    onChange={handleInputChange}
                    min="0"
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
                    Prize Pool ($)
                  </label>
                  <input
                    type="number"
                    name="prize_pool"
                    value={formData.prize_pool}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Surface *
                  </label>
                  <select
                    name="surface"
                    value={formData.surface}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="Hard Court">Hard Court</option>
                    <option value="Clay Court">Clay Court</option>
                    <option value="Grass Court">Grass Court</option>
                    <option value="Indoor">Indoor</option>
                    <option value="Outdoor">Outdoor</option>
                  </select>
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
                    <option value="Single Elimination">Single Elimination</option>
                    <option value="Double Elimination">Double Elimination</option>
                    <option value="Round Robin">Round Robin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Skill Level *
                  </label>
                  <select
                    name="skill_level"
                    value={formData.skill_level}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="Open">Open</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="Registration">Registration</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
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

        <div className="grid grid-cols-1 gap-6">
          {tournaments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-slate-200">
              <p className="text-slate-600 text-lg">No tournaments yet. Create your first tournament!</p>
            </div>
          ) : (
            tournaments.map((tournament) => (
              <div
                key={tournament.id}
                className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">{tournament.name}</h3>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          tournament.status === 'Registration' ? 'bg-green-100 text-green-700' :
                          tournament.status === 'Ongoing' ? 'bg-blue-100 text-blue-700' :
                          tournament.status === 'Completed' ? 'bg-slate-100 text-slate-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {tournament.status}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(tournament)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tournament.id!)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-slate-600 mb-4">{tournament.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500 font-medium">Organizer</p>
                        <p className="text-slate-800">{tournament.organizer}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 font-medium">Location</p>
                        <p className="text-slate-800">{tournament.location}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 font-medium">Start Date</p>
                        <p className="text-slate-800">{new Date(tournament.start_date).toLocaleDateString('en-NZ', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 font-medium">Participants</p>
                        <p className="text-slate-800">{tournament.current_participants}/{tournament.max_participants}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 font-medium">Entry Fee</p>
                        <p className="text-slate-800">${tournament.entry_fee}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 font-medium">Prize Pool</p>
                        <p className="text-slate-800">${tournament.prize_pool}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 font-medium">Surface</p>
                        <p className="text-slate-800">{tournament.surface}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 font-medium">Skill Level</p>
                        <p className="text-slate-800">{tournament.skill_level}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
