export type TransactionType = 'income' | 'expense' | 'credit' | 'debit';

export interface Transaction {
  id?: string;
  amount: number;
  date: string;
  time?: string;
  category: string;
  description: string;
  person?: string;
  type: TransactionType;
  createdAt: number;
}
