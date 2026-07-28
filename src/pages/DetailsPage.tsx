import React, { useState, useEffect } from 'react';
import { Header } from '../components/dashboard/Header';
import { Footer } from '../components/common/Footer';
import { User as UserIcon, Mail, Phone, TrendingUp, Save, AlertCircle, CheckCircle, Pencil, X } from 'lucide-react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface DetailsPageProps {
  user: User;
  onSignOut: () => void;
  refreshProfile: () => Promise<void>;
}

export const DetailsPage: React.FC<DetailsPageProps> = ({ user, onSignOut, refreshProfile }) => {
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState(user.email);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const emailChanged = email.trim().toLowerCase() !== user.email.toLowerCase();
  const phoneChanged = phoneNumber.trim() !== (user.phoneNumber || '');
  const hasChanges = emailChanged || phoneChanged;

  useEffect(() => {
    setEmail(user.email);
    setPhoneNumber(user.phoneNumber || '');
  }, [user.email, user.phoneNumber]);

  const handleCancel = () => {
    setEditing(false);
    setEmail(user.email);
    setPhoneNumber(user.phoneNumber || '');
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      if (phoneChanged) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ phone_number: phoneNumber.trim() || null })
          .eq('id', user.id);

        if (profileError) {
          throw new Error('Failed to update phone number. Please try again.');
        }
      }

      if (emailChanged) {
        const newEmail = email.trim().toLowerCase();
        const { error: authError } = await supabase.auth.updateUser({
          email: newEmail,
        });

        if (authError) {
          if (authError.message.includes('already')) {
            throw new Error('This email address is already in use by another account.');
          }
          throw new Error(authError.message);
        }

        setSuccess(
          phoneChanged
            ? 'Phone number updated. A confirmation link has been sent to your new email — click it to complete the change.'
            : 'A confirmation link has been sent to your new email address. Click it to complete the change.'
        );
        setSaving(false);
        setEditing(false);
        return;
      }

      await refreshProfile();
      setSuccess('Your profile has been updated successfully.');
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header user={user} onSignOut={onSignOut} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Profile Details</h1>
          <p className="text-slate-600">View and manage your account information</p>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 h-32 rounded-t-xl"></div>

          <div className="px-6 pb-6">
            <div className="-mt-16 mb-4">
              <div className="w-32 h-32 bg-green-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg mx-auto sm:mx-0">
                <UserIcon className="h-16 w-16 text-white" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-slate-800 text-center sm:text-left">{user.firstName} {user.lastName}</h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors self-center sm:self-auto"
                >
                  <Pencil className="h-4 w-4" />
                  Edit Profile
                </button>
              )}
              {editing && (
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition-colors self-center sm:self-auto"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              )}
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

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-600">Email</label>
                {editing ? (
                  <>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setSuccess(''); setError(''); }}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
                        placeholder="your@email.com"
                      />
                    </div>
                    {emailChanged && (
                      <p className="text-xs text-amber-600 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        A confirmation link will be sent to your new email address.
                      </p>
                    )}
                  </>
                ) : (
                  <div className="flex items-center px-4 py-3 bg-slate-50 rounded-lg border border-slate-200 gap-3">
                    <Mail className="h-5 w-5 text-slate-400" />
                    <span className="text-slate-800">{user.email}</span>
                  </div>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-slate-600">Mobile Number</label>
                {editing ? (
                  <>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        id="phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => { setPhoneNumber(e.target.value); setSuccess(''); setError(''); }}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
                        placeholder="+64 21 123 4567"
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Shared with other players in your league group to arrange matches.
                    </p>
                  </>
                ) : (
                  <div className="flex items-center px-4 py-3 bg-slate-50 rounded-lg border border-slate-200 gap-3">
                    <Phone className="h-5 w-5 text-slate-400" />
                    <span className="text-slate-800">{user.phoneNumber || '—'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">DUPR Rating - Singles</label>
                <div className="inline-flex items-center px-4 py-3 bg-green-50 rounded-lg border border-green-200 w-auto">
                  <TrendingUp className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-lg font-semibold text-green-700">
                    {user.duprRating || '-'}
                  </span>
                </div>
              </div>

              {/* Save button */}
              {editing && hasChanges && (
                <div className="pt-4 border-t border-slate-200">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
