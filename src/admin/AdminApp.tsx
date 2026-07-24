import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AuthPage } from '../components/auth/AuthPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { ToastProvider } from '../components/common/Toast';

function AdminApp() {
  const { isAuthenticated, user, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user && !user.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Access Denied</h1>
          <p className="text-slate-600 mb-6">
            You do not have permission to access the admin panel. Please contact an administrator if you believe this is an error.
          </p>
          <button
            onClick={signOut}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Main Site
          </button>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <Router basename="/admin.html">
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated && user ? (
                <AdminDashboard user={user} onSignOut={signOut} />
              ) : (
                <AuthPage />
              )
            }
          />
          <Route
            path="/auth"
            element={
              isAuthenticated && user ? (
                <Navigate to="/" replace />
              ) : (
                <AuthPage />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default AdminApp;
