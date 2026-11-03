import React, { FormEvent, useState } from 'react';
import { LockKeyhole } from 'lucide-react';

interface LoginViewProps {
  notice?: string | null;
  onLogin: (username: string, password: string) => Promise<void>;
}

export const LoginView: React.FC<LoginViewProps> = ({ notice, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onLogin(username, password);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Giriş yapılamadı.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 text-[#1E293B]">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-[#E2E8F0] bg-white p-7 shadow-lg"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#00478F]">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold">ArelPro CRM</h1>
            <p className="text-xs text-[#64748B]">Devam etmek için giriş yapın</p>
          </div>
        </div>

        {(notice || error) && (
          <div role="alert" className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {error || notice}
          </div>
        )}

        <label className="mb-4 block text-sm font-semibold" htmlFor="login-username">
          Kullanıcı adı
          <input
            id="login-username"
            autoComplete="username"
            required
            maxLength={64}
            value={username}
            onChange={event => setUsername(event.target.value)}
            className="mt-1.5 h-10 w-full rounded-lg border border-[#CBD5E1] px-3 text-sm font-normal outline-none focus:border-[#00478F] focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <label className="mb-6 block text-sm font-semibold" htmlFor="login-password">
          Parola
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={1024}
            value={password}
            onChange={event => setPassword(event.target.value)}
            className="mt-1.5 h-10 w-full rounded-lg border border-[#CBD5E1] px-3 text-sm font-normal outline-none focus:border-[#00478F] focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-10 w-full rounded-lg bg-[#00478F] text-sm font-bold text-white transition-colors hover:bg-[#00356B] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Kontrol ediliyor...' : 'Giriş yap'}
        </button>
      </form>
    </main>
  );
};
