import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Key } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function RecoverKey() {
  const [formData, setFormData] = useState({
    telegramId: '',
    pin: '',
  });
  const [loading, setLoading] = useState(false);

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('users')
        .select('api_key')
        .eq('telegram_id', formData.telegramId)
        .eq('pin', formData.pin)
        .single();

      if (error || !data) {
        throw new Error('Invalid credentials');
      }

      toast.success('Your API Key: ' + data.api_key);
    } catch (error) {
      toast.error('Recovery failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card max-w-md w-full">
        <div className="flex justify-center mb-6">
          <Key size={48} className="text-blue-500" />
        </div>
        <h1 className="text-2xl text-center mb-6">Recover API Key</h1>
        <form onSubmit={handleRecover}>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Telegram ID"
              className="input w-full"
              value={formData.telegramId}
              onChange={(e) =>
                setFormData({ ...formData, telegramId: e.target.value })
              }
              required
            />
            <input
              type="text"
              placeholder="PIN (6 digits)"
              className="input w-full"
              maxLength={6}
              pattern="\d{6}"
              value={formData.pin}
              onChange={(e) =>
                setFormData({ ...formData, pin: e.target.value })
              }
              required
            />
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Recover API Key'}
            </button>
          </div>
        </form>
        <div className="mt-4 text-center">
          <Link to="/login" className="text-blue-500 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}