import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, CreditCard, CloudRain, UserX, XCircle, AlertTriangle, Copy, Ban, ArrowRightLeft, Wallet, Mail } from 'lucide-react';

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

export const RefundPolicyPage: React.FC = () => {
  return (
    <>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 py-16">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-4">
            <CreditCard className="h-16 w-16 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Refund & Cancellation Policy
          </h1>
          <p className="text-xl text-green-50 max-w-2xl mx-auto">
            Effective date: 29 July 2026
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
          <p className="text-slate-700 leading-relaxed">
            This Refund & Cancellation Policy explains how Dinkly manages cancellations, refunds, and unexpected circumstances relating to league participation.
          </p>
        </div>

        <Section number="1" title="Player Cancellation Before League Starts" icon={<CreditCard className="h-6 w-6 text-green-600" />}>
          <p className="font-semibold text-slate-800 mb-3">Scenario: Player withdraws before the league begins</p>
          <p className="mb-4">If a player can no longer participate after registering but before the league start date:</p>
          <ul className="space-y-3 mb-4">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>A refund may be provided, subject to any non-refundable payment processing fees.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Players should <Link to="/contact" className="text-green-600 hover:text-green-700 underline">contact Dinkly</Link> as soon as possible to allow time to fill their position.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Refund requests will be processed in accordance with this policy.</span>
            </li>
          </ul>
          <p className="text-sm text-slate-600 mb-2">Examples may include:</p>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Change of plans</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Personal commitments</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Unable to commit to the league schedule</span>
            </li>
          </ul>
        </Section>

        <Section number="2" title="Player Cancellation After League Starts" icon={<XCircle className="h-6 w-6 text-green-600" />}>
          <p className="font-semibold text-slate-800 mb-3">Scenario: Player leaves part-way through the league</p>
          <p className="mb-4">If a player withdraws after the league has commenced (on or after the official start date):</p>
          <ul className="space-y-3 mb-4">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Entry fees are generally non-refundable.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Dinkly may attempt to assist with replacement players where possible.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Existing match results may remain valid to maintain fairness for other participants.</span>
            </li>
          </ul>
          <p className="text-sm text-slate-600 mb-2">Examples may include:</p>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Injury</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Personal circumstances</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Change in availability</span>
            </li>
          </ul>
        </Section>

        <Section number="3" title="Insufficient Player Registrations" icon={<AlertTriangle className="h-6 w-6 text-green-600" />}>
          <p className="font-semibold text-slate-800 mb-3">Scenario: League does not reach the required number of players</p>
          <p className="mb-4">If a league does not receive enough registrations to proceed, Dinkly may:</p>
          <ul className="space-y-3 mb-4">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Cancel the league.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Delay the league start date.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Combine players into another suitable group.</span>
            </li>
          </ul>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="font-semibold text-slate-800">If Dinkly cancels the league, affected players will receive:</p>
            <p className="mt-2">A full refund of their league entry fee.</p>
          </div>
        </Section>

        <Section number="4" title="Weather Cancellations" icon={<CloudRain className="h-6 w-6 text-green-600" />}>
          <p className="font-semibold text-slate-800 mb-3">Scenario: Matches are affected by weather conditions</p>
          <p className="text-sm text-slate-600 mb-2">Examples include:</p>
          <ul className="space-y-2 text-sm text-slate-600 mb-4">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Rain</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Extreme heat</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Unsafe playing conditions</span>
            </li>
          </ul>
          <p className="mb-4">Where weather affects scheduled matches, Dinkly may:</p>
          <ul className="space-y-3 mb-4">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Extend the league timeframe.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Adjust fixtures or schedules.</span>
            </li>
          </ul>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="font-semibold text-slate-800">Weather-related disruptions do not automatically qualify for refunds.</p>
          </div>
        </Section>

        <Section number="5" title="Opponent Does Not Attend" icon={<UserX className="h-6 w-6 text-green-600" />}>
          <p className="font-semibold text-slate-800 mb-3">Scenario: A player is unable to complete a match because their opponent does not attend</p>
          <p className="mb-4">Dinkly may:</p>
          <ul className="space-y-3 mb-4">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Apply the relevant <Link to="/rules-and-regulations" className="text-green-600 hover:text-green-700 underline">league rules</Link> and record results accordingly.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Review repeated no-shows or attendance issues.</span>
            </li>
          </ul>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <p className="font-semibold text-slate-800">Individual missed matches do not qualify for refunds.</p>
          </div>
        </Section>

        <Section number="6" title="League Cancellation by Dinkly" icon={<XCircle className="h-6 w-6 text-green-600" />}>
          <p className="font-semibold text-slate-800 mb-3">Scenario: Dinkly cancels a league</p>
          <p className="mb-4">If Dinkly cancels a league due to:</p>
          <ul className="space-y-3 mb-4">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Insufficient registrations</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Operational reasons</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Circumstances outside Dinkly's reasonable control</span>
            </li>
          </ul>
          <p className="mb-4">Dinkly will notify affected players as soon as possible.</p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="font-semibold text-slate-800">Players will receive:</p>
            <p className="mt-2">A full refund of their league entry fee.</p>
          </div>
        </Section>

        <Section number="7" title="Events Outside Dinkly's Control (Force Majeure)" icon={<AlertTriangle className="h-6 w-6 text-green-600" />}>
          <p className="font-semibold text-slate-800 mb-3">Scenario: Unexpected events prevent a league from operating</p>
          <p className="text-sm text-slate-600 mb-2">Examples include:</p>
          <ul className="space-y-2 text-sm text-slate-600 mb-4">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Natural disasters</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Government restrictions</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Emergency situations</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Other events outside Dinkly's reasonable control</span>
            </li>
          </ul>
          <p className="mb-4">Dinkly may:</p>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Pause the league.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Reschedule matches.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Extend the competition period.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Offer refunds depending on the circumstances.</span>
            </li>
          </ul>
        </Section>

        <Section number="8" title="Duplicate or Incorrect Payments" icon={<Copy className="h-6 w-6 text-green-600" />}>
          <p className="font-semibold text-slate-800 mb-3">Scenario: Player accidentally makes multiple payments</p>
          <p className="mb-4">If a duplicate payment occurs:</p>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>The duplicate payment will be refunded.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Any applicable non-refundable payment processing fees may be deducted.</span>
            </li>
          </ul>
        </Section>

        <Section number="9" title="Account Suspension or Removal" icon={<Ban className="h-6 w-6 text-green-600" />}>
          <p className="font-semibold text-slate-800 mb-3">Scenario: Player breaches league rules</p>
          <p className="mb-4">If a player's participation is removed due to:</p>
          <ul className="space-y-3 mb-4">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Unsportsmanlike behaviour</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Harassment</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Cheating</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Abuse of other players</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Breaching Dinkly's <Link to="/terms-of-service" className="text-green-600 hover:text-green-700 underline">Terms & Conditions</Link></span>
            </li>
          </ul>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="font-semibold text-slate-800">Entry fees will not be refunded.</p>
          </div>
          <p className="mt-4 text-sm text-slate-600">
            For more information about expected behaviour, please see our <Link to="/code-of-conduct" className="text-green-600 hover:text-green-700 underline">Code of Conduct</Link>.
          </p>
        </Section>

        <Section number="10" title="Transfer of League Entry" icon={<ArrowRightLeft className="h-6 w-6 text-green-600" />}>
          <p className="font-semibold text-slate-800 mb-3">Scenario: Player wants to transfer their league position</p>
          <p className="mb-4">Players cannot transfer their registration to another person without approval from Dinkly.</p>
          <p className="mb-4">A transfer may be permitted if:</p>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>The replacement player meets league requirements.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>The transfer request is made before the league starts.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>The change does not impact league organisation.</span>
            </li>
          </ul>
        </Section>

        <Section number="11" title="Payment Provider Issues" icon={<Wallet className="h-6 w-6 text-green-600" />}>
          <p className="font-semibold text-slate-800 mb-3">Scenario: Payment fails or is reversed</p>
          <p className="mb-4">If payment is unsuccessful:</p>
          <ul className="space-y-3 mb-6">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Registration may not be confirmed.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Players may need to complete payment before participating in a league.</span>
            </li>
          </ul>
          <p className="font-semibold text-slate-800 mb-3">If a payment dispute, chargeback, or payment reversal is initiated:</p>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Dinkly may temporarily restrict access to league services while the matter is reviewed and resolved.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Dinkly will work with the player and relevant payment providers to resolve the matter fairly.</span>
            </li>
          </ul>
        </Section>

        {/* Contact Section */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 mb-6">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-2.5 rounded-lg mr-3">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Contact Us</h2>
          </div>
          <div className="text-slate-700 leading-relaxed">
            <p className="mb-3">If you have questions about this Refund & Cancellation Policy, or need to request a refund, please contact us:</p>
            <p>
              <strong>Email:</strong>{' '}
              <a href="mailto:hello@dinkly.co.nz" className="text-green-600 hover:text-green-700 underline">
                hello@dinkly.co.nz
              </a>
            </p>
          </div>
        </div>

        <div className="bg-slate-100 border border-slate-300 rounded-lg p-6 text-center">
          <p className="text-slate-600 text-sm">
            This Refund & Cancellation Policy is subject to change. Please check this page regularly for updates.
            See also our <Link to="/terms-of-service" className="text-green-600 hover:text-green-700 underline">Terms of Service</Link> and <Link to="/privacy-policy" className="text-green-600 hover:text-green-700 underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </>
  );
};
