import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, FileText, Clock, Mail } from 'lucide-react';

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, icon, children }) => {
  return (
    <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 mb-6">
      <div className="flex items-center mb-4">
        <div className="bg-green-100 p-2.5 rounded-lg mr-3">
          {icon}
        </div>
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
      </div>
      <div className="text-slate-700 leading-relaxed">
        {children}
      </div>
    </div>
  );
};

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 py-16">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-green-50 max-w-2xl mx-auto">
            Effective date: 1st January 2026
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
          <p className="text-slate-700 leading-relaxed">
            Dinkly exists to provide adults with a friendly, social, and competitive pickleball experience through an organised league structure. To deliver these services, we collect and use certain personal information. We are committed to protecting your privacy and handling your personal data with care, transparency, and in accordance with applicable data protection laws.
          </p>
        </div>

        {/* Section 1: Information We Collect */}
        <Section
          title="1. Information We Collect"
          icon={<FileText className="h-6 w-6 text-green-600" />}
        >
          <p className="mb-4">
            We collect only the information necessary to operate our leagues and provide our services. This may include:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li>Your name</li>
            <li>Email address and phone number</li>
            <li>League registration details</li>
            <li>Playing standard and pickleball-related information</li>
            <li>Match participation and results</li>
          </ul>
          <p className="text-sm italic bg-slate-50 p-4 rounded-lg border border-slate-200">
            We do not collect or store sensitive personal data (such as ethnic origin, political opinions, or similar information), nor do we collect or store bank account or credit card details.
          </p>
        </Section>

        {/* Section 2: How We Use Your Information */}
        <Section
          title="2. How We Use Your Information"
          icon={<Eye className="h-6 w-6 text-green-600" />}
        >
          <p className="mb-4">
            Your personal information is used for the following purposes:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li>Managing your account and league registration</li>
            <li>Organising league rounds, groups, and matches</li>
            <li>Communicating important league information</li>
            <li>Publishing match fixtures and results</li>
            <li>Improving our services and developing new pickleball-related offerings</li>
          </ul>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-slate-700">
              <strong>Please note:</strong> Because our leagues are public, player names, matches played, and match results are displayed on our website and archived for future reference. By signing up, you acknowledge and accept this public use of your name in connection with league activities.
            </p>
          </div>
        </Section>

        {/* Section 3: Data Sharing */}
        <Section
          title="3. Data Sharing"
          icon={<Lock className="h-6 w-6 text-green-600" />}
        >
          <p className="mb-4 font-semibold text-slate-800">
            We do not sell or share your personal data with third parties.
          </p>
          <p className="mb-4">However, to enable league play:</p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li>
              Your email address and phone number are shared with other players who are in the same group and round as you, to help you organise and play matches.
            </li>
          </ul>
          <p className="text-sm">
            If we work with partner organisations for research, development, or product enhancement purposes, we ensure that they comply with all applicable data protection obligations. We do not provide them with unnecessary personal data.
          </p>
        </Section>

        {/* Section 4: Legal Basis for Processing */}
        <Section
          title="4. Legal Basis for Processing"
          icon={<Shield className="h-6 w-6 text-green-600" />}
        >
          <p className="mb-4">
            We process your personal data on the following legal bases:
          </p>
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="font-semibold text-slate-800 mb-2">Contractual necessity:</h3>
              <p>
                When you register for and participate in a league, we must process your information to fulfil our agreement with you (e.g. assigning groups, managing rounds, and recording results).
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="font-semibold text-slate-800 mb-2">Consent:</h3>
              <p>
                Where required, we will ask for your consent, such as when sharing your contact details with other players in your group.
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="font-semibold text-slate-800 mb-2">Legitimate interests:</h3>
              <p>
                We have a legitimate interest in organising leagues, publishing match results, and maintaining historical league records. These activities are essential to the nature of our service and are balanced against your privacy rights.
              </p>
            </div>
          </div>
        </Section>

        {/* Section 5: Cookies */}
        <Section
          title="5. Cookies"
          icon={<FileText className="h-6 w-6 text-green-600" />}
        >
          <p className="mb-4">We use cookies to:</p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li>Improve website functionality</li>
            <li>Enhance user experience</li>
            <li>Collect basic website analytics</li>
          </ul>
          <p>You can control or disable cookies through your browser settings.</p>
        </Section>

        {/* Section 6: Data Security */}
        <Section
          title="6. Data Security"
          icon={<Lock className="h-6 w-6 text-green-600" />}
        >
          <p>
            We use appropriate technical and organisational measures to protect your personal information against unauthorised access, loss, misuse, or alteration.
          </p>
        </Section>

        {/* Section 7: Data Retention */}
        <Section
          title="7. Data Retention"
          icon={<Clock className="h-6 w-6 text-green-600" />}
        >
          <p className="mb-4">
            We retain your personal information only for as long as necessary to:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li>Provide league services</li>
            <li>Maintain league and match records (based on legitimate interests)</li>
          </ul>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="font-semibold text-slate-800 mb-2">If you request your account to be suspended:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Your account will be archived</li>
              <li>Your personal information will be retained securely</li>
              <li>Your account can be reactivated at a later date upon request</li>
            </ul>
          </div>
          <p>
            For record-keeping purposes, we retain limited historical data such as your name, leagues joined, round participation, and matches played.
          </p>
        </Section>

        {/* Section 8: Your Rights */}
        <Section
          title="8. Your Rights"
          icon={<Shield className="h-6 w-6 text-green-600" />}
        >
          <p className="mb-4">You have the right to:</p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li>Access your personal information</li>
            <li>Request corrections to inaccurate information</li>
            <li>Request deletion of your personal data (subject to legal and legitimate interest requirements)</li>
          </ul>
          <p>Requests can be made using the contact details below.</p>
        </Section>

        {/* Section 9: Changes to This Privacy Policy */}
        <Section
          title="9. Changes to This Privacy Policy"
          icon={<FileText className="h-6 w-6 text-green-600" />}
        >
          <p>
            We may update this Privacy Policy from time to time. Any changes will be published on our website, and participants are encouraged to review the policy periodically.
          </p>
        </Section>

        {/* Section 10: Contact Us */}
        <Section
          title="10. Contact Us"
          icon={<Mail className="h-6 w-6 text-green-600" />}
        >
          <p className="mb-4">
            If you have any questions, concerns, or requests regarding your privacy or personal data, please contact us at:
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="font-semibold text-slate-800">
              Email:{' '}
              <a
                href="mailto:socialpickleballleague@gmail.com"
                className="text-green-600 hover:text-green-700 underline"
              >
                socialpickleballleague@gmail.com
              </a>
            </p>
          </div>
        </Section>

        {/* Last Updated Notice */}
        <div className="bg-slate-100 border border-slate-300 rounded-lg p-6 text-center">
          <p className="text-slate-600 text-sm">
            This Privacy Policy was last updated on 1st January 2026
          </p>
        </div>
      </div>
    </>
  );
};
