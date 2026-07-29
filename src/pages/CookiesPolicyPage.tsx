import React from 'react';
import { Cookie, Shield, BarChart3, Globe, Settings, RefreshCw, Mail } from 'lucide-react';

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

export const CookiesPolicyPage: React.FC = () => {
  return (
    <>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 py-16">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-4">
            <Cookie className="h-16 w-16 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Cookies Policy
          </h1>
          <p className="text-xl text-green-50 max-w-2xl mx-auto">
            Last updated: 29 July 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
          <p className="text-slate-700 leading-relaxed">
            This Cookies Policy explains how Dinkly.co.nz uses cookies and similar technologies. It aligns with our obligations under the New Zealand Privacy Act 2020.
          </p>
        </div>

        {/* What are cookies */}
        <Section
          title="What Are Cookies?"
          icon={<Cookie className="h-6 w-6 text-green-600" />}
        >
          <p>
            Cookies are small text files stored on your device when you visit a website. They help websites function properly, improve security, remember preferences, and understand how visitors use the site. Session cookies expire when you close your browser; persistent cookies may last up to 12 months.
          </p>
        </Section>

        {/* Essential cookies */}
        <Section
          title="Essential Cookies"
          icon={<Shield className="h-6 w-6 text-green-600" />}
        >
          <p className="mb-4">
            These cookies are necessary for the website to operate and cannot be switched off. Examples include:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>User authentication</li>
            <li>Login sessions</li>
            <li>Security and fraud prevention</li>
            <li>Load balancing and performance protection</li>
          </ul>
        </Section>

        {/* Functional cookies */}
        <Section
          title="Functional Cookies"
          icon={<Settings className="h-6 w-6 text-green-600" />}
        >
          <p className="mb-4">
            These cookies remember choices you make, such as:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Preferred language</li>
            <li>Login persistence</li>
            <li>User interface preferences</li>
          </ul>
        </Section>

        {/* Analytics cookies */}
        <Section
          title="Analytics Cookies"
          icon={<BarChart3 className="h-6 w-6 text-green-600" />}
        >
          <p className="mb-4">
            We do not currently use analytics cookies. If we introduce them in future, they will help us understand:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li>Which pages are most popular</li>
            <li>How users navigate the site</li>
            <li>Where technical issues occur</li>
            <li>Overall website performance</li>
          </ul>
          <p className="text-sm italic bg-slate-50 p-4 rounded-lg border border-slate-200">
            If analytics cookies are introduced, we will update this policy and may use services such as Google Analytics or similar tools.
          </p>
        </Section>

        {/* Third-party cookies */}
        <Section
          title="Third-Party Cookies"
          icon={<Globe className="h-6 w-6 text-green-600" />}
        >
          <p className="mb-4">
            Some third-party services used by Dinkly may set cookies, including:
          </p>
          <div className="space-y-3 mb-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="font-semibold text-slate-800 mb-1">Stripe</h3>
              <p className="text-sm">Secure payment processing</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="font-semibold text-slate-800 mb-1">Cloudflare</h3>
              <p className="text-sm">Security and performance optimisation</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="font-semibold text-slate-800 mb-1">Supabase</h3>
              <p className="text-sm">Authentication and session management</p>
            </div>
          </div>
          <p className="text-sm">
            We do not control third-party cookies directly; please refer to the respective providers' privacy documentation.
          </p>
        </Section>

        {/* Managing cookies */}
        <Section
          title="Managing Cookies"
          icon={<Settings className="h-6 w-6 text-green-600" />}
        >
          <p className="mb-4">
            Most web browsers allow you to:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li>View stored cookies</li>
            <li>Delete cookies</li>
            <li>Block cookies</li>
            <li>Receive alerts when cookies are set</li>
          </ul>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-slate-700">
              <strong>Please note:</strong> Disabling essential cookies may prevent parts of Dinkly from functioning correctly, including login and league registration features.
            </p>
          </div>
        </Section>

        {/* Changes */}
        <Section
          title="Changes to This Policy"
          icon={<RefreshCw className="h-6 w-6 text-green-600" />}
        >
          <p>
            We may update this Cookies Policy periodically. Any changes will be published on this page with a revised "last updated" date.
          </p>
        </Section>

        {/* Contact */}
        <Section
          title="Contact"
          icon={<Mail className="h-6 w-6 text-green-600" />}
        >
          <p className="mb-4">
            If you have questions about our use of cookies, contact us at:
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="font-semibold text-slate-800">
              Email:{' '}
              <a
                href="mailto:hello@dinkly.co.nz"
                className="text-green-600 hover:text-green-700 underline"
              >
                hello@dinkly.co.nz
              </a>
            </p>
          </div>
        </Section>

        {/* Last Updated Notice */}
        <div className="bg-slate-100 border border-slate-300 rounded-lg p-6 text-center">
          <p className="text-slate-600 text-sm">
            This Cookies Policy was last updated on 29 July 2025
          </p>
        </div>
      </div>
    </>
  );
};
