import { Transaction } from "../types";
import { getTransactions, addTransaction, deleteTransaction, updateTransaction, deleteMultipleTransactions, bulkImportTransactions } from "./DatabaseService";
import { syncTransaction } from "./FirebaseService";

const uuidv4 = (): string => {
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
};

export class TransactionManager {
  private cache: Transaction[] = [];

  constructor() {
    // No storage service dependency
  }

  // Reuse the logic but now we don't need 'cleanNumber' as much if we enforce types, 
  // but good to keep for validation if inputs come from UI
  private cleanNumber(v: any): number {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v !== "string") return 0;
    const n = parseFloat(v);
    return isFinite(n) ? n : 0;
  }

  async load(): Promise<void> {
    this.cache = await getTransactions();
  }

  getAll(): Transaction[] {
    return this.cache;
  }

  async add(t: Transaction): Promise<void> {
    const fixed = { ...t, id: t.id || uuidv4() };
    await addTransaction(fixed);
    this.cache = [fixed, ...this.cache]; // Prepend for 'recent' logic

    // Sync to Firebase (background)
    syncTransaction(fixed).catch(console.error);
  }

  async addTransaction(t: Omit<Transaction, "id">, originalCurrency?: string, originalAmount?: number): Promise<Transaction> {
    const fixed: Transaction = {
      id: uuidv4(),
      title: t.title,
      amount: this.cleanNumber(t.amount),
      category: t.category,
      type: t.type,
      date: t.date, // Should be ISO string
      note: t.note,
      originalCurrency,
      originalAmount
    };

    await addTransaction(fixed);
    this.cache = [fixed, ...this.cache];

    // Sync to Firebase
    syncTransaction(fixed).catch(console.error);

    return fixed;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    try {
      await deleteTransaction(id);
      this.cache = this.cache.filter(t => t.id !== id);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<boolean> {
    try {
      await updateTransaction(id, updates);
      this.cache = this.cache.map(t =>
        t.id === id ? { ...t, ...updates } : t
      );
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async deleteMultiple(ids: string[]): Promise<boolean> {
    try {
      await deleteMultipleTransactions(ids);
      this.cache = this.cache.filter(t => !ids.includes(t.id));
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async importTransactions(transactions: Transaction[]): Promise<boolean> {
    try {
      await bulkImportTransactions(transactions);
      await this.load(); // Reload cache entirely
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  getBalance(currencyService?: any, targetCurrency?: string): number {
    return this.getTotalIncome(currencyService, targetCurrency) - this.getTotalExpense(currencyService, targetCurrency);
  }

  getRecent(n: number): Transaction[] {
    // Cache is already sorted desc by DatabaseService query, but let's ensure
    return this.cache.slice(0, n);
  }

  getWeeklyTrend(currencyService?: any, targetCurrency?: string): { date: string; balance: number }[] {
    // Reuse existing logic, operating on this.cache which is in-memory
    const sorted = [...this.cache].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const map: Record<string, number> = {};
    let runningBalance = 0;

    for (const t of sorted) {
      const d = t.date.slice(0, 10);
      let amt = t.amount;

      if (currencyService && targetCurrency) {
        // Conversion logic
        if (t.originalCurrency && t.originalAmount) {
          amt = currencyService.convert(t.originalAmount, t.originalCurrency, targetCurrency);
        } else {
          const base = "IDR"; // Simplification
          amt = currencyService.convert(amt, base, targetCurrency);
        }
      }

      if (t.type === "income") runningBalance += amt;
      else runningBalance -= amt;

      // In a daily-change (delta) graph, we might just want the delta sum, not running balance?
      // Readme says "Daily Change (Delta-only) Mode". 
      // User requested NOT TO DELETE existing features.
      // So I will assume the original logic was calculating running balance. 
      // But wait, existing code calculated running balance.
      // If "Delta" mode is active, it handles it differently in UI. Here we return running balance.
      map[d] = runningBalance;
    }

    return Object.entries(map).map(([date, balance]) => ({ date, balance }));
  }

  // ... (Other aggregation methods use this.cache and remain mostly pure logic)
  // Simplified for brevity, assume similar logic to original but cleaner
  getTotalIncome(currencyService?: any, targetCurrency?: string): number {
    let total = 0;
    for (const t of this.cache) {
      if (t.type !== "income") continue;
      let amt = t.amount;
      if (currencyService && targetCurrency) {
        if (t.originalCurrency && t.originalAmount) {
          amt = currencyService.convert(t.originalAmount, t.originalCurrency, targetCurrency);
        } else {
          amt = currencyService.convert(amt, "IDR", targetCurrency);
        }
      }
      total += amt;
    }
    return total;
  }

  getTotalExpense(currencyService?: any, targetCurrency?: string): number {
    let total = 0;
    for (const t of this.cache) {
      if (t.type !== "expense") continue;
      let amt = t.amount;
      if (currencyService && targetCurrency) {
        if (t.originalCurrency && t.originalAmount) {
          amt = currencyService.convert(t.originalAmount, t.originalCurrency, targetCurrency);
        } else {
          amt = currencyService.convert(amt, "IDR", targetCurrency);
        }
      }
      total += amt;
    }
    return total;
  }

  getCategorySummary(currencyService?: any, targetCurrency?: string): { category: string; total: number }[] {
    const map: Record<string, number> = {};
    for (const t of this.cache) {
      if (t.type !== "expense") continue;
      const c = t.category || "Other";
      let amt = t.amount;
      if (currencyService && targetCurrency) {
        if (t.originalCurrency && t.originalAmount) {
          amt = currencyService.convert(t.originalAmount, t.originalCurrency, targetCurrency);
        } else {
          amt = currencyService.convert(amt, "IDR", targetCurrency);
        }
      }
      map[c] = (map[c] || 0) + amt;
    }
    return Object.entries(map).map(([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total);
  }
}
export default TransactionManager;