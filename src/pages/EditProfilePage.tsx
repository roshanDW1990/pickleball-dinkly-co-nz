import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/dashboard/Header';
import { Footer } from '../components/common/Footer';
import { Mail, Phone, Save, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface EditProfilePageProps {
  user: User;
  onSignOut: () => void;
}

export const EditProfilePage: React.FC<EditProfilePageProps> = ({ user, onSignOut }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(user.email);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailPending, setEmailPending] = useState(false);

  const emailChanged = email.trim().toLowerCase() !== user.email.toLowerCase();
  const phoneChanged = phoneNumber.trim() !== (user.phoneNumber || '');
  const hasChanges = emailChanged || phoneChanged;

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

        setEmailPending(true);
        setSaving(false);
        return;
      }

      setSuccess('Your profile has been updated successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (emailPending) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header user={user} onSignOut={onSignOut} />

        <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Check Your Inbox</h2>
            <p className="text-slate-600 mb-2">
              We've sent a confirmation link to <strong className="text-slate-800">{email.trim().toLowerCase()}</strong>.
            </p>
            <p className="text-slate-600 mb-6">
              Click the link in that email to confirm your new address. Your email won't change until you confirm.
            </p>
            {phoneChanged && (
              <div className="flex items-center justify-center gap-2 text-green-700 bg-green-50 rounded-lg p-3 mb-6">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Phone number updated successfully.</span>
              </div>
            )}
            <button
              onClick={() => navigate('/details')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Back to Profile
            </button>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header user={user} onSignOut={onSignOut} />

      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <button
          onClick={() => navigate('/details')}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Profile</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Edit Profile</h1>
          <p className="text-slate-600">Update your contact information below</p>
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

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
                  placeholder="your@email.com"
                />
              </div>
              {emailChanged && (
                <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  A confirmation link will be sent to your new email address.
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
                  placeholder="+64 21 123 4567"
                />
              </div>
              <p className="text-xs text-slate-500">
                This is shared with other players in your league group to arrange matches.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4">
            <button
              onClick={() => navigate('/details')}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-medium text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
