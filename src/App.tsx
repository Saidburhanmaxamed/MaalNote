/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, Wallet, ShieldAlert, Coins, Plus, Calendar, FileText, CreditCard, X } from 'lucide-react';

import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import IncomeManager from './components/IncomeManager';
import ExpenseManager from './components/ExpenseManager';
import Reports from './components/Reports';
import Analytics from './components/Analytics';
import SettingsPage from './components/SettingsPage';

import { User, Transaction, DashboardStats } from './types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, PAYMENT_METHODS } from './utils';

export default function App() {
  // Session State
  const [token, setToken] = useState<string | null>(localStorage.getItem('ledger_token'));
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('ledger_dark_mode') === 'true';
  });

  // UI state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [quickAddType, setQuickAddType] = useState<'income' | 'expense' | null>(null);

  // Quick Add Form Fields
  const [quickAmount, setQuickAmount] = useState('');
  const [quickCategory, setQuickCategory] = useState('');
  const [quickDate, setQuickDate] = useState(new Date().toISOString().split('T')[0]);
  const [quickDescription, setQuickDescription] = useState('');
  const [quickPaymentMethod, setQuickPaymentMethod] = useState(PAYMENT_METHODS[0]);

  // Data State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    netProfitMargin: 0,
    monthlyIncome: 0,
    monthlyExpense: 0
  });
  const [monthlySummary, setMonthlySummary] = useState<any[]>([]);
  const [incomeBreakdown, setIncomeBreakdown] = useState<any[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<any[]>([]);

  // Apply dark mode toggle class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ledger_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ledger_dark_mode', 'false');
    }
  }, [darkMode]);

  // Verify and fetch user details on load if token exists
  useEffect(() => {
    if (token) {
      fetchUserAndData();
    }
  }, [token]);

  const fetchUserAndData = async () => {
    setDataLoading(true);
    try {
      // 1. Fetch user profile
      const userRes = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!userRes.ok) {
        throw new Error('Session expired');
      }
      const userData = await userRes.json();
      setUser(userData.user);

      // 2. Fetch financial transaction logs
      await refreshFinancialData();
    } catch (e) {
      // Clear invalid session
      handleLogoutLocal();
    } finally {
      setDataLoading(false);
    }
  };

  const refreshFinancialData = async () => {
    if (!token) return;
    try {
      // Fetch transaction list
      const txRes = await fetch('/api/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const txData = await txRes.json();
      setTransactions(txData);

      // Fetch analytics aggregated reports
      const statsRes = await fetch('/api/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      
      setStats(statsData.stats);
      setMonthlySummary(statsData.monthlySummary);
      setIncomeBreakdown(statsData.incomeBreakdown);
      setExpenseBreakdown(statsData.expenseBreakdown);
    } catch (e) {
      console.error('Error refreshing ledger charts', e);
    }
  };

  const handleAuthSuccess = (newToken: string, authenticatedUser: User) => {
    localStorage.setItem('ledger_token', newToken);
    setToken(newToken);
    setUser(authenticatedUser);
    setActiveTab('dashboard');
  };

  const handleLogoutLocal = () => {
    localStorage.removeItem('ledger_token');
    setToken(null);
    setUser(null);
    setTransactions([]);
    setStats({
      totalIncome: 0,
      totalExpenses: 0,
      netProfit: 0,
      netProfitMargin: 0,
      monthlyIncome: 0,
      monthlyExpense: 0
    });
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {
        // ignore
      }
    }
    handleLogoutLocal();
  };

  // Record transaction CRUD
  const handleAddTransaction = async (payload: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        throw new Error('Could not save ledger entry');
      }
      await refreshFinancialData();
    } catch (err) {
      alert(err || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTransaction = async (id: string, payload: Partial<Transaction>) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        throw new Error('Could not update ledger entry');
      }
      await refreshFinancialData();
    } catch (err) {
      alert(err || 'Failed to edit transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error('Could not delete ledger entry');
      }
      await refreshFinancialData();
    } catch (err) {
      alert(err || 'Failed to delete transaction');
    } finally {
      setLoading(false);
    }
  };

  // Profile update
  const handleUpdateProfile = async (profilePayload: Partial<User>) => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profilePayload)
      });
      if (!res.ok) {
        throw new Error('Could not update profile');
      }
      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      alert(err || 'Failed to save profile setup');
    } finally {
      setLoading(false);
    }
  };

  // Quick add trigger handler
  const openQuickAddModal = (type: 'income' | 'expense') => {
    setQuickAddType(type);
    setQuickAmount('');
    setQuickCategory(type === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
    setQuickDate(new Date().toISOString().split('T')[0]);
    setQuickDescription('');
    setQuickPaymentMethod(PAYMENT_METHODS[0]);
  };

  const handleQuickAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAmount || isNaN(Number(quickAmount)) || Number(quickAmount) <= 0) return;

    await handleAddTransaction({
      type: quickAddType!,
      amount: Number(quickAmount),
      category: quickCategory,
      date: quickDate,
      description: quickDescription,
      paymentMethod: quickPaymentMethod
    });

    setQuickAddType(null);
  };

  // Main Render tree
  if (!token || !user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-400">Syncing Secure Ledger...</p>
        </div>
      </div>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            user={user}
            transactions={transactions}
            stats={stats}
            monthlySummary={monthlySummary}
            incomeBreakdown={incomeBreakdown}
            expenseBreakdown={expenseBreakdown}
            onNavigateToTab={setActiveTab}
            onOpenQuickAdd={openQuickAddModal}
          />
        );
      case 'income':
        return (
          <IncomeManager
            user={user}
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            loading={loading}
          />
        );
      case 'expenses':
        return (
          <ExpenseManager
            user={user}
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            loading={loading}
          />
        );
      case 'reports':
        return <Reports user={user} transactions={transactions} />;
      case 'analytics':
        return (
          <Analytics
            user={user}
            transactions={transactions}
            stats={stats}
            monthlySummary={monthlySummary}
            incomeBreakdown={incomeBreakdown}
            expenseBreakdown={expenseBreakdown}
          />
        );
      case 'settings':
        return (
          <SettingsPage
            user={user}
            onUpdateProfile={handleUpdateProfile}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            loading={loading}
          />
        );
      default:
        return <div className="text-slate-500">View not found</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 print:hidden">
          <div className="flex items-center gap-2.5">
            <Coins className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">MaalNote</span>
          </div>

          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Tab Canvas Content container */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full print:p-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {renderActiveTab()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Quick Add Form Modal Overlay */}
      <AnimatePresence>
        {quickAddType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickAddType(null)}
              className="absolute inset-0 bg-slate-900/65 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md p-6 rounded-3xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 shadow-2xl z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setQuickAddType(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight capitalize">
                Quick Record: {quickAddType}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Instantly log cash transactions to keep store metrics live.
              </p>

              <form onSubmit={handleQuickAddSubmit} className="mt-6 space-y-4">
                {/* Amount */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Amount ({user.currency})
                  </label>
                  <div className="relative">
                    <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm ${quickAddType === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>$</div>
                    <input
                      type="number"
                      required
                      min="0.01"
                      step="any"
                      value={quickAmount}
                      onChange={(e) => setQuickAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Category
                  </label>
                  <select
                    value={quickCategory}
                    onChange={(e) => setQuickCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-500 transition-all"
                  >
                    {quickAddType === 'income' 
                      ? INCOME_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))
                      : EXPENSE_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))
                    }
                  </select>
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Transaction Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="date"
                      required
                      value={quickDate}
                      onChange={(e) => setQuickDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                {/* Description details */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Short Description / Particulars
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    <textarea
                      value={quickDescription}
                      onChange={(e) => setQuickDescription(e.target.value)}
                      placeholder="Transaction particulars..."
                      rows={2}
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-900 dark:text-white font-semibold placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Payment method */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Payment Method
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select
                      value={quickPaymentMethod}
                      onChange={(e) => setQuickPaymentMethod(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-500 transition-all"
                    >
                      {PAYMENT_METHODS.map((method) => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Submit buttons */}
                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setQuickAddType(null)}
                    className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-xs font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {loading ? 'Saving...' : 'Add Record'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
