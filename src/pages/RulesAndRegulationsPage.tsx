import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, Users, Calendar, Award, AlertCircle, Shield } from 'lucide-react';

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

export const RulesAndRegulationsPage: React.FC = () => {
  return (
    <>

      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 py-16">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-4">
            <Scale className="h-16 w-16 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Rules and Regulations
          </h1>
          <p className="text-xl text-green-50 max-w-3xl mx-auto">
            Ensuring fair, competitive, and enjoyable pickleball for all participants
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
          <p className="text-slate-700 leading-relaxed mb-4">
            These Rules and Regulations are designed to ensure that all Dinkly leagues remain competitive, enjoyable, fair, and friendly. They apply to all leagues and regions operated by Dinkly.
          </p>
          <p className="text-slate-700 leading-relaxed">
            By registering for and participating in any league or round, you agree to comply with these Rules and Regulations. The league organisers reserve the right to amend or update these rules at any time to ensure the effective and fair operation of the league.
          </p>
        </div>

        <Section number="1" title="General Player Responsibilities" icon={<Users className="h-6 w-6 text-green-600" />}>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>All competitions are self-funded and must be played in a fair and orderly manner.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Participation is entirely at your own risk. Dinkly, its organisers, and associated parties accept no responsibility for the health or safety of players, whether on court, at league facilities, or elsewhere.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Players are responsible for ensuring that any court used is safe and suitable for play.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Players are solely responsible for court bookings, hire fees, and equipment.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Players must be 18 years or older on the first day of the round.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Players must register and compete using their real name (no aliases or nicknames) and provide accurate contact details.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Players are expected to behave in a sporting, courteous, and respectful manner toward opponents, venue staff, officials, and organisers.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Players who behave disrespectfully or inappropriately may be removed from the league at the organisers' discretion.</span>
            </li>
          </ul>
        </Section>

        <Section number="2" title="Match Organisation" icon={<Calendar className="h-6 w-6 text-green-600" />}>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Balls and Courts</h3>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span><strong>Balls:</strong> Quality pickleball balls must be used. Each player should provide a set, with the final choice agreed upon before the match.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span><strong>Courts:</strong> Court costs should be shared equally unless otherwise agreed. Courts should be booked for at least one hour to allow sufficient time to complete the match.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>Matches may be played on any court mutually agreed by both players.</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Match Setup</h3>
              <p>Both players share responsibility for organising matches, including agreeing on the date, time, location, and expected duration in advance.</p>
            </div>
          </div>
        </Section>

        <Section number="3" title="Weather Conditions (Rain)" icon={<AlertCircle className="h-6 w-6 text-green-600" />}>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>If rain occurs before the match, players should contact each other to decide whether to postpone and reschedule.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>If a player considers the court unsafe or too slippery, they have the right to request a postponement.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>If rain or unsafe conditions arise during a match, either player may suspend play. The match may be resumed or completed on another agreed date.</span>
            </li>
          </ul>
        </Section>

        <Section number="4" title="Injury, Illness, and Retirement" icon={<AlertCircle className="h-6 w-6 text-green-600" />}>
          <ul className="space-y-3 mb-4">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>If a player leaves a match due to injury or illness, the match cannot be replayed.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>The match result must be recorded as "Retired."</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>The term retirement refers to unavoidable circumstances that prevent a player from continuing.</span>
            </li>
          </ul>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-slate-800 mb-2">Points allocation for a retirement:</h4>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span><strong>Winner:</strong> 2 points for the win + 1 participation point</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span><strong>Retiring player:</strong> 1 participation point + 1 point for each set won</span>
              </li>
            </ul>
            <p className="mt-3 text-sm">In the event of disagreement, the score recorded will be the score at the time play stopped.</p>
          </div>
        </Section>

        <Section number="5" title="Walkovers and Rescheduling" icon={<Calendar className="h-6 w-6 text-green-600" />}>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>If a player does not arrive at the scheduled time or is more than 30 minutes late, the opponent may:
                <ul className="ml-6 mt-2 space-y-1">
                  <li>- Claim a walkover and receive 2 points, or</li>
                  <li>- Agree to reschedule the match.</li>
                </ul>
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>The player responsible for a walkover receives 0 points.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>If a match needs to be rescheduled, the opponent's agreement is required. If no response is received, the match may be treated as a walkover.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Players wishing to change a match date must notify their opponent at least 24 hours in advance.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>The player requesting the postponement is responsible for any court costs incurred.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>If less than 24 hours' notice is given, the match will be recorded as a win for the opponent, and points will be awarded accordingly.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Players may not concede or abandon a match before, during, or after play, except in the case of injury retirement.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>If the agreed playing time expires, players should attempt to reschedule rather than abandon the match.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Matches must be completed within the round dates. Matches may not be played after the round has closed.</span>
            </li>
          </ul>
        </Section>

        <Section number="6" title="Player Withdrawal from a Round" icon={<Users className="h-6 w-6 text-green-600" />}>
          <p>If a player withdraws from a round, any player who did not play against them will receive 1 participation point.</p>
        </Section>

        <Section number="7" title="Disputes" icon={<Scale className="h-6 w-6 text-green-600" />}>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Players are encouraged to resolve disputes amicably by referring to these <a href="/rules-and-regulations" className="text-green-600 hover:text-green-700 underline">Rules and Regulations</a>.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>While the league is competitive, a friendly and respectful approach is expected at all times.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>If a dispute cannot be resolved between players, please email <a href="mailto:socialpickleballleague@gmail.com" className="text-green-600 hover:text-green-700 underline">socialpickleballleague@gmail.com</a> with full details.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Organisers will work with both parties to reach a fair resolution based on the information provided.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>As organisers are not present at matches, players are expected to be honest and accurate when reporting disputes.</span>
            </li>
          </ul>
        </Section>

        <Section number="8" title="Round Withdrawal" icon={<AlertCircle className="h-6 w-6 text-green-600" />}>
          <p>If you are unable to participate in a round, please email us so we can formally withdraw you.</p>
        </Section>

        <Section number="9" title="Round Dates and Extensions" icon={<Calendar className="h-6 w-6 text-green-600" />}>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Organisers reserve the right to modify published round dates where necessary.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Matches must be completed within the round dates.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span><strong>No extensions are granted under any circumstances.</strong></span>
            </li>
          </ul>
        </Section>

        <Section number="10" title="Groups and Player Placement" icon={<Users className="h-6 w-6 text-green-600" />}>
          <p className="mb-4">Players are placed into groups to ensure competitive matches at an appropriate level.</p>
          <p className="mb-3">Group placement is determined by factors including:</p>
          <ul className="space-y-2 ml-4 mb-4">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Number of registered players</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Interclub ranking (if applicable)</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Performance in previous rounds</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Information provided during registration</span>
            </li>
          </ul>
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Group placements may change between rounds. Each round is unique.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Group numbers are not transferable between rounds due to changes in player numbers.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Injury and other exceptional circumstances may also be considered.</span>
            </li>
          </ul>
        </Section>

        <Section number="11" title="Recording Match Scores" icon={<Award className="h-6 w-6 text-green-600" />}>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>The winner of the match must report the result as soon as possible after completion.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>The winner of each match logs in and submits the result through their dashboard. Results are reviewed and approved by an admin before appearing on the standings.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>All results must be submitted no later than the day after the round ends.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Once the Round Report is issued, the round is locked and results are final.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Submitted results are typically approved within 48 hours.</span>
            </li>
          </ul>
        </Section>

        <Section number="12" title="Match Score Integrity" icon={<Shield className="h-6 w-6 text-green-600" />}>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-amber-600 mr-2">•</span>
                <span>Players are expected to submit accurate and honest results.</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-600 mr-2">•</span>
                <span>Falsifying results, submitting results for unplayed matches, or manipulating dates or scores may result in disqualification.</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-600 mr-2">•</span>
                <span>Any attempt to falsify results should be reported to the organisers.</span>
              </li>
            </ul>
          </div>
        </Section>

        <Section number="13" title="Group Standings and Points System" icon={<Award className="h-6 w-6 text-green-600" />}>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-slate-800 mb-3">Points Breakdown:</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <span><strong>Participation:</strong> 1 point per player (excluding walkovers)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <span><strong>Win Bonus:</strong> 2 points for a match win</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <span><strong>Bonus Points:</strong> 2 bonus points are awarded to players who complete 3 matches by the midpoint of the round</span>
              </li>
            </ul>
          </div>
          <p className="mb-4">Players play each opponent once per round.</p>
          <div>
            <h4 className="font-semibold text-slate-800 mb-3">Tie-Break Rules</h4>
            <p className="mb-3">If players finish on equal points, standings are determined in the following order:</p>
            <ol className="space-y-2 ml-6 list-decimal">
              <li>Removal of walkover points</li>
              <li>Removal of bonus points</li>
              <li>Removal of points from matches not played as three full sets</li>
              <li>Most matches won</li>
              <li>Most matches played</li>
              <li>Fewest sets conceded per match</li>
              <li>Fewest games conceded per match</li>
              <li>Coin toss (if still tied)</li>
            </ol>
          </div>
        </Section>

        <Section number="14" title="Use of Player Details" icon={<Shield className="h-6 w-6 text-green-600" />}>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Player names appear in results tables and round reports.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Current and previous round results are publicly accessible.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>By participating, you consent to your contact details being shared with other players in your group.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Please refer to our <Link to="/privacy-policy" className="text-green-600 hover:text-green-700 underline">Privacy Policy</Link> for full details.</span>
            </li>
          </ul>
        </Section>

        <Section number="15" title="Minimum Entry Requirements" icon={<Users className="h-6 w-6 text-green-600" />}>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Players must be 18 years or older.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Players must act respectfully toward opponents, venues, venue staff, and organisers.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>We reserve the right to exclude players who do not meet these requirements.</span>
            </li>
          </ul>
        </Section>

        <Section number="16" title="Scoring Format" icon={<Award className="h-6 w-6 text-green-600" />}>
          <p className="mb-4 font-semibold">All matches are self-officiated. Players are expected to know the rules of pickleball and agree on the scoring format before play begins.</p>

          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h4 className="font-semibold text-slate-800 mb-3">Standard Match Format</h4>
              <ul className="space-y-2 ml-4 mb-3">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>Matches are played as the best of three games.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>Each game is played to 11 points, with a team needing to win by 2 points.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>If the match reaches a third game, it is also played to 11 points, win by 2.</span>
                </li>
              </ul>
              <div className="bg-white p-3 rounded border border-slate-300">
                <p className="text-sm font-semibold mb-2">Examples:</p>
                <ul className="text-sm space-y-1">
                  <li>• 11–7, 11–8</li>
                  <li>• 8–11, 11–6, 11–9</li>
                  <li>• 11–4, 9–11, 13–11</li>
                </ul>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h4 className="font-semibold text-slate-800 mb-3">Alternative Format (Time Limited)</h4>
              <p className="text-slate-600 mb-3">If players are unable to complete a full best-of-three match, they may agree before play to use one of the following formats:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>A single game to 15 points, win by 2.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>A single game to 21 points, win by 2.</span>
                </li>
              </ul>
            </div>
          </div>

          <p className="text-sm italic mt-4">Note: The standard competition format is best of three games to 11, and this is the preferred format for all league matches unless otherwise specified by the organiser.</p>
        </Section>

        <div className="bg-slate-100 border border-slate-300 rounded-lg p-6 text-center">
          <p className="text-slate-600 text-sm">
            These rules are subject to change. Please check this page regularly for updates.
          </p>
        </div>
      </div>
    </>
  );
};
