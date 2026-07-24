import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Users } from 'lucide-react';
import { Header } from './Header';
import { StatsCard } from './StatsCard';
import { Footer } from '../common/Footer';
import { User } from '../../types';

interface DashboardProps {
  user: User;
  onSignOut: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onSignOut }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header user={user} onSignOut={onSignOut} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            Welcome back, {user.firstName}!
          </h2>
          <p className="text-slate-600">Ready to dominate the courts today?</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatsCard
            title="Win Rate"
            value={`${user.stats.winRate}%`}
            icon={TrendingUp}
            trend={{ value: 5, isPositive: true }}
          />
          <Link to="/match-history" className="block">
            <StatsCard
              title="Matches Played"
              value={user.stats.matchesPlayed}
              icon={Users}
              trend={{ value: 23, isPositive: true }}
              subtitle="View history →"
            />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};