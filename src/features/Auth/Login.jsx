import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@shared/context/AppStateProvider';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAppState();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const eTrim = (email || '').trim();
      const pTrim = (password || '').trim();
      await login(eTrim, pTrim);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-200 via-cyan-200 to-teal-300 dark:from-slate-900 dark:via-cyan-900/80 dark:to-teal-900 p-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm p-8 rounded-3xl bg-white/30 dark:bg-gray-800/30 backdrop-blur-md border border-white/40 shadow-lg space-y-4"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">Login</h2>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          autoFocus
          className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 rounded-xl bg-cyan-500 text-white font-semibold shadow-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
        >
          {loading ? 'Loading…' : 'Login'}
        </button>

        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
      </form>
    </div>
  );
}
