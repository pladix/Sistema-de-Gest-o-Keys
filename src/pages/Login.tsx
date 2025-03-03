import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { checkRateLimit } from '../lib/security';
import toast from 'react-hot-toast';
import LanguageSelector from '../components/LanguageSelector';
import Footer from '../components/Footer';
import { useI18n } from '../lib/i18n';

export default function Login() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('apiKey') || '');
  const [rememberKey, setRememberKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { language, translations } = useI18n();
  const t = translations[language];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkRateLimit('127.0.0.1', 'login')) {
      toast.error(t.tooManyAttempts);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('users')
        .select()
        .eq('api_key', apiKey)
        .single();

      if (error || !data) {
        throw new Error(t.invalidCredentials);
      }

      if (data.banned) {
        throw new Error(t.accountBanned);
      }

      if (rememberKey) {
        localStorage.setItem('apiKey', apiKey);
      } else {
        localStorage.removeItem('apiKey');
      }

      localStorage.setItem('user', JSON.stringify(data));
      
      // Show welcome back and login success messages
      toast.success(t.welcomeBack);
      toast.success(t.loginSuccess);
      
      navigate('/dashboard');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(t.invalidCredentials);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>

      <div className="card max-w-md w-full">
        <div className="flex justify-center mb-6">
          <KeyRound size={48} className="text-blue-500" />
        </div>
        <h1 className="text-2xl text-center mb-6">{t.login}</h1>
        <form onSubmit={handleLogin}>
          <div className="space-y-4">
            <input
              type="text"
              placeholder={t.apiKey}
              className="input w-full"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rememberKey"
                checked={rememberKey}
                onChange={(e) => setRememberKey(e.target.checked)}
                className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <label htmlFor="rememberKey" className="text-sm">
                {t.rememberMe}
              </label>
            </div>
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? t.loading : t.login}
            </button>
          </div>
        </form>
        <div className="mt-4 text-center space-y-2">
          <p>
            {t.noAccount}{' '}
            <Link to="/register" className="text-blue-500 hover:underline">
              {t.register}
            </Link>
          </p>
          <p>
            <Link to="/recover-key" className="text-blue-500 hover:underline">
              {t.forgotApiKey}
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}