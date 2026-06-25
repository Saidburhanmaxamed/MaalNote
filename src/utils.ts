/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  try {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0, // Keep integers for clean accounting aesthetic unless decimals are needed
    });
    return formatter.format(amount);
  } catch (e) {
    // Fallback if currency is unsupported
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

// Income Categories
export const INCOME_CATEGORIES = [
  'Sales Revenue',
  'Services',
  'Consulting',
  'Investment',
  'Other Income'
];

// Expense Categories
export const EXPENSE_CATEGORIES = [
  'Inventory',
  'Rent',
  'Salaries',
  'Utilities',
  'Marketing',
  'Insurance',
  'Software & Subscriptions',
  'Other Expenses'
];

// Payment Methods
export const PAYMENT_METHODS = [
  'Cash',
  'Credit Card',
  'Bank Transfer',
  'Mobile Payment',
  'PayPal'
];
