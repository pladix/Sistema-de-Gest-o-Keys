import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Lock, MessageCircle, Key } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateApiKey, checkRateLimit } from '../lib/security';
import toast from 'react-hot-toast';
import LanguageSelector from '../components/LanguageSelector';
import SuccessModal from '../components/SuccessModal';
import Particles from '../components/Particles';
import Footer from '../components/Footer';
import { useI18n } from '../lib/i18n';

const MAX_USERNAME_LENGTH = 30;
const MAX_TELEGRAM_ID_LENGTH = 15;
const MAX_PASSWORD_LENGTH = 50;

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    telegramId: '',
    pin: '',
  });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedApiKey, setGeneratedApiKey] = useState('');
  const navigate = useNavigate();
  const { language, translations } = useI18n();
  const t = translations[language];

  const validateTelegramId = (value: string) => {
    return /^\d+$/.test(value);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkRateLimit('127.0.0.1', 'register')) {
      toast.error('Muitas tentativas. Tente novamente mais tarde.');
      return;
    }

    if (!validateTelegramId(formData.telegramId)) {
      toast.error('ID do Telegram deve conter apenas números');
      return;
    }

    setLoading(true);

    try {
      // Check if username exists
      const { data: existingUsername } = await supabase
        .from('users')
        .select('username')
        .eq('username', formData.username)
        .maybeSingle();

      if (existingUsername) {
        throw new Error('Nome de usuário já está em uso');
      }

      // Check if telegram_id exists
      const { data: existingTelegram } = await supabase
        .from('users')
        .select('telegram_id')
        .eq('telegram_id', formData.telegramId)
        .maybeSingle();

      if (existingTelegram) {
        throw new Error('ID do Telegram já está em uso');
      }

      const apiKey = generateApiKey();

      const { error } = await supabase.from('users').insert([
        {
          username: formData.username,
          telegram_id: formData.telegramId,
          pin: formData.pin,
          api_key: apiKey,
          language: language
        },
      ]);

      if (error) {
        if (error.code === '23505') {
          throw new Error('Este usuário ou ID do Telegram já está registrado');
        }
        throw error;
      }

      setGeneratedApiKey(apiKey);
      setShowSuccess(true);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Falha no cadastro. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <Particles />
      
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      
      <div className="card max-w-md w-full">
        <div className="flex justify-center mb-6">
          <UserPlus size={48} className="text-blue-500" />
        </div>
        <h1 className="text-2xl text-center mb-6">{t.register}</h1>
        <form onSubmit={handleRegister}>
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input
                type="text"
                placeholder={t.username}
                className="input w-full pl-10"
                value={formData.username}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    username: e.target.value.slice(0, MAX_USERNAME_LENGTH)
                  })
                }
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input
                type="password"
                placeholder={t.password}
                className="input w-full pl-10"
                value={formData.password}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password: e.target.value.slice(0, MAX_PASSWORD_LENGTH)
                  })
                }
                required
              />
            </div>

            <div className="relative">
              <MessageCircle className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input
                type="text"
                placeholder={t.telegramId}
                className="input w-full pl-10"
                value={formData.telegramId}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, MAX_TELEGRAM_ID_LENGTH);
                  setFormData({ ...formData, telegramId: value });
                }}
                required
              />
            </div>

            <div className="relative">
              <Key className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input
                type="text"
                placeholder={t.pin}
                className="input w-full pl-10"
                maxLength={6}
                pattern="\d{6}"
                value={formData.pin}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pin: e.target.value.replace(/\D/g, '').slice(0, 6)
                  })
                }
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              <UserPlus size={18} />
              {loading ? 'Carregando...' : t.register}
            </button>
          </div>
        </form>
        <div className="mt-4 text-center">
          <Link to="/login" className="text-blue-500 hover:underline">
            Já tem uma conta? Faça login
          </Link>
        </div>
      </div>

      <SuccessModal
        show={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          navigate('/login');
        }}
        apiKey={generatedApiKey}
      />
      
      <Footer />
    </div>
  );
}