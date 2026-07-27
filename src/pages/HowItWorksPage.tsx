import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Users, Calendar, Award } from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  return (
    <>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 py-16">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How It Works
          </h1>
          <p className="text-xl text-green-50 max-w-2xl mx-auto">
            Everything you need to know to get started with Dinkly
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Getting Started Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">
            How to Get Started
          </h2>

          {/* New Players */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 mb-6">
            <div className="flex items-center mb-6">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <UserPlus className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">New Players</h3>
            </div>

            <ol className="space-y-4 text-slate-700">
              <li className="flex">
                <span className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-3">1</span>
                <span className="pt-1">Create your Dinkly profile</span>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-3">2</span>
                <span className="pt-1">Visit the League page and sign up for the Round.</span>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-3">3</span>
                <span className="pt-1">We'll place you into a group of 4–8 players (depending on registrations) based on your skill level.</span>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-3">4</span>
                <div className="pt-1">
                  <p className="mb-2">The day before the Round begins, you'll receive an email with your group's contact details. Many players set up a WhatsApp group to make organising matches easier.</p>
                  <p className="text-sm italic">You can play your matches anytime and anywhere within the 8-week Round. Court fees (if any) should be shared.</p>
                </div>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-3">5</span>
                <span className="pt-1">
                  The winner of each match logs in and submits the result through their dashboard. Results are reviewed and approved by an admin before appearing on the standings.
                </span>
              </li>
            </ol>

            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                For more details, check out our{' '}
                <Link to="/faq" className="font-semibold underline hover:text-green-700">
                  FAQs
                </Link>
                .
              </p>
            </div>
          </div>

          {/* Returning Players */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Returning Players</h3>
            </div>

            <ol className="space-y-4 text-slate-700">
              <li className="flex">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">1</span>
                <span className="pt-1">Log in to your account and sign up for the next Round.</span>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">2</span>
                <span className="pt-1">We'll match you with 4–8 players of a similar standard.</span>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">3</span>
                <span className="pt-1">Arrange matches at times and locations that suit you and your opponents. Share any court fees.</span>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">4</span>
                <span className="pt-1">
                  The winner of each match logs in and submits the result through their dashboard. Results are reviewed and approved by an admin before appearing on the standings.
                </span>
              </li>
            </ol>
          </div>
        </div>

        {/* How It Works Details */}
        <div className="bg-gradient-to-br from-slate-50 to-green-50 rounded-xl p-8 shadow-sm border border-slate-200 mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">
            How It Works
          </h2>

          <p className="text-lg text-slate-700 mb-6 leading-relaxed">
            Adults aged 18+ of all pickleball levels are welcome to join any League in your region. It's a great way to meet new players, stay active, and enjoy social yet competitive pickleball.
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mb-4">The basics:</h3>

          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <div className="flex items-start">
                <Calendar className="h-6 w-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                <div className="space-y-3 text-slate-700">
                  <p>• Open to all adults aged 18 and over.</p>
                  <p>• Leagues are mixed, and matches are singles only (men and women play together).</p>
                  <p>• Doubles leagues are not currently offered.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <div className="flex items-start">
                <Users className="h-6 w-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                <div className="space-y-3 text-slate-700">
                  <p>• Players are grouped by similar playing level, usually 4–8 players per group depending on Round entries.</p>
                  <p>• Contact details are emailed the day before the Round starts.</p>
                  <p>• Players organise their own matches at mutually suitable locations and times.</p>
                  <p>• Any court can be used, and court costs are shared if applicable.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <div className="flex items-start">
                <Award className="h-6 w-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                <div className="text-slate-700">
                  <p className="font-semibold mb-3">Scoring:</p>
                  <ul className="space-y-2 ml-4">
                    <li>○ 1 point for playing a match</li>
                    <li>○ 2 points for winning</li>
                    <li>○ 2 bonus points for playing at least 3 matches by the mid-point of the Round</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <p className="text-slate-700 font-medium">
                • Group winners may be promoted to the next group in the following Round.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-green-600 rounded-xl p-8 text-center shadow-lg">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-green-50 mb-6 text-lg">
            Join our pickleball community today and start playing competitive matches!
          </p>
          <Link
            to="/?mode=signup"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-green-600 font-bold rounded-lg hover:bg-green-50 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Sign Up Now
          </Link>
        </div>
      </div>
    </>
  );
};
