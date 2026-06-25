/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  FileSpreadsheet, 
  BarChart3, 
  Settings as SettingsIcon, 
  LogOut, 
  Sun, 
  Moon,
  Menu,
  X,
  Store,
  User
} from 'lucide-react';
import { User as UserType } from '../types';
import { translations } from '../translations';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserType;
  onLogout: () => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  user,
  onLogout,
  darkMode,
  setDarkMode,
  mobileOpen,
  setMobileOpen
}: SidebarProps) {

  const lang = user.language || 'en';
  const t = translations[lang] || translations.en;

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'income', label: t.income, icon: ArrowUpCircle, color: 'text-emerald-500' },
    { id: 'expenses', label: t.expenses, icon: ArrowDownCircle, color: 'text-rose-500' },
    { id: 'reports', label: t.reports, icon: FileSpreadsheet },
    { id: 'analytics', label: t.analytics, icon: BarChart3 },
    { id: 'settings', label: t.settings, icon: SettingsIcon },
  ];

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setMobileOpen(false); // Auto close sidebar on mobile click
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900/50 dark:backdrop-blur-md border-r border-slate-200 dark:border-slate-800 p-6">
      {/* Brand Header */}
      <div className="flex items-center gap-3 pb-8 mb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 shrink-0">
          {user.storeName ? user.storeName.charAt(0).toUpperCase() : 'S'}
        </div>
        <div className="overflow-hidden">
          <h2 className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight truncate">
            {user.storeName || 'MaalNote'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{t.bookkeepingLedger}</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="space-y-1.5 flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all relative group cursor-pointer ${
                isActive
                  ? 'text-indigo-600 dark:text-white bg-indigo-50/70 dark:bg-slate-800 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? (item.color || 'text-indigo-600 dark:text-white') : (item.color || 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200')}`} />
              <span className="truncate">{item.label}</span>
              
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute left-0 top-2 bottom-2 w-1 rounded-r-md bg-indigo-600 dark:bg-indigo-500"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Area */}
      <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
        {/* User Card */}
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50">
          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
            <div className="w-full h-full bg-gradient-to-tr from-indigo-600 to-emerald-400" />
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
            <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center justify-between gap-2">
          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors cursor-pointer"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-500" />
                <span>Dark</span>
              </>
            )}
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="flex items-center justify-center p-2 rounded-lg border border-rose-100 dark:border-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 h-screen shrink-0 sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Mobile close button overlay */}
        <button 
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-[-44px] p-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-r-lg shadow-lg border-y border-r border-slate-200 dark:border-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
        {sidebarContent}
      </div>
    </>
  );
}
