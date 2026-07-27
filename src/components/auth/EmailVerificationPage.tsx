import React, { useState, useEffect } from 'react';
import { Mail, Check, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '../common/Button';
import { User } from '../../types';

interface EmailVerificationPageProps {
  user: User | null;
  userEmail: string;
  onResendVerification: (email: string) => Promise<{ success: boolean; error?: string }>;
  onBackToSignIn: () => void;
  loading: boolean;
}

export const EmailVerificationPage: React.FC<EmailVerificationPageProps> = ({
  user,
  userEmail,
  onResendVerification,
  onBackToSignIn,
  loading
}) => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendVerification = async () => {
    setError('');
    setSuccess('');

    const result = await onResendVerification(userEmail);
    if (result.success) {
      setSuccess('Verification email sent! Please check your inbox.');
      setResendCooldown(60);
    } else if (result.error) {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Check Your Email</h2>
            <p className="text-slate-600 mb-4">
              A verification link has been sent to{' '}
              <span className="font-semibold text-slate-800">{userEmail}</span>
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-green-700 text-sm text-left">
                  Click the verification link in the email to activate your account and access your player dashboard.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-600 mr-2" />
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            </div>
          )}

          {/* Resend Options */}
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-slate-600 text-sm mb-3">Didn't receive the email?</p>
              <Button
                onClick={handleResendVerification}
                variant="ghost"
                size="sm"
                disabled={resendCooldown > 0 || loading}
                className="text-green-600 hover:text-green-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Verification Email'}
              </Button>
            </div>

            <div className="text-center pt-4 border-t border-slate-200">
              <Button
                onClick={onBackToSignIn}
                variant="ghost"
                size="sm"
                className="text-slate-600 hover:text-slate-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-slate-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-slate-800 mb-2">What to do next:</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Check your email inbox and spam folder</li>
              <li>• Click the verification link in the email</li>
              <li>• You will be automatically redirected to your dashboard</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};