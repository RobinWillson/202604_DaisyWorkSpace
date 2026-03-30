'use client';

import { useState, useEffect } from 'react';
import { BrainCircuit, LogOut } from 'lucide-react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // On mount, probe the API to see if the session cookie is still valid
  useEffect(() => {
    fetch('/api/second-brain/tree')
      .then(r => {
        setIsAuthenticated(r.ok);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        setError('帳號或密碼錯誤，請再試一次');
      }
    } catch {
      setError('連線伺服器失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    setIsAuthenticated(false);
    setForm({ username: '', password: '' });
  };

  // Loading splash
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <BrainCircuit className="w-8 h-8 text-purple-400 animate-pulse" />
          <p className="text-zinc-500 text-sm">Syncing memories...</p>
        </div>
      </div>
    );
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0a0a0a]">
        {/* Ambient glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/8 rounded-full blur-[120px]" />
        </div>

        <div className="w-full max-w-sm px-8 relative">
          {/* Logo */}
          <div className="flex flex-col items-center mb-10">
            <div className="p-5 bg-white/5 rounded-3xl ring-1 ring-white/10 mb-6 shadow-2xl shadow-purple-500/10">
              <BrainCircuit className="w-10 h-10 text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Daisy Workspace</h1>
            <p className="text-zinc-500 text-sm">請登入以存取您的工作空間</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest block ml-1">
                Username
              </label>
              <input
                type="text"
                required
                autoFocus
                autoComplete="username"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white text-sm outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition-all placeholder:text-zinc-600"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest block ml-1">
                Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white text-sm outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition-all placeholder:text-zinc-600"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {error && (
              <p className="text-rose-400 text-xs text-center bg-rose-500/10 border border-rose-500/20 rounded-xl py-2.5 px-4">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-white text-black font-bold py-3.5 rounded-2xl hover:bg-zinc-100 transition-all active:scale-[0.98] shadow-xl shadow-white/5 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? '驗證中...' : '解鎖工作空間'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Authenticated — render children
  return (
    <>
      {children}
    </>
  );
}
