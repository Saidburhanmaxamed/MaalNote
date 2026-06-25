/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  X, 
  ArrowDownRight, 
  DollarSign, 
  Calendar, 
  FileText, 
  CreditCard 
} from 'lucide-react';
import { Transaction, User } from '../types';
import { formatCurrency, formatDate, EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../utils';

interface ExpenseManagerProps {
  user: User;
  transactions: Transaction[];
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateTransaction: (id: string, tx: Partial<Transaction>) => Promise<void>;
  onDeleteTransaction: (id: string) => Promise<void>;
  loading: boolean;
}

export default function ExpenseManager({
  user,
  transactions,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  loading
}: ExpenseManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Form Fields
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);

  // Filter only expense transactions
  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  // Filter by search & category
  const filteredExpenses = expenseTransactions.filter(tx => {
    const matchesSearch = 
      (tx.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || tx.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const totalFilteredExpense = filteredExpenses.reduce((acc, tx) => acc + tx.amount, 0);

  const openAddModal = () => {
    setEditingTransaction(null);
    setAmount('');
    setCategory(EXPENSE_CATEGORIES[0]);
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setPaymentMethod(PAYMENT_METHODS[0]);
    setIsModalOpen(true);
  };

  const openEditModal = (tx: Transaction) => {
    setEditingTransaction(tx);
    setAmount(tx.amount.toString());
    setCategory(tx.category);
    setDate(tx.date);
    setDescription(tx.description || '');
    setPaymentMethod(tx.paymentMethod);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;

    const payload = {
      type: 'expense' as const,
      amount: Number(amount),
      category,
      date,
      description,
      paymentMethod
    };

    if (editingTransaction) {
      await onUpdateTransaction(editingTransaction.id, payload);
    } else {
      await onAddTransaction(payload);
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      await onDeleteTransaction(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Expense Ledger
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track and authorize your store utilities, inventory, rent, and salaries.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-rose-600/10 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>New Expense Record</span>
        </button>
      </div>

      {/* Overview Metric Banner */}
      <div className="p-6 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/60 dark:border-rose-900/30 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Total Filtered Outflows</span>
          <h2 className="text-3xl font-extrabold text-rose-800 dark:text-rose-300 mt-1">
            {formatCurrency(totalFilteredExpense, user.currency)}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">
            Across {filteredExpenses.length} recorded entries
          </p>
        </div>
        <div className="p-4 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
          <ArrowDownRight className="w-8 h-8" />
        </div>
      </div>

      {/* Control Filters Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 backdrop-blur-sm shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search expenses by details, category, payment method..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
          >
            <option value="All">All Expenses</option>
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expense Records List */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 backdrop-blur-sm shadow-sm overflow-x-auto">
        {filteredExpenses.length > 0 ? (
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-850 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Expense Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50 dark:divide-slate-850/50 text-xs font-semibold text-slate-600 dark:text-slate-300">
              {filteredExpenses.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/55 dark:hover:bg-slate-850/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="text-slate-900 dark:text-white font-bold">{tx.description || 'General Expense'}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold text-rose-600 bg-rose-500/10">
                      {tx.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">
                    {tx.paymentMethod}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-medium">
                    {formatDate(tx.date)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-sm text-rose-600 dark:text-rose-400">
                    -{formatCurrency(tx.amount, user.currency)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditModal(tx)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-850 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 dark:hover:text-indigo-400 transition-all cursor-pointer"
                        title="Edit Record"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-850 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 transition-all cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400 text-center">
            <DollarSign className="w-12 h-12 mb-3 opacity-40 text-rose-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">No expense logs found</h3>
            <p className="text-xs max-w-sm mt-1">
              Adjust your search filters, query details, or record a new expense line item to begin tracking budget spent.
            </p>
          </div>
        )}
      </div>

      {/* Add / Edit Transaction Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight">
                {editingTransaction ? 'Edit Expense Record' : 'Record New Expense Outflow'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Maintain high bookkeeping fidelity for perfect cost analysis.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {/* Amount */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Amount ({user.currency})
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-500 font-bold text-sm">$</div>
                    <input
                      type="number"
                      required
                      min="0.01"
                      step="any"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
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
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-500 transition-all"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
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
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
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
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g., Paid electric utility bill..."
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
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
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
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-xs font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {loading ? 'Saving...' : editingTransaction ? 'Save Edits' : 'Add Record'}
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
