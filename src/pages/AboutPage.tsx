import React from 'react';
import { Users, Target, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';

export const AboutPage: React.FC = () => {
  return (
    <>

      {/* Hero Section */}
      <section className="relative py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-emerald-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-800 mb-6">
            About Dinkly
          </h1>
          <div className="text-left max-w-3xl mx-auto space-y-5 text-lg text-slate-600 leading-relaxed">
            <p>
              Dinkly was created with one simple goal: to make it easier for players to connect, compete, and enjoy the game.
            </p>
            <p>
              We recognised that many players don't always have the opportunity to play competitive pickleball through traditional weekend competitions or interclub events. Busy schedules, limited availability, and a lack of local playing opportunities can make it difficult to find regular, competitive matches.
            </p>
            <p className="text-xl font-semibold text-slate-700">
              That's why we created Dinkly.
            </p>
            <p>
              Our platform gives players the flexibility to join organised round-robin leagues, meet new people, and enjoy competitive games that fit around their lifestyle. Whether you're looking to improve your skills, challenge yourself against players of a similar ability, or simply expand your local pickleball network, we're here to help make it happen.
            </p>
            <p>
              We believe pickleball is more than just a sport—it's about building friendships, staying active, and creating lasting connections within your community.
            </p>
            <p>
              Our vision is to grow a welcoming and inclusive community where players of all skill levels can easily find games, compete in organised leagues, and share their passion for pickleball.
            </p>
            <p>
              Whether you're picking up a paddle for the first time or you're an experienced competitor, we invite you to join our community, play more often, and become part of a growing pickleball movement.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Our Mission</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              To create the ultimate platform for pickleball enthusiasts to connect, compete, and grow together
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">Connect</h3>
              <p className="text-slate-600 leading-relaxed">
                Build meaningful relationships with fellow pickleball players in your local community and beyond.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">Compete</h3>
              <p className="text-slate-600 leading-relaxed">
                Participate in leagues and matches that challenge your skills and help you reach new heights.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">Excel</h3>
              <p className="text-slate-600 leading-relaxed">
                Track your progress, improve your game, and celebrate your achievements with the community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Join Our Community?</h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Start your pickleball journey with us today and discover a world of opportunities,
            competition, and friendship.
          </p>
          <Link to="/">
            <Button
              variant="secondary"
              size="lg"
              className="!bg-white !text-green-600 hover:!bg-green-50 shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold"
            >
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
};