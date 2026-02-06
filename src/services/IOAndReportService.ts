import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as Print from 'expo-print';
import { Asset } from 'expo-asset';
import { Transaction } from '../types';
import { formatSmartNumber } from '../utils/formatCurrency';

// Embedded logo as base64 (100x100px)
const EMBEDDED_LOGO = 'data:image/png;base64,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';

// Helper function to load logo as base64 (with embedded fallback)
const getLogoBase64 = async (): Promise<string> => {
    try {
        const asset = Asset.fromModule(require('../../assets/icon.png'));
        await asset.downloadAsync();
        if (asset.localUri) {
            const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
                encoding: FileSystem.EncodingType.Base64
            });
            return `data:image/png;base64,${base64}`;
        }
    } catch (error) {
        console.error('Failed to load logo, using embedded fallback:', error);
    }
    return EMBEDDED_LOGO;  // Always return embedded logo as fallback
};

// Define Report Data Interface
export interface ReportData {
    period: string;
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    topCategories: { category: string; amount: number; percentage: number }[];
    transactions: Transaction[];
    currency: string;
}

export const exportTransactionsToJSON = async (transactions: Transaction[]) => {
    try {
        const timestamp = new Date().toISOString().split('T')[0];
        const fileName = `Monetra_Backup_${timestamp}.json`;
        const fileUri = (FileSystem.cacheDirectory || FileSystem.documentDirectory) + fileName;

        const data = JSON.stringify(transactions, null, 2);
        await FileSystem.writeAsStringAsync(fileUri, data, { encoding: FileSystem.EncodingType.UTF8 });

        await Sharing.shareAsync(fileUri, {
            mimeType: 'application/json',
            dialogTitle: 'Export Backup'
        });
    } catch (error) {
        console.error("Export Error", error);
        throw new Error("Failed to export transactions");
    }
};

export const exportTransactionsToCSV = async (transactions: Transaction[]) => {
    try {
        const header = "Date,Type,Category,Title,Amount,Note\n";
        const rows = transactions.map(t =>
            `"${t.date}","${t.type}","${t.category}","${t.title.replace(/"/g, '""')}",${t.amount},"${(t.note || "").replace(/"/g, '""')}"`
        ).join("\n");

        const csvContent = header + rows;
        const timestamp = new Date().toISOString().split('T')[0];
        const fileName = `Monetra_Export_${timestamp}.csv`;
        const fileUri = (FileSystem.cacheDirectory || FileSystem.documentDirectory) + fileName;

        await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });

        await Sharing.shareAsync(fileUri, {
            mimeType: 'text/csv',
            dialogTitle: 'Export CSV'
        });
    } catch (error) {
        console.error("CSV Export Error", error);
        throw new Error("Failed to export CSV");
    }
};

export const importTransactionsFromJSON = async (): Promise<Transaction[] | null> => {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'application/json',
            copyToCacheDirectory: true
        });

        if (result.canceled) return null;

        const asset = result.assets[0];
        const content = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.UTF8 });
        const parsed = JSON.parse(content);

        if (!Array.isArray(parsed)) {
            throw new Error("Invalid format: Root must be an array");
        }

        // Basic validation - use typeof for amount to allow 0 values
        const isValid = parsed.every(t => t.id && typeof t.amount === 'number' && t.type && t.date);
        if (!isValid) {
            throw new Error("Invalid transaction data structure");
        }

        return parsed as Transaction[];
    } catch (error) {
        console.error("Import Error", error);
        throw error; // Let caller handle alert
    }
};

export const importTransactionsFromCSV = async (): Promise<Transaction[] | null> => {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: ['text/csv', 'text/comma-separated-values', '*/*'],
            copyToCacheDirectory: true
        });

        if (result.canceled) return null;

        const asset = result.assets[0];
        const content = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.UTF8 });

        // Handle both Windows (\r\n) and Unix (\n) line endings
        const normalizedContent = content.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        const lines = normalizedContent.split('\n');
        if (lines.length < 2) {
            throw new Error("CSV file is empty or has no data rows");
        }

        // Skip header row, parse data rows
        const transactions: Transaction[] = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Parse CSV - handle quoted fields
            const fields = line.match(/("[^"]*"|[^,]+)/g)?.map(f => f.replace(/^"|"$/g, '').replace(/""/g, '"')) || [];

            if (fields.length >= 5) {
                const [date, type, category, title, amountStr, note] = fields;
                const amount = parseFloat(amountStr) || 0;

                if (date && type && category && title) {
                    transactions.push({
                        id: `csv_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 8)}`,
                        date: date,
                        type: type.toLowerCase() as 'income' | 'expense',
                        category: category,
                        title: title,
                        amount: amount,
                        note: note || ''
                    });
                }
            }
        }

        if (transactions.length === 0) {
            throw new Error("No valid transactions found in CSV");
        }

        return transactions;
    } catch (error) {
        console.error("CSV Import Error", error);
        throw error;
    }
};

export const generateFinancialReportPDF = async (data: ReportData) => {
    try {
        // Load logo as base64
        const logoBase64 = await getLogoBase64();

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Monetra Financial Report</title>
            <style>
                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
                .header-container { display: flex; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #0ea5e9; padding-bottom: 15px; }
                .logo { width: 60px; height: 60px; margin-right: 15px; object-fit: contain; }
                .logo-placeholder { width: 60px; height: 60px; background: linear-gradient(135deg, #0ea5e9, #6366f1); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 28px; font-weight: bold; margin-right: 15px; }
                h1 { color: #0f172a; margin: 0; font-size: 24px; }
                .subtitle { color: #64748b; font-size: 14px; margin-top: 4px; }
                h2 { color: #1e293b; margin-top: 30px; }
                .summary-box { background: linear-gradient(135deg, #f0f9ff, #e0f2fe); padding: 20px; border-radius: 12px; margin-bottom: 30px; border-left: 5px solid #0ea5e9; }
                .summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 16px; }
                .amount-inc { color: #22c55e; font-weight: bold; }
                .amount-exp { color: #ef4444; font-weight: bold; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background: #0f172a; color: #fff; padding: 12px; text-align: left; }
                td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
                tr:nth-child(even) { background: #f8fafc; }
                .footer { margin-top: 50px; font-size: 12px; text-align: center; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            </style>
        </head>
        <body>
            <div class="header-container">
                ${logoBase64 ? `<img src="${logoBase64}" class="logo" alt="Monetra Logo" />` : '<div class="logo-placeholder">M</div>'}
                <div>
                    <h1>Monetra Financial Report</h1>
                    <div class="subtitle">Personal Finance Tracker</div>
                </div>
            </div>
            <p><strong>Period:</strong> ${data.period}</p>
            <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>

            <div class="summary-box">
                <h2>Summary</h2>
                <div class="summary-row"><span>Total Income:</span> <span class="amount-inc">+ ${formatSmartNumber(data.totalIncome, data.currency)}</span></div>
                <div class="summary-row"><span>Total Expense:</span> <span class="amount-exp">- ${formatSmartNumber(data.totalExpense, data.currency)}</span></div>
                <div class="summary-row" style="margin-top: 10px; border-top: 1px solid #ddd; pt: 10px;">
                    <strong>Net Balance:</strong> 
                    <strong style="${data.netBalance >= 0 ? 'color: #27ae60' : 'color: #c0392b'}">
                        ${data.netBalance >= 0 ? '+' : ''} ${formatSmartNumber(data.netBalance, data.currency)}
                    </strong>
                </div>
            </div>

            <h2>Top Expenses by Category</h2>
            <ul>
                ${data.topCategories.map(c => `
                    <li><strong>${c.category}:</strong> ${formatSmartNumber(c.amount, data.currency)} (${c.percentage}%)</li>
                `).join('')}
            </ul>

            <h2>Transaction History</h2>
            <table>
                <thead>
                    <tr>
                        <th width="20%">Date</th>
                        <th width="30%">Category</th>
                        <th width="30%">Title</th>
                        <th width="20%" style="text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.transactions.map(t => `
                        <tr>
                            <td>${new Date(t.date).toLocaleDateString()}</td>
                            <td>${t.category}</td>
                            <td>${t.title}</td>
                            <td style="text-align: right; ${t.type === 'income' ? 'color: #27ae60' : 'color: #c0392b'}">
                                ${t.type === 'income' ? '+' : '-'} ${formatSmartNumber(t.amount, data.currency)}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="footer">
                Generated by Monetra
            </div>
        </body>
        </html>
        `;

        const { uri } = await Print.printToFileAsync({ html: htmlContent });

        const timestamp = new Date().toISOString().split('T')[0];
        const fileName = `Financial_Report_${data.period.replace(/\s/g, '_')}_${timestamp}.pdf`;
        const newUri = (FileSystem.cacheDirectory || FileSystem.documentDirectory) + fileName;

        await FileSystem.copyAsync({
            from: uri,
            to: newUri
        });
        await FileSystem.deleteAsync(uri);

        await Sharing.shareAsync(newUri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: 'Share Financial Report' });
    } catch (error) {
        console.error("PDF Generation Error", error);
        throw new Error("Failed to generate PDF");
    }
};
