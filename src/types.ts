/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'en' | 'es' | 'ar' | 'fr' | 'hi' | 'so';

export interface User {
  id: string;
  email: string;
  name: string;
  storeName: string;
  currency: string;
  language?: Language;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  description: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  netProfitMargin: number;
  monthlyIncome: number;
  monthlyExpense: number;
}

export interface Settings {
  darkMode: boolean;
  currency: string;
  storeName: string;
  taxRate: number;
}

export interface CategorySummary {
  category: string;
  amount: number;
  percentage: number;
}

export interface MonthlySummary {
  month: string; // e.g., "Jan", "Feb"
  income: number;
  expense: number;
  profit: number;
}

export interface DailySummary {
  date: string; // YYYY-MM-DD
  income: number;
  expense: number;
}
