import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { generateApiKey } from '../../lib/security';
import Modal from '../Modal';
import toast from 'react-hot-toast';
import { useI18n } from '../../lib/i18n';

interface CreateUserModalProps {
  show: boolean;
  onClose: () => void;
}

export default function CreateUserModal({ show, onClose }: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    username: '',
    telegramId: '',
    pin: '',
    credits: '0',
    isAdmin: false
  });
  const [loading, setLoading] = useState(false);
  const { language, translations } = useI18n();
  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if username exists
      const { data: existingUsername } = await supabase
        .from('users')
        .select('username')
        .eq('username', formData.username)
        .single();

      if (existingUsername) {
        throw new Error(t.usernameTaken);
      }

      // Check if telegram_id exists
      const { data: existingTelegram } = await supabase
        .from('users')
        .select('telegram_id')
        .eq('telegram_id', formData.telegramId)
        .single();

      if (existingTelegram) {
        throw new Error(t.telegramIdTaken);
      }

      const apiKey = generateApiKey();

      const { error } = await supabase.from('users').insert([
        {
          username: formData.username,
          telegram_id: formData.telegramId,
          pin: formData.pin,
          api_key: apiKey,
          credits: parseInt(formData.credits),
          is_admin: formData.isAdmin,
          language
        },
      ]);

      if (error) throw error;

      toast.success(t.userCreated);
      toast.success(`${t.apiKey}: ${apiKey}`);
      onClose();
      
      // Reset form
      setFormData({
        username: '',
        telegramId: '',
        pin: '',
        credits: '0',
        isAdmin: false
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(t.registrationFailed);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onClose={onClose} title={t.createUser}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t.username}</label>
          <input
            type="text"
            className="input w-full"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t.telegramId}</label>
          <input
            type="text"
            className="input w-full"
            value={formData.telegramId}
            onChange={(e) =>
              setFormData({ ...formData, telegramId: e.target.value.replace(/\D/g, '') })
            }
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t.pin}</label>
          <input
            type="text"
            className="input w-full"
            maxLength={6}
            pattern="\d{6}"
            value={formData.pin}
            onChange={(e) =>
              setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })
            }
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t.credits}</label>
          <input
            type="number"
            min="0"
            className="input w-full"
            value={formData.credits}
            onChange={(e) =>
              setFormData({ ...formData, credits: e.target.value })
            }
            required
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isAdmin"
            checked={formData.isAdmin}
            onChange={(e) =>
              setFormData({ ...formData, isAdmin: e.target.checked })
            }
          />
          <label htmlFor="isAdmin">{t.administrator}</label>
        </div>
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={loading}
        >
          <UserPlus size={18} />
          {loading ? t.processing : t.createUser}
        </button>
      </form>
    </Modal>
  );
}