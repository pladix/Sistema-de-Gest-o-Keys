import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import Modal from './Modal';
import { useI18n } from '../lib/i18n';

interface SuccessModalProps {
  show: boolean;
  onClose: () => void;
  apiKey: string;
}

export default function SuccessModal({ show, onClose, apiKey }: SuccessModalProps) {
  const [copied, setCopied] = useState(false);
  const { language, translations } = useI18n();
  const t = translations[language];

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal show={show} onClose={onClose} title={t.registrationSuccess}>
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="bg-green-500 rounded-full p-3">
            <Check size={24} className="text-white" />
          </div>
        </div>
        <p className="text-center">{t.apiKey}:</p>
        <div className="bg-slate-900 p-3 rounded-lg flex items-center justify-between">
          <code className="text-blue-500 text-lg">{apiKey}</code>
          <button
            onClick={handleCopy}
            className="text-gray-400 hover:text-white transition-colors"
            title={t.copyApiKey}
          >
            {copied ? (
              <Check size={20} className="text-green-500" />
            ) : (
              <Copy size={20} />
            )}
          </button>
        </div>
        <p className="text-sm text-gray-400 text-center">
          Guarde esta chave em um local seguro. Você precisará dela para fazer login.
        </p>
      </div>
    </Modal>
  );
}