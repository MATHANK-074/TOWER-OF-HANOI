import { useState } from 'react';
import { Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

export default function AuthPage({ onAuthSuccess, onSwitchView }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const payload = mode === 'login'
        ? { username: form.username, password: form.password }
        : { username: form.username, email: form.email, password: form.password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Authentication failed');
      }

      localStorage.setItem('toh_user', JSON.stringify(data.user));
      setMessage(data.message);
      onAuthSuccess?.(data.user, mode === 'signup');
    } catch (error) {
      setIsError(true);
      setMessage(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-slate-800 shadow-lg">
        <div className="flex items-center justify-center gap-3 mb-4 text-slate-700">
          <ShieldCheck className="w-6 h-6 text-cyan-600" />
          <span className="text-xs uppercase tracking-[0.3em]">Neon Vault</span>
        </div>

        <div className="text-center mb-6">
          <div className="inline-flex rounded-2xl border border-fuchsia-100 bg-fuchsia-50 p-3 mb-3">
            <Sparkles className="w-6 h-6 text-fuchsia-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
          <p className="text-sm text-slate-600 mt-2">{mode === 'login' ? 'Log in to continue your Tower of Hanoi journey.' : 'Sign up to save your progress.'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-cyan-400 focus:shadow-sm"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />

          {mode === 'signup' && (
            <input
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-fuchsia-400 focus:shadow-sm"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          )}

          <input
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-cyan-400 focus:shadow-sm"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 py-3 font-semibold text-white shadow-md transition hover:scale-[1.01] disabled:opacity-60"
          >
            {loading ? 'Working...' : mode === 'login' ? 'Login' : 'Sign up'}
          </button>
        </form>

        {message && (
          <div className={`mt-4 rounded-lg border px-3 py-2 text-sm ${isError ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
            {message}
          </div>
        )}

        <div className="mt-5 text-center text-sm text-slate-600">
          {mode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
          <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="font-semibold text-cyan-600">
            {mode === 'login' ? 'Create account' : 'Log in'}
          </button>
        </div>

        <button onClick={() => onSwitchView('home')} className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-slate-800">
          <ArrowRight className="w-4 h-4 rotate-180" />
          Back to game
        </button>
      </div>
    </div>
  );
}
