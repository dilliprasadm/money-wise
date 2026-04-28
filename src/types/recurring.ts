export type RecurringType = 'income' | 'expense' | 'credit' | 'debit';

export interface RecurringItem {
  id?: string;
  name: string;
  amount: number;
  dayOfMonth: number;
  type: RecurringType;
  category: string;
  person?: string;
  lastProcessedMonth?: string; // Format: "YYYY-MM" to track if paid this month
  createdAt: number;
}
