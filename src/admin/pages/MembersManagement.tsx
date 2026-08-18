import React, { useState, useEffect, useMemo } from 'react';
import { Users, Search, Mail, Phone, MapPin, Calendar, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Member {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  location: string | null;
  pickleball_level: string | null;
  matches_played: number;
  created_at: string;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

type Filter = 'all' | 'week' | 'month';

export const MembersManagement: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, phone_number, location, pickleball_level, matches_played, created_at')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setMembers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const now = Date.now();
  const newThisWeek = useMemo(
    () => members.filter(m => now - new Date(m.created_at).getTime() < SEVEN_DAYS_MS).length,
    [members, now]
  );
  const newThisMonth = useMemo(
    () => members.filter(m => now - new Date(m.created_at).getTime() < THIRTY_DAYS_MS).length,
    [members, now]
  );

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members.filter(m => {
      if (filter === 'week' && now - new Date(m.created_at).getTime() >= SEVEN_DAYS_MS) return false;
      if (filter === 'month' && now - new Date(m.created_at).getTime() >= THIRTY_DAYS_MS) return false;
      if (!q) return true;
      const haystack = `${m.first_name} ${m.last_name} ${m.email} ${m.phone_number || ''} ${m.location || ''}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [members, search, filter, now]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-NZ', { day: '2-digit', month: 'short', year: 'numeric' });

  const isNew = (iso: string) => now - new Date(iso).getTime() < SEVEN_DAYS_MS;

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
        <p className="mt-4 text-slate-600">Loading members...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-bold text-slate-800">Members</h2>
          <p className="text-slate-600 mt-2">Everyone who has signed up to Dinkly</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 text-green-700 p-3 rounded-lg">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total members</p>
              <p className="text-2xl font-bold text-slate-800">{members.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 text-emerald-700 p-3 rounded-lg">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">New this week</p>
              <p className="text-2xl font-bold text-slate-800">{newThisWeek}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 text-blue-700 p-3 rounded-lg">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">New this month</p>
              <p className="text-2xl font-bold text-slate-800">{newThisMonth}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone, location..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'week', 'month'] as Filter[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
                  filter === f
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {f === 'all' ? 'All' : f === 'week' ? 'New this week' : 'New this month'}
              </button>
            ))}
          </div>
        </div>

        {filteredMembers.length === 0 ? (
          <div className="text-center py-16">
            <Users className="h-14 w-14 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">No members match your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Member</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider hidden md:table-cell">Contact</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider hidden lg:table-cell">Location</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Joined</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider hidden sm:table-cell">Matches</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-medium text-slate-800">{m.first_name} {m.last_name}</p>
                          <p className="text-xs text-slate-500 md:hidden">{m.email}</p>
                        </div>
                        {isNew(m.created_at) && (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase">
                            <Sparkles className="h-3 w-3" />
                            New
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="text-sm space-y-1">
                        <p className="flex items-center gap-2 text-slate-700"><Mail className="h-3.5 w-3.5 text-slate-400" />{m.email}</p>
                        {m.phone_number && (
                          <p className="flex items-center gap-2 text-slate-600"><Phone className="h-3.5 w-3.5 text-slate-400" />{m.phone_number}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm text-slate-700">
                      {m.location ? (
                        <span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-slate-400" />{m.location}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">{formatDate(m.created_at)}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-sm text-slate-700">{m.matches_played}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
