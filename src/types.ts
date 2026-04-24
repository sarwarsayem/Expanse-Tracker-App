/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TransactionType = 'expense' | 'income';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  categoryId: string;
  amount: number;
  description: string;
  date: Date;
}

export const CATEGORIES: Category[] = [
  { id: 'food', name: 'Food', icon: 'Utensils', color: '#FF9500' },
  { id: 'transport', name: 'Transport', icon: 'Car', color: '#5AC8FA' },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#FF2D55' },
  { id: 'entertainment', name: 'Entertainment', icon: 'Gamepad2', color: '#5856D6' },
  { id: 'health', name: 'Health', icon: 'HeartPulse', color: '#4CD964' },
  { id: 'bills', name: 'Bills', icon: 'ReceiptText', color: '#FFCC00' },
  { id: 'others', name: 'Others', icon: 'MoreHorizontal', color: '#8E8E93' },
  { id: 'salary', name: 'Salary', icon: 'Banknote', color: '#34C759' },
  { id: 'investment', name: 'Investment', icon: 'TrendingUp', color: '#007AFF' },
];
