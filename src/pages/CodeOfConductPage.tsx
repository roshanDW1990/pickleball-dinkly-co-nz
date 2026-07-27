import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Heart, CheckCircle, AlertTriangle, Users, MessageCircle, FileText } from 'lucide-react';

interface SectionProps {
  number: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ number, title, icon, children }) => {
  return (
    <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 mb-6">
      <div className="flex items-center mb-4">
        <div className="bg-green-100 p-2.5 rounded-lg mr-3">
          {icon}
        </div>
        <h2 className="text-2xl font-bold text-slate-800">
          {number}. {title}
        </h2>
      </div>
      <div className="text-slate-700 leading-relaxed">
        {children}
      </div>
    </div>
  );
};

export const CodeOfConductPage: React.FC = () => {
  return (
    <>

      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 py-16">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Code of Conduct
          </h1>
          <p className="text-xl text-green-50 max-w-3xl mx-auto">
            Ensuring a safe, respectful, and inclusive pickleball experience for everyone
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
          <p className="text-slate-700 leading-relaxed mb-4">
            The Dinkly Code of Conduct sets clear expectations for behaviour to ensure that all participants enjoy a safe, respectful, inclusive, and enjoyable pickleball experience. This Code applies to all players, participants, and interactions, both on and off the court.
          </p>
          <p className="text-slate-700 leading-relaxed">
            By registering for and participating in any Dinkly league, you agree to comply with this Code of Conduct.
          </p>
        </div>

        <Section number="1" title="Core Principles" icon={<Heart className="h-6 w-6 text-green-600" />}>
          <p className="mb-3">All players are expected to:</p>
          <ul className="space-y-3">
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Play fairly and honestly</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Treat others with respect and courtesy</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Promote a positive and inclusive environment</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Act in the spirit of good sportsmanship at all times</span>
            </li>
          </ul>
        </Section>

        <Section number="2" title="Respectful Behaviour" icon={<Users className="h-6 w-6 text-green-600" />}>
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-slate-800 mb-3">Players must:</p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Treat opponents, organisers, venue staff, and other players with respect</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Communicate in a polite, professional, and constructive manner</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Respect differences in skill level, experience, background, and ability</span>
                </li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-semibold text-slate-800 mb-3 flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                The following behaviour will not be tolerated:
              </p>
              <ul className="space-y-2 ml-7">
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Verbal abuse, harassment, intimidation, or bullying</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Discriminatory or offensive language or behaviour</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Aggressive, threatening, or intimidating conduct</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Repeated unsporting behaviour</span>
                </li>
              </ul>
            </div>
          </div>
        </Section>

        <Section number="3" title="Fair Play and Integrity" icon={<CheckCircle className="h-6 w-6 text-green-600" />}>
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-slate-800 mb-3">Players must:</p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Compete honestly and to the best of their ability</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Accurately record and report match results</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Follow agreed scoring formats and league rules</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Respect line calls and decisions in self-umpired matches</span>
                </li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-semibold text-slate-800 mb-3 flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                Prohibited conduct includes:
              </p>
              <ul className="space-y-2 ml-7">
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Falsifying match results or scores</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Claiming wins for matches not played</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Manipulating dates, scores, or match outcomes to gain advantage</span>
                </li>
              </ul>
            </div>
          </div>
        </Section>

        <Section number="4" title="Safety and Responsibility" icon={<Shield className="h-6 w-6 text-green-600" />}>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Players participate at their own risk.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Players are responsible for assessing court conditions and their own physical readiness to play.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>If a court is unsafe or conditions pose a risk, players should postpone or suspend play.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Players should not continue play if injured or unwell.</span>
            </li>
          </ul>
        </Section>

        <Section number="5" title="Communication and Scheduling" icon={<MessageCircle className="h-6 w-6 text-green-600" />}>
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-slate-800 mb-3">Players are expected to:</p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Communicate promptly and clearly when arranging or rescheduling matches</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Provide reasonable notice if unable to attend a scheduled match</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Make genuine efforts to schedule and complete matches within round dates</span>
                </li>
              </ul>
            </div>
            <p className="text-sm italic bg-amber-50 border border-amber-200 rounded p-3">
              Failure to communicate or repeated unresponsiveness may result in penalties or removal from the league.
            </p>
          </div>
        </Section>

        <Section number="6" title="Use of Personal Information" icon={<Shield className="h-6 w-6 text-green-600" />}>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Player contact details must only be used for league-related communication.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Using another player's contact information for harassment, spam, or non-league purposes is strictly prohibited.</span>
            </li>
          </ul>
        </Section>

        <Section number="7" title="Alcohol, Drugs, and Conduct" icon={<AlertTriangle className="h-6 w-6 text-green-600" />}>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Players must not participate while under the influence of drugs or excessive alcohol.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Any behaviour that compromises safety or enjoyment of others will be treated as a breach of this Code.</span>
            </li>
          </ul>
        </Section>

        <Section number="8" title="Breaches and Enforcement" icon={<Shield className="h-6 w-6 text-green-600" />}>
          <p className="mb-4">Dinkly reserves the right to take action where this Code of Conduct is breached. Actions may include:</p>
          <ul className="space-y-2 mb-4">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Verbal or written warnings</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Loss of points or match results</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Suspension from a round or league</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Permanent removal from Dinkly</span>
            </li>
          </ul>
          <p className="font-semibold bg-red-50 border border-red-200 rounded p-3">
            Serious or repeated breaches may result in immediate removal without warning.
          </p>
        </Section>

        <Section number="9" title="Reporting Concerns" icon={<MessageCircle className="h-6 w-6 text-green-600" />}>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Players are encouraged to resolve minor issues respectfully between themselves where possible.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Serious concerns, disputes, or breaches should be reported to <a href="mailto:socialpickleballleague@gmail.com" className="text-green-600 hover:text-green-700 underline">socialpickleballleague@gmail.com</a> with relevant details.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>All reports will be treated seriously and handled fairly.</span>
            </li>
          </ul>
        </Section>

        <Section number="10" title="Acknowledgement" icon={<FileText className="h-6 w-6 text-green-600" />}>
          <p>
            Participation in Dinkly constitutes acknowledgement and acceptance of this Code of Conduct, in addition to the <Link to="/rules-and-regulations" className="text-green-600 hover:text-green-700 underline">Rules and Regulations</Link> and <Link to="/privacy-policy" className="text-green-600 hover:text-green-700 underline">Privacy Policy</Link>.
          </p>
        </Section>

        <div className="bg-slate-100 border border-slate-300 rounded-lg p-6 text-center">
          <p className="text-slate-600 text-sm">
            This Code of Conduct is subject to change. Please check this page regularly for updates.
          </p>
        </div>
      </div>
    </>
  );
};
