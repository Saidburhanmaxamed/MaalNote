/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent, 
  ArrowUpRight, 
  Plus, 
  Calendar,
  Wallet,
  ArrowRight,
  LogOut
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Transaction, User } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { translations } from '../translations';

interface DashboardProps {
  user: User;
  transactions: Transaction[];
  stats: any;
  monthlySummary: any[];
  incomeBreakdown: any[];
  expenseBreakdown: any[];
  onNavigateToTab: (tab: string) => void;
  onOpenQuickAdd: (type: 'income' | 'expense') => void;
}

export default function Dashboard({
  user,
  transactions,
  stats,
  monthlySummary,
  incomeBreakdown,
  expenseBreakdown,
  onNavigateToTab,
  onOpenQuickAdd
}: DashboardProps) {

  const lang = user.language || 'en';
  const t = translations[lang] || translations.en;

  const recentTransactions = transactions.slice(0, 5);

  // Prepare Pie Chart Data for Expense Breakdown
  const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#06b6d4', '#8b5cf6', '#ec4899', '#64748b'];
  const pieData = expenseBreakdown.slice(0, 5).map((item, idx) => ({
    name: item.category,
    value: item.amount,
    color: COLORS[idx % COLORS.length]
  }));

  const profitIsPositive = stats.netProfit >= 0;

  return (
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          >
            {t.welcomeBack}, <span className="text-indigo-600 dark:text-indigo-400">{user.name}</span>
          </motion.h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.financialOverviewOf} <span className="font-semibold">{user.storeName}</span>.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenQuickAdd('income')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-md shadow-emerald-600/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.incomeInflow}</span>
          </button>
          <button
            onClick={() => onOpenQuickAdd('expense')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors shadow-md shadow-rose-600/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.expenseOutflow}</span>
          </button>
        </div>
      </div>

      {/* Grid of Key Financial Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Income Card */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 backdrop-blur-sm shadow-sm flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.totalIncome}</span>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(stats.totalIncome, user.currency)}
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>Inflow Revenue</span>
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Total Expenses Card */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 backdrop-blur-sm shadow-sm flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.totalExpenses}</span>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(stats.totalExpenses, user.currency)}
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full mt-1">
              <TrendingDown className="w-3 h-3" />
              <span>Outflow Expenses</span>
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 shrink-0">
            <TrendingDown className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Net Profit Card */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="p-6 rounded-2xl bg-white dark:bg-indigo-950/10 border border-slate-100 dark:border-indigo-500/20 backdrop-blur-sm shadow-sm flex items-center justify-between group relative overflow-hidden"
        >
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500 opacity-10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-1 relative z-10">
            <span className="text-xs font-semibold text-slate-400 dark:text-indigo-300 uppercase tracking-wider">{t.netProfit}</span>
            <h3 className={`text-2xl font-bold tracking-tight ${profitIsPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {formatCurrency(stats.netProfit, user.currency)}
            </h3>
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full mt-1 ${
              profitIsPositive 
                ? 'text-indigo-500 bg-indigo-500/10' 
                : 'text-amber-500 bg-amber-500/10'
            }`}>
              <DollarSign className="w-3 h-3" />
              <span>{profitIsPositive ? 'Net Surplus' : 'Net Deficit'}</span>
            </span>
          </div>
          <div className={`p-3.5 rounded-xl shrink-0 relative z-10 ${
            profitIsPositive 
              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' 
              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
          }`}>
            <DollarSign className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Net Profit Margin Card */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 backdrop-blur-sm shadow-sm flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.margin}</span>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {stats.netProfitMargin.toFixed(1)}%
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-500/10 dark:text-slate-400 dark:bg-slate-800 px-2 py-0.5 rounded-full mt-1">
              <Percent className="w-3 h-3" />
              <span>Of total revenue</span>
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
            <Percent className="w-6 h-6" />
          </div>
        </motion.div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Cash Flow chart (Income vs Expenses) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 backdrop-blur-sm shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-6">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">Financial Flow Chart</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Comparing Store Income vs Store Expenses (6 months)</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="font-medium text-slate-600 dark:text-slate-400">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="font-medium text-slate-600 dark:text-slate-400">Expenses</span>
              </div>
            </div>
          </div>
          
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySummary} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff'
                  }} 
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`]}
                />
                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#incomeGrad)" />
                <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#expenseGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses Circular Category Breakdown */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 backdrop-blur-sm shadow-sm flex flex-col">
          <div className="pb-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">Top Expenses</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">By budget category</p>
          </div>

          {pieData.length > 0 ? (
            <div className="flex-1 flex flex-col justify-center">
              {/* Circular Chart */}
              <div className="h-40 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total spent</span>
                  <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(stats.totalExpenses, user.currency)}
                  </span>
                </div>
              </div>

              {/* Legends list */}
              <div className="mt-4 space-y-2 max-h-[140px] overflow-y-auto pr-1">
                {pieData.map((item, idx) => {
                  const percent = stats.totalExpenses > 0 ? (item.value / stats.totalExpenses) * 100 : 0;
                  return (
                    <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-md shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-600 dark:text-slate-300 truncate max-w-[120px]">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-slate-950 dark:text-white">{formatCurrency(item.value, user.currency)}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">({percent.toFixed(0)}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Wallet className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-xs">No expense data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent transactions and category aggregates row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction log snippet */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 backdrop-blur-sm shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-5">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">Recent Transactions</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Your last 5 recorded entries</p>
            </div>
            <button
              onClick={() => onNavigateToTab('reports')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 hover:underline cursor-pointer"
            >
              <span>View All Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-x-auto">
            {recentTransactions.length > 0 ? (
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-850 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4">Transaction Details</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50 dark:divide-slate-850/50 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {recentTransactions.map((tx) => {
                    const isIncome = tx.type === 'income';
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/55 dark:hover:bg-slate-850/30 transition-colors">
                        <td className="py-3 px-4">
                          <div>
                            <div className="text-slate-900 dark:text-white font-bold">{tx.description || 'No description'}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5 font-medium">Via {tx.paymentMethod}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isIncome 
                              ? 'text-emerald-600 bg-emerald-500/10' 
                              : 'text-rose-600 bg-rose-500/10'
                          }`}>
                            {tx.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-medium">
                          {formatDate(tx.date)}
                        </td>
                        <td className={`py-3 px-4 text-right font-bold text-sm ${
                          isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {isIncome ? '+' : '-'}{formatCurrency(tx.amount, user.currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-slate-400 text-center">
                <Wallet className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-xs">No transactions recorded yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Income Sources percentage breakdown */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 backdrop-blur-sm shadow-sm flex flex-col">
          <div className="pb-5">
            <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">Income Streams</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Primary sources of revenue</p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto max-h-[300px] pr-1">
            {incomeBreakdown.length > 0 ? (
              incomeBreakdown.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{item.category}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-900 dark:text-white">{formatCurrency(item.amount, user.currency)}</span>
                      <span className="text-[10px] text-slate-400 font-medium">({item.percentage.toFixed(0)}%)</span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.1 }}
                      className="h-full rounded-full bg-emerald-500" 
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-slate-400 text-center">
                <TrendingUp className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-xs">No income streams yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
