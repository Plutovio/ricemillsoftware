import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RMInput } from '../components/ui/RMInput';
import { RMButton } from '../components/ui/RMButton';

export function Login() {
  const { login, isLoading, error: authError } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login({ username, password });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 select-none">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-xl p-8 shadow-sm space-y-6">
        {/* Brand/Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-navy-800 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
            R
          </div>
          <h2 className="text-xl font-bold text-gray-900">Sign in to Rice Mill</h2>
          <p className="text-xs text-gray-500 mt-1 font-medium">Enter your credentials to access the ERP suite</p>
        </div>

        {/* Errors */}
        {(error || authError) && (
          <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error || authError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <RMInput
            label="Operator Username"
            type="text"
            placeholder="e.g. admin"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />

          <RMInput
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <RMButton type="submit" variant="primary" className="w-full py-2.5" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </RMButton>
        </form>

        {/* Footer Link */}
        <div className="text-center border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500">
            Need an operator account?{' '}
            <Link to="/register" className="text-navy-600 hover:text-navy-800 font-semibold">
              Register Operator
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
