import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Shield, Users, CreditCard, AlertTriangle, Scale, Mail, Trophy } from 'lucide-react';

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
        <div className="bg-blue-100 p-2.5 rounded-lg mr-3">
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

export const TermsOfServicePage: React.FC = () => {
  return (
    <>

      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 py-16">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-4">
            <FileText className="h-16 w-16 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-green-50 max-w-3xl mx-auto">
            Understanding your rights and responsibilities as a league participant
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
          <p className="text-sm text-slate-600 mb-4">
            <strong>Effective date:</strong> 28th June 2026
          </p>
          <p className="text-slate-700 leading-relaxed mb-4">
            These Terms of Service ("Terms") govern your access to and participation in Dinkly ("we", "us", or "our"). By registering for, accessing, or participating in any Dinkly league, you agree to be bound by these Terms, together with our <Link to="/rules-and-regulations" className="text-blue-600 hover:text-blue-700 underline">Rules and Regulations</Link>, <Link to="/code-of-conduct" className="text-blue-600 hover:text-blue-700 underline">Code of Conduct</Link>, and <Link to="/privacy-policy" className="text-blue-600 hover:text-blue-700 underline">Privacy Policy</Link>.
          </p>
          <p className="text-slate-700 leading-relaxed font-semibold">
            If you do not agree to these Terms, you must not register for or participate in the League.
          </p>
        </div>

        <Section number="1" title="About Dinkly" icon={<Trophy className="h-6 w-6 text-blue-600" />}>
          <p>
            Dinkly provides adults with organised, social, and competitive tennis leagues. Participation is voluntary and subject to availability, eligibility, and compliance with these Terms.
          </p>
        </Section>

        <Section number="2" title="Eligibility" icon={<Users className="h-6 w-6 text-blue-600" />}>
          <p className="mb-3">To participate in Dinkly, you must:</p>
          <ul className="space-y-2 mb-4">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Be 18 years of age or older on the first day of a round</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Provide accurate, current, and complete registration information</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Register and compete using your real name</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Comply with these Terms, the Rules and Regulations, and the Code of Conduct</span>
            </li>
          </ul>
          <p className="italic text-sm bg-amber-50 border border-amber-200 rounded p-3">
            We reserve the right to refuse or terminate participation at our discretion.
          </p>
        </Section>

        <Section number="3" title="Registration and Accounts" icon={<Users className="h-6 w-6 text-blue-600" />}>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>You are responsible for maintaining the accuracy of your registration details.</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>You are responsible for all activity associated with your account.</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>We may suspend or terminate your account if we believe these Terms have been breached.</span>
            </li>
          </ul>
        </Section>

        <Section number="4" title="League Participation" icon={<Trophy className="h-6 w-6 text-blue-600" />}>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>League formats, schedules, groupings, and scoring systems are determined by us and may vary between rounds.</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>We reserve the right to modify, reschedule, suspend, or cancel leagues or rounds where required.</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Participation in matches is self-organised and self-umpired.</span>
            </li>
          </ul>
        </Section>

        <Section number="5" title="Fees and Payments" icon={<CreditCard className="h-6 w-6 text-blue-600" />}>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>League entry fees are self-funded and non-refundable except where required by law.</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Court hire fees, equipment costs, and related expenses are the sole responsibility of players.</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>We do not store credit card or bank details.</span>
            </li>
          </ul>
        </Section>

        <Section number="6" title="Risk, Health, and Safety" icon={<AlertTriangle className="h-6 w-6 text-blue-600" />}>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="font-semibold mb-3 flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              Important Safety Notice
            </p>
            <ul className="space-y-2 ml-7">
              <li className="flex items-start">
                <span className="text-red-600 mr-2">•</span>
                <span>Participation is entirely at your own risk.</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">•</span>
                <span>You acknowledge that tennis involves physical exertion and risk of injury.</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">•</span>
                <span>You are responsible for assessing your own fitness, health, and the safety of playing conditions.</span>
              </li>
            </ul>
          </div>
          <p className="font-semibold">
            Dinkly accepts no liability for injury, illness, loss, or damage suffered in connection with participation, except where liability cannot be excluded by law.
          </p>
        </Section>

        <Section number="7" title="Conduct and Behaviour" icon={<Shield className="h-6 w-6 text-blue-600" />}>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>All participants must comply with the <Link to="/code-of-conduct" className="text-blue-600 hover:text-blue-700 underline">Code of Conduct</Link> at all times.</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Unsporting, abusive, discriminatory, or unsafe behaviour may result in suspension or removal from the League.</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>We reserve the right to take disciplinary action without prior warning in serious cases.</span>
            </li>
          </ul>
        </Section>

        <Section number="8" title="Results, Records, and Public Information" icon={<FileText className="h-6 w-6 text-blue-600" />}>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Match results, player names, and league standings are publicly displayed and archived.</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>By participating, you consent to this public use of your information.</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>While accounts may be deleted or suspended, historical match records may be retained for legitimate interests.</span>
            </li>
          </ul>
        </Section>

        <Section number="9" title="Intellectual Property" icon={<Shield className="h-6 w-6 text-blue-600" />}>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>All content on our website, including text, branding, and league materials, is owned by or licensed to Dinkly.</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>You may not reproduce, distribute, or use our content without permission, except for personal, non-commercial use.</span>
            </li>
          </ul>
        </Section>

        <Section number="10" title="Third-Party Venues and Services" icon={<AlertTriangle className="h-6 w-6 text-blue-600" />}>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Matches are played at third-party venues not owned or controlled by us.</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>We are not responsible for the condition, availability, or rules of external courts or facilities.</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Any disputes with venues must be resolved directly with the venue provider.</span>
            </li>
          </ul>
        </Section>

        <Section number="11" title="Suspension and Termination" icon={<Shield className="h-6 w-6 text-blue-600" />}>
          <p className="mb-3">We may suspend or terminate your participation or account if:</p>
          <ul className="space-y-2 mb-4">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>You breach these Terms, the Rules and Regulations, or the Code of Conduct</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>You engage in behaviour that harms the League or other participants</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>You fail to comply with reasonable directions from organisers</span>
            </li>
          </ul>
          <p className="font-semibold text-sm bg-amber-50 border border-amber-200 rounded p-3">
            Termination may occur without refund and without notice where justified.
          </p>
        </Section>

        <Section number="12" title="Limitation of Liability" icon={<Scale className="h-6 w-6 text-blue-600" />}>
          <p className="mb-3">To the maximum extent permitted by law:</p>
          <ul className="space-y-2 mb-4">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>We exclude all liability for loss or damage arising from participation in the League</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>We are not liable for indirect or consequential loss</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Our total liability is limited to the amount paid by you to participate in the relevant round</span>
            </li>
          </ul>
          <p className="text-sm italic">
            Nothing in these Terms limits rights under the Consumer Guarantees Act 1993 where applicable.
          </p>
        </Section>

        <Section number="13" title="Changes to These Terms" icon={<FileText className="h-6 w-6 text-blue-600" />}>
          <p>
            We may update these Terms from time to time. Updated Terms will be published on our website and apply from the effective date shown. Continued participation constitutes acceptance of the updated Terms.
          </p>
        </Section>

        <Section number="14" title="Governing Law" icon={<Scale className="h-6 w-6 text-blue-600" />}>
          <p>
            These Terms are governed by the laws of New Zealand, and any disputes are subject to the exclusive jurisdiction of New Zealand courts.
          </p>
        </Section>

        <Section number="15" title="Contact Information" icon={<Mail className="h-6 w-6 text-blue-600" />}>
          <p className="mb-3">For questions regarding these Terms, please contact:</p>
          <p>
            <strong>Email:</strong> <a href="mailto:socialtennisleague@gmail.com" className="text-blue-600 hover:text-blue-700 underline">socialtennisleague@gmail.com</a>
          </p>
        </Section>

        <div className="bg-slate-100 border border-slate-300 rounded-lg p-6 text-center">
          <p className="text-slate-600 text-sm">
            These Terms of Service are subject to change. Please check this page regularly for updates.
          </p>
        </div>
      </div>
    </>
  );
};
