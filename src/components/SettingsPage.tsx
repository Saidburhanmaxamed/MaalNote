/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Store, 
  Coins, 
  Moon, 
  Sun, 
  Save, 
  Check,
  Globe
} from 'lucide-react';
import { User as UserType, Language } from '../types';
import { translations } from '../translations';

interface SettingsPageProps {
  user: UserType;
  onUpdateProfile: (profile: Partial<UserType>) => Promise<void>;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  loading: boolean;
}

export default function SettingsPage({
  user,
  onUpdateProfile,
  darkMode,
  setDarkMode,
  loading
}: SettingsPageProps) {
  const [name, setName] = useState(user.name);
  const [storeName, setStoreName] = useState(user.storeName);
  const [currency, setCurrency] = useState(user.currency);
  const [language, setLanguage] = useState<Language>(user.language || 'en');
  const [successMsg, setSuccessMsg] = useState('');

  // Sync language state if user prop changes
  useEffect(() => {
    if (user.language) {
      setLanguage(user.language);
    }
  }, [user.language]);

  const t = translations[language] || translations.en;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');

    await onUpdateProfile({
      name,
      storeName,
      currency,
      language
    });

    setSuccessMsg(t.updatedSuccess || 'Profile settings updated successfully!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* View Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {t.storeProfileSettings}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.configureCompanyDetails}
        </p>
      </div>

      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 backdrop-blur-sm shadow-sm space-y-5">
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight border-b border-slate-50 dark:border-slate-800/80 pb-3">
            {t.corporateProfileSetup}
          </h3>

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-semibold"
            >
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {/* Admin Name */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              {t.adminName}
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Store Name */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              {t.storeCompanyName}
            </label>
            <div className="relative">
              <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Base Currency */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              {t.baseCurrency}
            </label>
            <div className="relative">
              <Coins className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="USD">USD ($) - United States Dollar</option>
                <option value="EUR">EUR (€) - Eurozone Euro</option>
                <option value="GBP">GBP (£) - British Pound Sterling</option>
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="CAD">CAD ($) - Canadian Dollar</option>
                <option value="AUD">AUD ($) - Australian Dollar</option>
                <option value="AED">AED (د.إ) - United Arab Emirates Dirham</option>
              </select>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 font-medium">
              {t.currencyDesc}
            </p>
          </div>

          {/* Language Selection */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              {t.selectLanguage}
            </label>
            <div className="relative">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="en">English (US/UK)</option>
                <option value="es">Español (Spanish)</option>
                <option value="fr">Français (French)</option>
                <option value="ar">العربية (Arabic)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="so">Soomaali (Somali)</option>
              </select>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 font-medium">
              {t.languageDesc}
            </p>
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/10 cursor-pointer disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? t.saving : t.saveConfig}</span>
            </button>
          </div>
        </form>

        {/* Quick theme config */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 backdrop-blur-sm shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight border-b border-slate-50 dark:border-slate-800 pb-3">
            {t.themes}
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{t.systemColorScheme}</p>
              <p className="text-[11px] text-slate-400 font-medium">{t.themeDesc}</p>
            </div>

            {/* Theme Selector triggers */}
            <div className="flex p-0.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setDarkMode(false)}
                className={`p-2 rounded-lg transition-all cursor-pointer ${!darkMode ? 'bg-white text-amber-500 shadow-sm' : 'text-slate-400'}`}
                title="Light mode"
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDarkMode(true)}
                className={`p-2 rounded-lg transition-all cursor-pointer ${darkMode ? 'bg-slate-850 text-indigo-400 shadow-sm' : 'text-slate-400'}`}
                title="Dark mode"
              >
                <Moon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
