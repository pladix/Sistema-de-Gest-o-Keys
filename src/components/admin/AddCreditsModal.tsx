import React, { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Modal from '../Modal';
import toast from 'react-hot-toast';
import { useI18n } from '../../lib/i18n';

interface AddCreditsModalProps {
  show: boolean;
  onClose: () => void;
  action: 'add' | 'remove';
}

export default function AddCreditsModal({ show, onClose, action }: AddCreditsModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { language, translations } = useI18n();
  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, get the current user's credits
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('credits')
        .eq('api_key', apiKey)
        .single();

      if (userError) {
        throw new Error(t.userNotFound);
      }

      const currentCredits = user.credits || 0;
      const amountNumber = parseInt(amount);
      const newCredits = action === 'add' 
        ? currentCredits + amountNumber
        : currentCredits - amountNumber;

      if (newCredits < 0) {
        throw new Error(t.insufficientCredits);
      }

      // Update the user's credits
      const { error: updateError } = await supabase
        .from('users')
        .update({ credits: newCredits })
        .eq('api_key', apiKey);

      if (updateError) throw updateError;

      toast.success(action === 'add' ? t.creditsAdded : t.creditsRemoved);
      setApiKey('');
      setAmount('');
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(action === 'add' ? 'Failed to add credits' : 'Failed to remove credits');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onClose={onClose}
      title={action === 'add' ? t.addCredits : t.removeCredits}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t.apiKey}</label>
          <input
            type="text"
            className="input w-full"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="XXXX-XXXX-XXXX-XXXX"
            pattern="[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t.credits}</label>
          <input
            type="number"
            min="1"
            className="input w-full"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={loading}
        >
          <CreditCard size={18} />
          {loading ? t.processing : action === 'add' ? t.addCredits : t.removeCredits}
        </button>
      </form>
    </Modal>
  );
}