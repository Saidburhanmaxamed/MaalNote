/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart as PieIcon, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity,
  Calculator
} from 'lucide-react';
import { User, Transaction } from '../types';
import { formatCurrency } from '../utils';

interface AnalyticsProps {
  user: User;
  transactions: Transaction[];
  stats: any;
  monthlySummary: any[];
  incomeBreakdown: any[];
  expenseBreakdown: any[];
}

export default function Analytics({
  user,
  transactions,
  stats,
  monthlySummary,
  incomeBreakdown,
  expenseBreakdown
}: AnalyticsProps) {

  const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#06b6d4', '#8b5cf6', '#ec4899', '#64748b'];

  // Calculate deep analytics insights
  const avgIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0) / 
    (transactions.filter(t => t.type === 'income').length || 1);

  const avgExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0) / 
    (transactions.filter(t => t.type === 'expense').length || 1);

  const maxIncomeTx = transactions.filter(t => t.type === 'income').reduce((max, t) => t.amount > max ? t.amount : max, 0);
  const maxExpenseTx = transactions.filter(t => t.type === 'expense').reduce((max, t) => t.amount > max ? t.amount : max, 0);

  const topIncomeCat = incomeBreakdown[0]?.category || 'N/A';
  const topExpenseCat = expenseBreakdown[0]?.category || 'N/A';

  const formatYAxis = (tickItem: any) => {
    return `$${tickItem}`;
  };

  return (
    <div className="space-y-8">
      {/* View Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Financial Analytics Insights
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Perform high-fidelity business trend audit, monthly comparison streams, and categorical budgeting.
        </p>
      </div>

      {/* Grid of Analytical Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Avg Income Inflow */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 backdrop-blur-sm shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Inflow Amount</span>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {formatCurrency(avgIncome, user.currency)}
            </h4>
          </div>
        </div>

        {/* Avg Expense Outflow */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 backdrop-blur-sm shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 shrink-0">
            <ArrowDownRight className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Outflow Amount</span>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {formatCurrency(avgExpense, user.currency)}
            </h4>
          </div>
        </div>

        {/* Top Income Stream */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 backdrop-blur-sm shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Primary Income Stream</span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
              {topIncomeCat}
            </h4>
          </div>
        </div>

        {/* Top Expense Source */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 backdrop-blur-sm shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Primary Cost Center</span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
              {topExpenseCat}
            </h4>
          </div>
        </div>
      </div>

      {/* Monthly Bar comparison and Net Profit Trends row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Side-by-side Monthly Flow chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 backdrop-blur-sm shadow-sm flex flex-col">
          <div className="pb-6">
            <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">Inflow vs Outflow Comparison</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Clustered bars showing exact monthly financial volume</p>
          </div>

          <div className="h-80 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySummary} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={formatYAxis} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff'
                  }} 
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`]}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="income" name="Total Inflows" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Total Outflows" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Net Profit Growth Trend curve */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 backdrop-blur-sm shadow-sm flex flex-col">
          <div className="pb-6">
            <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">Net Profit Surplus Growth</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Continuous curve tracking cash surplus trends</p>
          </div>

          <div className="h-80 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlySummary} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={formatYAxis} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff'
                  }} 
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`]}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                <Line type="monotone" dataKey="profit" name="Net Surplus" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 6 }} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two Pie Chart Columns for exact Category budgeting share */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income category Pie */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 backdrop-blur-sm shadow-sm flex flex-col">
          <div className="pb-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">Inflow Distribution</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Which income channels yield highest results</p>
          </div>

          {incomeBreakdown.length > 0 ? (
            <div className="flex-1 flex flex-col justify-center">
              <div className="h-52 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incomeBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="amount"
                      nameKey="category"
                    >
                      {incomeBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`$${Number(value).toLocaleString()}`]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Inflow</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(stats.totalIncome, user.currency)}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-semibold">
                {incomeBreakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-md shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-slate-600 dark:text-slate-400 truncate" title={item.category}>
                      {item.category} ({item.percentage.toFixed(0)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-slate-400 text-center">
              <p className="text-xs">No income channels generated yet</p>
            </div>
          )}
        </div>

        {/* Expense Category Pie */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 backdrop-blur-sm shadow-sm flex flex-col">
          <div className="pb-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">Outflow Allocation</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Which departments spend highest volume</p>
          </div>

          {expenseBreakdown.length > 0 ? (
            <div className="flex-1 flex flex-col justify-center">
              <div className="h-52 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="amount"
                      nameKey="category"
                    >
                      {expenseBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`$${Number(value).toLocaleString()}`]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Outflow</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(stats.totalExpenses, user.currency)}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-semibold">
                {expenseBreakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-md shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-slate-600 dark:text-slate-400 truncate" title={item.category}>
                      {item.category} ({item.percentage.toFixed(0)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-slate-400 text-center">
              <p className="text-xs">No cost channels generated yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Record statistics summary tables */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 backdrop-blur-sm shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-4 flex items-center gap-2 uppercase tracking-wide text-slate-400">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span>Highest Value Inflows</span>
          </h4>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Maximum Single Sale Receipt:</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">{formatCurrency(maxIncomeTx, user.currency)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Average Transaction Size:</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">{formatCurrency(avgIncome, user.currency)}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-4 flex items-center gap-2 uppercase tracking-wide text-slate-400">
            <Calculator className="w-4 h-4 text-rose-500" />
            <span>Highest Cost Outflows</span>
          </h4>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Maximum Single Cost Invoice:</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">{formatCurrency(maxExpenseTx, user.currency)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Average Expense Cost:</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">{formatCurrency(avgExpense, user.currency)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
