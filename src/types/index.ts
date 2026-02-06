export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  title: string;
  amount: number;
  category: string;
  type: TransactionType;
  date: string;
  note?: string;
  originalCurrency?: string;
  originalAmount?: number;
};

export type AppSettings = {
  currency: string;
  selectedWeek?: number;
  showDelta?: boolean;
  selectedMonth?: string;
};
