import React, { useState } from 'react';
import { Header } from '../components/dashboard/Header';
import { Footer } from '../components/common/Footer';
import { User as UserIcon, Mail, Phone, TrendingUp, Pencil, Check, X, Loader2 } from 'lucide-react';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/common/Toast';

interface DetailsPageProps {
  user: User;
  onSignOut: () => void;
  onRefreshProfile: () => Promise<void>;
}

export const DetailsPage: React.FC<DetailsPageProps> = ({ user, onSignOut, onRefreshProfile }) => {
  const { toast } = useToast();
  const [isEditingDupr, setIsEditingDupr] = useState(false);
  const [duprValue, setDuprValue] = useState(user.duprRating || '');
  const [saving, setSaving] = useState(false);

  const handleEditDupr = () => {
    setDuprValue(user.duprRating || '');
    setIsEditingDupr(true);
  };

  const handleCancelEdit = () => {
    setIsEditingDupr(false);
    setDuprValue(user.duprRating || '');
  };

  const handleSaveDupr = async () => {
    const sanitized = duprValue.trim();

    if (sanitized && !/^\d{1,2}(\.\d{1,2})?$/.test(sanitized)) {
      toast('Please enter a valid rating (e.g. 3.5 or 4.0)', 'error');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ dupr_rating: sanitized || null })
        .eq('id', user.id);

      if (error) throw error;

      await onRefreshProfile();
      setIsEditingDupr(false);
      toast('DUPR rating updated successfully', 'success');
    } catch (error) {
      console.error('Error updating DUPR rating:', error);
      toast('Failed to update DUPR rating. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDuprInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d{0,2}(\.\d{0,2})?$/.test(value)) {
      setDuprValue(value);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header user={user} onSignOut={onSignOut} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Profile Details</h1>
          <p className="text-slate-600">Your account information</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 h-32 rounded-t-xl"></div>

          <div className="px-6 pb-6">
            <div className="-mt-16 mb-4">
              <div className="w-32 h-32 bg-green-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg mx-auto sm:mx-0">
                <UserIcon className="h-16 w-16 text-white" />
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800 text-center sm:text-left">{user.firstName} {user.lastName}</h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">First Name</label>
                  <div className="flex items-center px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-800">{user.firstName}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">Last Name</label>
                  <div className="flex items-center px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-800">{user.lastName}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Email</label>
                <div className="flex items-center px-4 py-3 bg-slate-50 rounded-lg border border-slate-200 gap-3">
                  <Mail className="h-5 w-5 text-slate-400" />
                  <span className="text-slate-800">{user.email}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Mobile Number</label>
                <div className="flex items-center px-4 py-3 bg-slate-50 rounded-lg border border-slate-200 gap-3">
                  <Phone className="h-5 w-5 text-slate-400" />
                  <span className="text-slate-800">{user.phoneNumber || '—'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">DUPR Rating - Singles</label>
                {isEditingDupr ? (
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="inline-flex items-center bg-green-50 rounded-lg border border-green-300 px-3">
                      <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                      <input
                        type="text"
                        inputMode="decimal"
                        value={duprValue}
                        onChange={handleDuprInputChange}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveDupr();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        placeholder="e.g. 3.5"
                        maxLength={5}
                        autoFocus
                        disabled={saving}
                        className="bg-transparent text-lg font-semibold text-green-700 outline-none py-3 w-24 placeholder:text-green-300"
                      />
                    </div>
                    <button
                      onClick={handleSaveDupr}
                      disabled={saving}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Save"
                    >
                      {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors disabled:opacity-50"
                      title="Cancel"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleEditDupr}
                    className="flex items-center justify-between gap-4 w-full max-w-sm px-4 py-3 bg-green-50 rounded-lg border border-green-200 text-left hover:bg-green-100 hover:border-green-300 transition-colors group"
                    title="Edit DUPR Rating"
                  >
                    <span className="flex items-center min-w-0">
                      <TrendingUp className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-lg font-semibold text-green-700">
                        {user.duprRating || '-'}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-green-700 flex-shrink-0">
                      <Pencil className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      Edit rating
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
