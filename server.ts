/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = 3000;

// Path to JSON database
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure database file exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface UserRecord {
  id: string;
  email: string;
  name: string;
  storeName: string;
  currency: string;
  passwordHash: string;
  salt: string;
  taxRate: number;
  language?: string;
}

interface TransactionRecord {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  description: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

interface SessionRecord {
  token: string;
  userId: string;
  expiresAt: number;
}

interface DBStructure {
  users: UserRecord[];
  transactions: TransactionRecord[];
  sessions: SessionRecord[];
}

function initDB(): DBStructure {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(content);
      return {
        users: data.users || [],
        transactions: data.transactions || [],
        sessions: data.sessions || [],
      };
    } catch (e) {
      console.error('Error reading DB, resetting', e);
    }
  }
  const defaultDB: DBStructure = { users: [], transactions: [], sessions: [] };
  fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2));
  return defaultDB;
}

function saveDB(db: DBStructure) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// Global DB instance
let db = initDB();

// Supabase Configuration
const rawSupabaseUrl = process.env.SUPABASE_URL || 'https://xriuiancwyskumvfdfuo.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyaXVpYW5jd3lza3VtdmZkZnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMjg4NjEsImV4cCI6MjA5NzkwNDg2MX0.bOH8eMTHV8zmrjcRXAGF1TdyJwQruqoEIjNBiVYwbO4';

// Sanitize URL by removing trailing /rest/v1/ or /rest/v1 if present in environment variables
let SUPABASE_URL = rawSupabaseUrl.trim();
if (SUPABASE_URL.endsWith('/rest/v1/')) {
  SUPABASE_URL = SUPABASE_URL.slice(0, -9);
} else if (SUPABASE_URL.endsWith('/rest/v1')) {
  SUPABASE_URL = SUPABASE_URL.slice(0, -8);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database status API endpoint
app.get('/api/supabase-status', (req, res) => {
  res.json({
    url: SUPABASE_URL,
    configured: !!SUPABASE_ANON_KEY,
    tables: ['users', 'transactions', 'sessions']
  });
});

async function safeUpsert(table: string, data: any, matchField: string = 'id') {
  try {
    let payload = data;
    if (table === 'users' && data) {
      const { language, ...rest } = data;
      payload = rest;
    }
    const { error } = await supabase.from(table).upsert(payload);
    if (error) {
      console.error(`Supabase upsert to [${table}] failed:`, error.message);
    } else {
      console.log(`Successfully synced record to Supabase [${table}]:`, payload[matchField] || payload);
    }
  } catch (err) {
    console.error(`Exception during Supabase upsert to [${table}]:`, err);
  }
}

async function safeDelete(table: string, matchField: string, value: any) {
  try {
    const { error } = await supabase.from(table).delete().eq(matchField, value);
    if (error) {
      console.error(`Supabase delete from [${table}] failed:`, error.message);
    } else {
      console.log(`Successfully deleted record from Supabase [${table}] where ${matchField} = ${value}`);
    }
  } catch (err) {
    console.error(`Exception during Supabase delete from [${table}]:`, err);
  }
}

async function syncFromSupabase() {
  console.log('Syncing data from Supabase...');
  try {
    // 1. Fetch users
    const { data: usersData, error: usersError } = await supabase.from('users').select('*');
    if (usersError) {
      console.warn('Supabase users fetch skipped/failed (possibly table does not exist yet):', usersError.message);
    } else if (usersData && usersData.length > 0) {
      usersData.forEach((u: any) => {
        const idx = db.users.findIndex(localU => localU.id === u.id);
        if (idx > -1) {
          db.users[idx] = u;
        } else {
          db.users.push(u);
        }
      });
      console.log(`Synced ${usersData.length} users from Supabase.`);
    }

    // 2. Fetch transactions
    const { data: txData, error: txError } = await supabase.from('transactions').select('*');
    if (txError) {
      console.warn('Supabase transactions fetch skipped/failed:', txError.message);
    } else if (txData && txData.length > 0) {
      txData.forEach((t: any) => {
        const idx = db.transactions.findIndex(localT => localT.id === t.id);
        if (idx > -1) {
          db.transactions[idx] = t;
        } else {
          db.transactions.push(t);
        }
      });
      console.log(`Synced ${txData.length} transactions from Supabase.`);
    }

    // 3. Fetch sessions
    const { data: sessionsData, error: sessionsError } = await supabase.from('sessions').select('*');
    if (sessionsError) {
      console.warn('Supabase sessions fetch skipped/failed:', sessionsError.message);
    } else if (sessionsData && sessionsData.length > 0) {
      sessionsData.forEach((s: any) => {
        const idx = db.sessions.findIndex(localS => localS.token === s.token);
        if (idx > -1) {
          db.sessions[idx] = s;
        } else {
          db.sessions.push(s);
        }
      });
      console.log(`Synced ${sessionsData.length} sessions from Supabase.`);
    }

    saveDB(db);
  } catch (err) {
    console.error('Error in syncFromSupabase:', err);
  }
}

// Password helper
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

// Generate token
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Middleware to parse JSON
app.use(express.json());

// Auth Middleware
function authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  const session = db.sessions.find(s => s.token === token);
  if (!session) {
    res.status(403).json({ error: 'Invalid or expired token' });
    return;
  }

  if (session.expiresAt < Date.now()) {
    // Clear expired session
    db.sessions = db.sessions.filter(s => s.token !== token);
    saveDB(db);
    res.status(403).json({ error: 'Session expired' });
    return;
  }

  const user = db.users.find(u => u.id === session.userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  // Attach user and session to request
  (req as any).user = user;
  (req as any).token = token;
  next();
}

// Helper to seed beautiful ledger data for demo/mock experience
function seedUserTransactions(userId: string) {
  const incomeCategories = ['Sales Revenue', 'Services', 'Consulting', 'Investment', 'Other Income'];
  const expenseCategories = ['Inventory', 'Rent', 'Salaries', 'Utilities', 'Marketing', 'Insurance', 'Software & Subscriptions', 'Other Expenses'];
  const paymentMethods = ['Cash', 'Credit Card', 'Bank Transfer', 'Mobile Payment', 'PayPal'];

  const now = new Date();
  const seedTransactions: TransactionRecord[] = [];

  // Generate data over the last 12 months
  for (let i = 0; i < 60; i++) {
    const daysAgo = Math.floor(Math.random() * 365);
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];

    const type = Math.random() > 0.4 ? 'income' : 'expense';
    let amount = 0;
    let category = '';
    let description = '';

    if (type === 'income') {
      category = incomeCategories[Math.floor(Math.random() * incomeCategories.length)];
      if (category === 'Sales Revenue') {
        amount = Math.floor(Math.random() * 2500) + 500;
        description = `Customer payment for order #${Math.floor(Math.random() * 9000) + 1000}`;
      } else if (category === 'Services') {
        amount = Math.floor(Math.random() * 1200) + 300;
        description = 'Service delivery billing';
      } else if (category === 'Consulting') {
        amount = Math.floor(Math.random() * 2000) + 1000;
        description = 'Monthly consulting retainer';
      } else {
        amount = Math.floor(Math.random() * 500) + 50;
        description = 'Miscellaneous incoming payment';
      }
    } else {
      category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
      if (category === 'Inventory') {
        amount = Math.floor(Math.random() * 1500) + 200;
        description = 'Restocking supply order';
      } else if (category === 'Rent') {
        // Rent generated periodically
        amount = 1200;
        description = 'Office/Store monthly rent';
      } else if (category === 'Salaries') {
        amount = Math.floor(Math.random() * 2000) + 1500;
        description = 'Employee compensation payment';
      } else if (category === 'Utilities') {
        amount = Math.floor(Math.random() * 300) + 100;
        description = 'Electricity and water services';
      } else if (category === 'Marketing') {
        amount = Math.floor(Math.random() * 600) + 150;
        description = 'Ad campaign and promotion bills';
      } else {
        amount = Math.floor(Math.random() * 250) + 30;
        description = 'Store maintenance and supplies';
      }
    }

    const payMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

    seedTransactions.push({
      id: crypto.randomUUID(),
      userId,
      type,
      amount,
      category,
      date: dateStr,
      description,
      paymentMethod: payMethod,
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
    });
  }

  // Sort by date descending
  seedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  db.transactions.push(...seedTransactions);
  saveDB(db);
}

// --- API ROUTES ---

// 1. SIGNUP
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name, storeName, currency } = req.body;

  if (!email || !password || !name) {
    res.status(400).json({ error: 'Email, password, and name are required' });
    return;
  }

  // Check local database first
  let existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!existing) {
    // Check Supabase database users table
    try {
      const { data, error } = await supabase.from('users').select('*').eq('email', email.toLowerCase()).maybeSingle();
      if (!error && data) {
        existing = data as UserRecord;
        // Also cache locally
        db.users.push(existing);
        saveDB(db);
      }
    } catch (err: any) {
      console.warn('Error checking existing email in Supabase during signup:', err.message || err);
    }
  }

  if (existing) {
    res.status(400).json({ error: 'Email already registered' });
    return;
  }

  const userId: string = crypto.randomUUID();
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);

  const newUser: UserRecord = {
    id: userId,
    email: email.toLowerCase(),
    name,
    storeName: storeName || 'My Store',
    currency: currency || 'USD',
    passwordHash,
    salt,
    taxRate: 0,
    language: 'en',
  };

  db.users.push(newUser);
  saveDB(db);

  // Sync to Supabase
  await safeUpsert('users', newUser, 'id');

  // New users start completely empty and blank as requested. No seeded/dummy transactions.
  // seedUserTransactions(userId);

  const token = generateToken();
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

  const sessionObj = { token, userId, expiresAt };
  db.sessions.push(sessionObj);
  saveDB(db);

  // Sync session to Supabase
  await safeUpsert('sessions', sessionObj, 'token');

  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      storeName: newUser.storeName,
      currency: newUser.currency,
      language: newUser.language || 'en',
    },
  });
});

// 2. LOGIN
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  let authenticatedUser: UserRecord | null = null;

  // 1. Check local database first
  let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  // 2. If not found in local database, check Supabase database users table
  if (!user) {
    console.log(`User [${email}] not found in local DB memory. Checking Supabase 'users' table...`);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (!error && data) {
        user = data as UserRecord;
        db.users.push(user);
        saveDB(db);
        console.log(`Fetched user [${email}] profile from Supabase and updated local cache.`);
      }
    } catch (err: any) {
      console.error('Error fetching user from Supabase during login:', err.message || err);
    }
  }

  // 3. Verify the hashed password
  if (user && user.passwordHash) {
    const passwordHash = hashPassword(password, user.salt);
    if (passwordHash === user.passwordHash) {
      authenticatedUser = user;
      console.log(`Successfully authenticated user [${email}] using custom database credentials.`);
    }
  }

  if (!authenticatedUser) {
    res.status(400).json({ error: 'Invalid email or password' });
    return;
  }

  const token = generateToken();
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

  const sessionObj = { token, userId: authenticatedUser.id, expiresAt };
  db.sessions.push(sessionObj);
  saveDB(db);

  // Sync session to Supabase
  await safeUpsert('sessions', sessionObj, 'token');

  res.json({
    token,
    user: {
      id: authenticatedUser.id,
      email: authenticatedUser.email,
      name: authenticatedUser.name,
      storeName: authenticatedUser.storeName,
      currency: authenticatedUser.currency,
      language: authenticatedUser.language || 'en',
    },
  });
});

// 2.5. RESET PASSWORD
app.post('/api/auth/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    res.status(400).json({ error: 'Email and new password are required' });
    return;
  }

  // Check local database first
  let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  // If not found in local database, check Supabase
  if (!user) {
    console.log(`Reset requested for user [${email}] not found in local DB memory. Checking Supabase...`);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (!error && data) {
        user = data as UserRecord;
        db.users.push(user);
        saveDB(db);
        console.log(`Fetched user [${email}] profile from Supabase during password reset.`);
      }
    } catch (err: any) {
      console.error('Error fetching user from Supabase during reset-password:', err.message || err);
    }
  }

  if (!user) {
    res.status(404).json({ error: 'No account found with this email address' });
    return;
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(newPassword, salt);

  user.passwordHash = passwordHash;
  user.salt = salt;
  
  saveDB(db);

  // Sync to Supabase
  await safeUpsert('users', user, 'id');

  res.json({ success: true, message: 'Password reset successfully' });
});

// 3. ME (Get current user)
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = (req as any).user as UserRecord;
  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      storeName: user.storeName,
      currency: user.currency,
      language: user.language || 'en',
    },
  });
});

// 4. LOGOUT
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  const token = (req as any).token;
  db.sessions = db.sessions.filter(s => s.token !== token);
  saveDB(db);

  // Delete session from Supabase
  await safeDelete('sessions', 'token', token);

  res.json({ success: true });
});

// 5. UPDATE PROFILE
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  const user = (req as any).user as UserRecord;
  const { name, storeName, currency, language } = req.body;

  const userIdx = db.users.findIndex(u => u.id === user.id);
  if (userIdx === -1) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  if (name) db.users[userIdx].name = name;
  if (storeName) db.users[userIdx].storeName = storeName;
  if (currency) db.users[userIdx].currency = currency;
  if (language) db.users[userIdx].language = language;

  saveDB(db);

  // Sync profile to Supabase
  await safeUpsert('users', db.users[userIdx], 'id');

  res.json({
    user: {
      id: db.users[userIdx].id,
      email: db.users[userIdx].email,
      name: db.users[userIdx].name,
      storeName: db.users[userIdx].storeName,
      currency: db.users[userIdx].currency,
      language: db.users[userIdx].language || 'en',
    },
  });
});

// 6. GET TRANSACTIONS
app.get('/api/transactions', authenticateToken, (req, res) => {
  const user = (req as any).user as UserRecord;
  const { type, search, category, startDate, endDate } = req.query;

  let records = db.transactions.filter(t => t.userId === user.id);

  if (type) {
    records = records.filter(t => t.type === type);
  }

  if (category) {
    records = records.filter(t => t.category.toLowerCase() === (category as string).toLowerCase());
  }

  if (search) {
    const q = (search as string).toLowerCase();
    records = records.filter(t =>
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.paymentMethod.toLowerCase().includes(q)
    );
  }

  if (startDate) {
    records = records.filter(t => t.date >= (startDate as string));
  }

  if (endDate) {
    records = records.filter(t => t.date <= (endDate as string));
  }

  // Sort by date descending
  records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.json(records);
});

// 7. CREATE TRANSACTION
app.post('/api/transactions', authenticateToken, async (req, res) => {
  const user = (req as any).user as UserRecord;
  const { type, amount, category, date, description, paymentMethod } = req.body;

  if (!type || !amount || !category || !date) {
    res.status(400).json({ error: 'Type, amount, category, and date are required' });
    return;
  }

  if (type !== 'income' && type !== 'expense') {
    res.status(400).json({ error: 'Type must be "income" or "expense"' });
    return;
  }

  const newTx: TransactionRecord = {
    id: crypto.randomUUID(),
    userId: user.id,
    type,
    amount: Number(amount),
    category,
    date,
    description: description || '',
    paymentMethod: paymentMethod || 'Cash',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.transactions.push(newTx);
  saveDB(db);

  // Sync to Supabase
  await safeUpsert('transactions', newTx, 'id');

  res.status(201).json(newTx);
});

// 8. UPDATE TRANSACTION
app.put('/api/transactions/:id', authenticateToken, async (req, res) => {
  const user = (req as any).user as UserRecord;
  const { id } = req.params;
  const { type, amount, category, date, description, paymentMethod } = req.body;

  const txIdx = db.transactions.findIndex(t => t.id === id && t.userId === user.id);
  if (txIdx === -1) {
    res.status(404).json({ error: 'Transaction not found or unauthorized' });
    return;
  }

  const tx = db.transactions[txIdx];

  if (type) tx.type = type;
  if (amount !== undefined) tx.amount = Number(amount);
  if (category) tx.category = category;
  if (date) tx.date = date;
  if (description !== undefined) tx.description = description;
  if (paymentMethod) tx.paymentMethod = paymentMethod;
  tx.updatedAt = new Date().toISOString();

  saveDB(db);

  // Sync to Supabase
  await safeUpsert('transactions', tx, 'id');

  res.json(tx);
});

// 9. DELETE TRANSACTION
app.delete('/api/transactions/:id', authenticateToken, async (req, res) => {
  const user = (req as any).user as UserRecord;
  const { id } = req.params;

  const txIdx = db.transactions.findIndex(t => t.id === id && t.userId === user.id);
  if (txIdx === -1) {
    res.status(404).json({ error: 'Transaction not found or unauthorized' });
    return;
  }

  const deleted = db.transactions.splice(txIdx, 1);
  saveDB(db);

  // Sync delete to Supabase
  await safeDelete('transactions', 'id', id);

  res.json({ success: true, deleted: deleted[0] });
});

// 10. GET STATS AND ANALYTICS
app.get('/api/analytics', authenticateToken, (req, res) => {
  const user = (req as any).user as UserRecord;

  const records = db.transactions.filter(t => t.userId === user.id);

  // Math totals
  let totalIncome = 0;
  let totalExpenses = 0;

  const now = new Date();
  const currentMonthStr = now.toISOString().slice(0, 7); // YYYY-MM
  let monthlyIncome = 0;
  let monthlyExpense = 0;

  records.forEach(r => {
    const amt = r.amount;
    const isCurrentMonth = r.date.startsWith(currentMonthStr);

    if (r.type === 'income') {
      totalIncome += amt;
      if (isCurrentMonth) monthlyIncome += amt;
    } else {
      totalExpenses += amt;
      if (isCurrentMonth) monthlyExpense += amt;
    }
  });

  const netProfit = totalIncome - totalExpenses;
  const netProfitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

  // Compile monthly trend (last 6 months)
  const monthlyTrendMap: { [key: string]: { income: number; expense: number } } = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(now.getMonth() - i);
    const mStr = d.toISOString().slice(0, 7); // YYYY-MM
    const label = d.toLocaleString('default', { month: 'short' });
    monthlyTrendMap[mStr] = { income: 0, expense: 0 };
  }

  records.forEach(r => {
    const mStr = r.date.slice(0, 7);
    if (monthlyTrendMap[mStr]) {
      if (r.type === 'income') {
        monthlyTrendMap[mStr].income += r.amount;
      } else {
        monthlyTrendMap[mStr].expense += r.amount;
      }
    }
  });

  const monthlySummary = Object.keys(monthlyTrendMap).map(mStr => {
    const d = new Date(mStr + '-02'); // offset timezone
    const monthName = d.toLocaleString('default', { month: 'short' });
    const trend = monthlyTrendMap[mStr];
    return {
      month: monthName,
      income: trend.income,
      expense: trend.expense,
      profit: trend.income - trend.expense,
    };
  });

  // Compile Category breakdown for income and expenses
  const incomeCategoryMap: { [key: string]: number } = {};
  const expenseCategoryMap: { [key: string]: number } = {};

  records.forEach(r => {
    const map = r.type === 'income' ? incomeCategoryMap : expenseCategoryMap;
    map[r.category] = (map[r.category] || 0) + r.amount;
  });

  const incomeCategoriesBreakdown = Object.keys(incomeCategoryMap).map(cat => ({
    category: cat,
    amount: incomeCategoryMap[cat],
    percentage: totalIncome > 0 ? (incomeCategoryMap[cat] / totalIncome) * 100 : 0,
  })).sort((a, b) => b.amount - a.amount);

  const expenseCategoriesBreakdown = Object.keys(expenseCategoryMap).map(cat => ({
    category: cat,
    amount: expenseCategoryMap[cat],
    percentage: totalExpenses > 0 ? (expenseCategoryMap[cat] / totalExpenses) * 100 : 0,
  })).sort((a, b) => b.amount - a.amount);

  res.json({
    stats: {
      totalIncome,
      totalExpenses,
      netProfit,
      netProfitMargin,
      monthlyIncome,
      monthlyExpense,
    },
    monthlySummary,
    incomeBreakdown: incomeCategoriesBreakdown,
    expenseBreakdown: expenseCategoriesBreakdown,
  });
});

// --- VITE MIDDLEWARE INTERACTION ---

async function startServer() {
  // Sync all existing entries on server start
  await syncFromSupabase();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
