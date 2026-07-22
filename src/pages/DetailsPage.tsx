import React from 'react';
import { Header } from '../components/dashboard/Header';
import { Footer } from '../components/common/Footer';
import { User as UserIcon, Mail, Phone, TrendingUp } from 'lucide-react';
import { User } from '../types';

interface DetailsPageProps {
  user: User;
  onSignOut: () => void;
}

export const DetailsPage: React.FC<DetailsPageProps> = ({ user, onSignOut }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header user={user} onSignOut={onSignOut} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Profile Details</h1>
          <p className="text-slate-600">View and manage your account information</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 h-32"></div>

          <div className="px-6 pb-6">
            <div className="flex items-end -mt-16 mb-6">
              <div className="w-32 h-32 bg-green-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <UserIcon className="h-16 w-16 text-white" />
              </div>
              <div className="ml-6 mb-2">
                <h2 className="text-2xl font-bold text-slate-800">{user.firstName} {user.lastName}</h2>
              </div>
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
                <div className="flex items-center px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
                  <Mail className="h-5 w-5 text-slate-400 mr-3" />
                  <span className="text-slate-800">{user.email}</span>
                </div>
              </div>

              {user.phoneNumber && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">Mobile Number</label>
                  <div className="flex items-center px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
                    <Phone className="h-5 w-5 text-slate-400 mr-3" />
                    <span className="text-slate-800">{user.phoneNumber}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">DUPR Rating - Singles</label>
                <div className="inline-flex items-center px-4 py-3 bg-green-50 rounded-lg border border-green-200 w-auto">
                  <TrendingUp className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-lg font-semibold text-green-700">
                    {user.duprRating || '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
