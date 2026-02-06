import * as SQLite from 'expo-sqlite';
import { Transaction } from '../types';

const db = SQLite.openDatabaseSync('pocketexpense.db');

export const initDatabase = async () => {
    try {
        await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        type TEXT NOT NULL,
        date TEXT NOT NULL,
        note TEXT,
        originalCurrency TEXT,
        originalAmount REAL
      );
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY NOT NULL,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL
      );
    `);
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Failed to initialize database:', error);
    }
};

export const getTransactions = async (): Promise<Transaction[]> => {
    try {
        // Use synchronous method since we opened with openDatabaseSync
        const result = db.getAllSync<Transaction>('SELECT * FROM transactions ORDER BY date DESC');
        return result;
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
};

export const addTransaction = async (transaction: Transaction): Promise<void> => {
    try {
        await db.runAsync(
            'INSERT OR REPLACE INTO transactions (id, title, amount, category, type, date, note, originalCurrency, originalAmount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                transaction.id,
                transaction.title,
                transaction.amount,
                transaction.category,
                transaction.type,
                transaction.date,
                transaction.note ?? null,
                transaction.originalCurrency ?? null,
                transaction.originalAmount ?? null,
            ]
        );
    } catch (error) {
        console.error('Error adding transaction:', error);
        throw error;
    }
};

export const deleteTransaction = async (id: string): Promise<void> => {
    try {
        await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
    } catch (error) {
        console.error('Error deleting transaction:', error);
        throw error;
    }
};

export const updateTransaction = async (id: string, updates: Partial<Transaction>): Promise<void> => {
    try {
        const fields: string[] = [];
        const values: any[] = [];

        if (updates.title !== undefined) { fields.push('title = ?'); values.push(updates.title); }
        if (updates.amount !== undefined) { fields.push('amount = ?'); values.push(updates.amount); }
        if (updates.category !== undefined) { fields.push('category = ?'); values.push(updates.category); }
        if (updates.type !== undefined) { fields.push('type = ?'); values.push(updates.type); }
        if (updates.date !== undefined) { fields.push('date = ?'); values.push(updates.date); }
        if (updates.note !== undefined) { fields.push('note = ?'); values.push(updates.note); }
        if (updates.originalCurrency !== undefined) { fields.push('originalCurrency = ?'); values.push(updates.originalCurrency); }
        if (updates.originalAmount !== undefined) { fields.push('originalAmount = ?'); values.push(updates.originalAmount); }

        if (fields.length === 0) return;

        values.push(id);
        await db.runAsync(`UPDATE transactions SET ${fields.join(', ')} WHERE id = ?`, values);
    } catch (error) {
        console.error('Error updating transaction:', error);
        throw error;
    }
};

export const deleteMultipleTransactions = async (ids: string[]): Promise<void> => {
    try {
        if (ids.length === 0) return;
        const placeholders = ids.map(() => '?').join(',');
        await db.runAsync(`DELETE FROM transactions WHERE id IN (${placeholders})`, ids);
    } catch (error) {
        console.error('Error deleting multiple transactions:', error);
        throw error;
    }
};

export const saveSetting = async (key: string, value: string): Promise<void> => {
    try {
        await db.runAsync(
            'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
            [key, value]
        );
    } catch (error) {
        console.error('Error saving setting:', error);
    }
};

export const getSetting = async (key: string): Promise<string | null> => {
    try {
        const result = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [key]);
        return result ? result.value : null;
    } catch (error) {
        console.error('Error fetching setting:', error);
        return null;
    }
};

// Data Migration Helper (One-time use)
export const bulkImportTransactions = async (transactions: Transaction[]) => {
    if (transactions.length === 0) return;
    // Import all transactions - addTransaction uses INSERT OR REPLACE so duplicates are fine
    for (const t of transactions) {
        await addTransaction(t);
    }
    // Errors from addTransaction will propagate up automatically
}
