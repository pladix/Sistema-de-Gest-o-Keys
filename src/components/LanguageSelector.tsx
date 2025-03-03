import React from 'react';
import { Globe } from 'lucide-react';
import { useI18n } from '../lib/i18n';

export default function LanguageSelector() {
  const { language, setLanguage } = useI18n();

  return (
    <div className="flex items-center gap-2">
      <Globe size={18} className="text-blue-500" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'pt-BR' | 'en-US')}
        className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="pt-BR">Português (BR)</option>
        <option value="en-US">English (US)</option>
      </select>
    </div>
  );
}