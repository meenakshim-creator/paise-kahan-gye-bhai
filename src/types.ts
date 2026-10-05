export type CategoryId =
  | 'food'
  | 'shopping'
  | 'transport'
  | 'entertainment'
  | 'education'
  | 'bills'
  | 'rent'
  | 'subscriptions'
  | 'health'
  | 'other';

export type PaymentMethod = 'UPI' | 'Cash' | 'Debit Card' | 'Credit Card' | 'Bank Transfer';

export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  type: TransactionType;
  merchant: string;
  category: CategoryId;
  amount: number;
  date: string; // ISO date
  paymentMethod: PaymentMethod;
  note?: string;
}

export interface Budget {
  category: CategoryId;
  limit: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  icon: string;
  target: number;
  saved: number;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  icon: string;
}

export interface AppState {
  profileName: string;
  monthlyIncome: number;
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  subscriptions: Subscription[];
}

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'food', label: 'Food', icon: '🍔', color: '#ef4444', bgColor: '#fef2f2' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', color: '#8b5cf6', bgColor: '#f5f3ff' },
  { id: 'transport', label: 'Transport', icon: '🚕', color: '#3b82f6', bgColor: '#eff6ff' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#ec4899', bgColor: '#fdf2f8' },
  { id: 'education', label: 'Education', icon: '📚', color: '#14b8a6', bgColor: '#f0fdfa' },
  { id: 'bills', label: 'Bills', icon: '💡', color: '#f59e0b', bgColor: '#fffbeb' },
  { id: 'rent', label: 'Rent', icon: '🏠', color: '#6366f1', bgColor: '#eef2ff' },
  { id: 'subscriptions', label: 'Subscriptions', icon: '💳', color: '#06b6d4', bgColor: '#ecfeff' },
  { id: 'health', label: 'Health', icon: '🩷', color: '#e11d48', bgColor: '#fff1f2' },
  { id: 'other', label: 'Other', icon: '📦', color: '#6b7280', bgColor: '#f9fafb' },
];

export const PAYMENT_METHODS: PaymentMethod[] = ['UPI', 'Cash', 'Debit Card', 'Credit Card', 'Bank Transfer'];

export function getCategoryMeta(id: CategoryId): CategoryMeta {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}
