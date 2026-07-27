import React, { useState } from 'react';
import { Mail, ArrowLeft, Send, Check } from 'lucide-react';
import { Button } from '../common/Button';

interface ForgotPasswordFormProps {
  onSendResetLink: (email: string) => Promise<{ success: boolean; error?: string }>;
  onBackToSignIn: () => void;
  loading: boolean;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSendResetLink,
  onBackToSignIn,
  loading
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    const result = await onSendResetLink(email);
    if (result.success) {
      setSuccess(true);
    } else if (result.error) {
      setError(result.error);
    }
  };

  if (success) {
    return (
      <div className="w-full">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Check Your Email</h2>
            <p className="text-slate-600 mb-6">
              We've sent a password reset link to{' '}
              <span className="font-semibold text-slate-800">{email}</span>
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-green-800 mb-2">What to do next:</h3>
              <ul className="text-sm text-green-700 space-y-1 text-left">
                <li>• Check your email inbox and spam folder</li>
                <li>• Click the reset link in the email</li>
                <li>• Create a new password for your account</li>
                <li>• Sign in with your new password</li>
              </ul>
            </div>
            <Button
              onClick={onBackToSignIn}
              variant="primary"
              size="lg"
              className="w-full mb-4"
            >
              Back to Sign In
            </Button>
            <p className="text-xs text-slate-500">
              Didn't receive the email? Check your spam folder or try again in a few minutes.
            </p>
          </div>
      </div>
    );
  }

  return (
    <div className="w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Forgot Password?</h2>
          <p className="text-slate-600">
            No worries! Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="reset-email" className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your email address"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full"
          >
            <Send className="h-5 w-5 mr-2" />
            Send Reset Link
          </Button>
        </form>

        <div className="mt-6 text-center">
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

        <div className="mt-6 bg-slate-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-slate-800 mb-2">Security Note:</h4>
          <p className="text-xs text-slate-600">
            For your security, we'll only send reset links to registered email addresses. 
            If you don't receive an email, the address may not be associated with an account.
          </p>
        </div>
    </div>
  );
};