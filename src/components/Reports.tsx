/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Calendar, 
  Filter, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Briefcase
} from 'lucide-react';
import { Transaction, User } from '../types';
import { formatCurrency, formatDate, INCOME_CATEGORIES, EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../utils';

interface ReportsProps {
  user: User;
  transactions: Transaction[];
}

export default function Reports({ user, transactions }: ReportsProps) {
  // Filters state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [category, setCategory] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState('all');

  // Filter computation
  const filteredRecords = transactions.filter(tx => {
    // Date filter
    if (startDate && tx.date < startDate) return false;
    if (endDate && tx.date > endDate) return false;

    // Type filter
    if (filterType !== 'all' && tx.type !== filterType) return false;

    // Category filter
    if (category !== 'all' && tx.category !== category) return false;

    // Payment method filter
    if (paymentMethod !== 'all' && tx.paymentMethod !== paymentMethod) return false;

    return true;
  });

  // Totals computation
  const summary = filteredRecords.reduce(
    (acc, tx) => {
      if (tx.type === 'income') {
        acc.income += tx.amount;
      } else {
        acc.expense += tx.amount;
      }
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const netProfit = summary.income - summary.expense;

  // Preset Filters
  const applyPreset = (preset: 'today' | 'week' | 'month' | 'year' | 'all') => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (preset === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'week') {
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      setStartDate(lastWeek.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (preset === 'month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (preset === 'year') {
      const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
      setStartDate(firstDayOfYear.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setFilterType('all');
    setCategory('all');
    setPaymentMethod('all');
  };

  // CSV Exporter (Excel ready)
  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Type', 'Amount', 'Category', 'Date', 'Description', 'Payment Method', 'Created At'];
    
    const rows = filteredRecords.map(tx => [
      tx.id,
      tx.type.toUpperCase(),
      tx.amount,
      tx.category,
      tx.date,
      `"${tx.description.replace(/"/g, '""')}"`,
      tx.paymentMethod,
      tx.createdAt
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${user.storeName.replace(/\s+/g, '_')}_Financial_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print View / PDF trigger
  const handlePrint = () => {
    window.print();
  };

  const allCategories = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

  const incomeRecords = filteredRecords.filter(tx => tx.type === 'income');
  const expenseRecords = filteredRecords.filter(tx => tx.type === 'expense');

  return (
    <div className="space-y-8 print:p-0 print:m-0 print:bg-white print:text-black">
      {/* View Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Financial Ledger Reports
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Perform deep audits, filters, and export high-fidelity financial spreadsheets.
          </p>
          <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span>Optimized for A4 paper print & color PDF download</span>
          </div>
        </div>

        {/* Exporter Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            disabled={filteredRecords.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
            <span>Export CSV / Excel</span>
          </button>
          <button
            onClick={handlePrint}
            disabled={filteredRecords.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-md shadow-indigo-600/10 cursor-pointer disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>Print Ledger Report</span>
          </button>
        </div>
      </div>

      {/* ================= INTERACTIVE COMPONENT (SCREEN VIEW ONLY) ================= */}
      <div className="print:hidden space-y-8">
        {/* Interactive Filters Panel */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 backdrop-blur-sm shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-500" />
              <span>Query Filters & Presets</span>
            </span>
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-[11px] font-bold text-indigo-500 hover:text-indigo-600 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset All</span>
            </button>
          </div>

          {/* Presets Button Row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 mr-2">Quick Date presets:</span>
            {['today', 'week', 'month', 'year', 'all'].map((preset) => (
              <button
                key={preset}
                onClick={() => applyPreset(preset as any)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:text-indigo-500 text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-950/30 transition-all cursor-pointer capitalize"
              >
                {preset === 'all' ? 'All Time' : preset}
              </button>
            ))}
          </div>

          {/* Dynamic Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Flow Type */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Record Type</label>
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value as any);
                  setCategory('all'); // Reset category since categories change
                }}
                className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="all">All Flows</option>
                <option value="income">Income Inflow</option>
                <option value="expense">Expense Outflow</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="all">All Categories</option>
                {filterType === 'all' ? (
                  allCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))
                ) : filterType === 'income' ? (
                  INCOME_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))
                ) : (
                  EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))
                )}
              </select>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="all">All Methods</option>
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Aggregate metrics for filtered subset */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Income Inflow */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 backdrop-blur-sm shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Inflow Income</span>
              <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCurrency(summary.income, user.currency)}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          {/* Outflow Expense */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 backdrop-blur-sm shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Outflow Expense</span>
              <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                {formatCurrency(summary.expense, user.currency)}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>

          {/* Net Profit Balance */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 backdrop-blur-sm shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Net Surplus</span>
              <h3 className={`text-xl font-bold mt-1 ${netProfit >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {formatCurrency(netProfit, user.currency)}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Main Ledger grid list */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 backdrop-blur-sm shadow-sm overflow-x-auto">
          {filteredRecords.length > 0 ? (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-850 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4">Particulars</th>
                  <th className="py-3.5 px-4">Flow Type</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Tx Date</th>
                  <th className="py-3.5 px-4 text-right">Debit / Credit Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs font-semibold text-slate-600 dark:text-slate-300">
                {filteredRecords.map((tx) => {
                  const isIncome = tx.type === 'income';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <div>
                          <div className="text-slate-950 dark:text-white font-bold">{tx.description || 'N/A'}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 font-medium font-mono">ID: {tx.id.slice(0, 8).toUpperCase()}</div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold capitalize">
                        <span className={`inline-flex items-center gap-1.5 ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isIncome ? 'Inflow' : 'Outflow'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span>{tx.category}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        {tx.paymentMethod}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        {tx.date}
                      </td>
                      <td className={`py-3.5 px-4 text-right font-bold text-sm ${
                        isIncome ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount, user.currency)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400 text-center">
              <Briefcase className="w-12 h-12 mb-3 opacity-40 text-slate-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">No ledger lines filtered</h3>
              <p className="text-xs max-w-sm mt-1">
                There are no ledger entries matching your active filter constraints. Try expanding date boundaries or selecting other flow options.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ================= BESPOKE PRINT-ONLY A4 STATEMENT ================= */}
      <div className="hidden print:block print-force-color w-full font-sans text-black antialiased space-y-6">
        {/* Colorful top band */}
        <div className="h-2.5 bg-gradient-to-r from-emerald-500 via-indigo-500 to-rose-500 rounded-full" />

        {/* Executive Header block */}
        <div className="flex justify-between items-start border-b-2 border-slate-950 pb-5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Official Financial Statement</span>
            <h1 className="text-3xl font-black text-slate-950 tracking-tight mt-1">{user.storeName || 'MaalNote'}</h1>
            <p className="text-xs text-slate-500 mt-1">
              Account Managed by: <span className="font-bold text-slate-800">{user.name}</span> ({user.email})
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-black text-indigo-950">MaalNote</h2>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1.5">Statement Download Date</div>
            <div className="text-xs font-bold text-slate-950 mt-0.5">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        </div>

        {/* Filter / Scope parameters */}
        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 border border-slate-100 rounded-xl p-4 print-force-color">
          <div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Statement Date Window</div>
            <div className="font-bold text-slate-900 mt-0.5">
              {startDate ? formatDate(startDate) : 'Beginning of Records'} — {endDate ? formatDate(endDate) : 'Present Date'}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Filters Active</div>
            <div className="font-bold text-slate-900 mt-0.5">
              Category: <span className="capitalize">{category === 'all' ? 'All' : category}</span> | Method: <span className="capitalize">{paymentMethod === 'all' ? 'All' : paymentMethod}</span>
            </div>
          </div>
        </div>

        {/* Total Account Of (Financial Summary Cards) */}
        <div className="grid grid-cols-3 gap-4">
          {/* Income block */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 print-force-color">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Total Income (Inflow)</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">
              {formatCurrency(summary.income, user.currency)}
            </div>
            <div className="text-[9px] text-emerald-600 font-semibold mt-1">
              {incomeRecords.length} recorded inflow entries
            </div>
          </div>

          {/* Expense block */}
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 print-force-color">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">Total Expenses (Outflow)</span>
            <div className="text-2xl font-black text-rose-700 mt-1">
              {formatCurrency(summary.expense, user.currency)}
            </div>
            <div className="text-[9px] text-rose-600 font-semibold mt-1">
              {expenseRecords.length} recorded outflow entries
            </div>
          </div>

          {/* Net balance block */}
          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 print-force-color">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800">Net Ledger Balance</span>
            <div className={`text-2xl font-black mt-1 ${netProfit >= 0 ? 'text-indigo-700' : 'text-rose-700'}`}>
              {formatCurrency(netProfit, user.currency)}
            </div>
            <div className="text-[9px] text-indigo-600 font-semibold mt-1">
              {netProfit >= 0 ? 'Surplus account statement' : 'Deficit account statement'}
            </div>
          </div>
        </div>

        {/* Separated Ledger Tables */}
        <div className="space-y-6 pt-4">
          {/* 1. INCOME TABLE */}
          <div className="print-avoid-break space-y-2">
            <div className="flex items-center gap-2 border-b-2 border-emerald-500 pb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 print-force-color" />
              <h3 className="text-sm font-black text-emerald-950 uppercase tracking-wider">I. Income Inflow Ledger</h3>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-emerald-50 border-b border-emerald-200 text-[9px] font-bold uppercase tracking-wider text-emerald-800 print-force-color">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Particulars / Details</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3 text-right">Credit Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incomeRecords.length > 0 ? (
                  incomeRecords.map((tx) => (
                    <tr key={tx.id} className="text-slate-800">
                      <td className="py-2.5 px-3 font-medium text-slate-500">{tx.date}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{tx.description || 'N/A'}</div>
                        <div className="text-[9px] text-slate-400 font-mono">Tx ID: {tx.id.slice(0, 8).toUpperCase()}</div>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700">{tx.category}</td>
                      <td className="py-2.5 px-3 text-slate-500 font-medium">{tx.paymentMethod}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-600 print-force-color">
                        +{formatCurrency(tx.amount, user.currency)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                      No income inflow transactions recorded under selected filters.
                    </td>
                  </tr>
                )}
                {/* Total row */}
                <tr className="bg-emerald-50 border-t-2 border-emerald-300 font-bold text-emerald-800 print-force-color">
                  <td colSpan={4} className="py-2.5 px-3 text-right uppercase tracking-wider text-[10px]">Total Ledger Inflow:</td>
                  <td className="py-2.5 px-3 text-right text-base text-emerald-700 font-black">
                    {formatCurrency(summary.income, user.currency)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 2. EXPENSE TABLE */}
          <div className="print-avoid-break space-y-2">
            <div className="flex items-center gap-2 border-b-2 border-rose-500 pb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 print-force-color" />
              <h3 className="text-sm font-black text-rose-950 uppercase tracking-wider">II. Expense Outflow Ledger</h3>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-rose-50 border-b border-rose-200 text-[9px] font-bold uppercase tracking-wider text-rose-800 print-force-color">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Particulars / Details</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3 text-right">Debit Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenseRecords.length > 0 ? (
                  expenseRecords.map((tx) => (
                    <tr key={tx.id} className="text-slate-800">
                      <td className="py-2.5 px-3 font-medium text-slate-500">{tx.date}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{tx.description || 'N/A'}</div>
                        <div className="text-[9px] text-slate-400 font-mono">Tx ID: {tx.id.slice(0, 8).toUpperCase()}</div>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700">{tx.category}</td>
                      <td className="py-2.5 px-3 text-slate-500 font-medium">{tx.paymentMethod}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-rose-600 print-force-color">
                        -{formatCurrency(tx.amount, user.currency)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                      No expense outflow transactions recorded under selected filters.
                    </td>
                  </tr>
                )}
                {/* Total row */}
                <tr className="bg-rose-50 border-t-2 border-rose-300 font-bold text-rose-800 print-force-color">
                  <td colSpan={4} className="py-2.5 px-3 text-right uppercase tracking-wider text-[10px]">Total Ledger Outflow:</td>
                  <td className="py-2.5 px-3 text-right text-base text-rose-700 font-black">
                    {formatCurrency(summary.expense, user.currency)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Print Footer */}
        <div className="border-t border-slate-200 pt-6 mt-12 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <div>
            System Generated Ledger Statement | MaalNote Finance Dashboard
          </div>
          <div>
            Page 1 of 1
          </div>
        </div>
      </div>
    </div>
  );
}
