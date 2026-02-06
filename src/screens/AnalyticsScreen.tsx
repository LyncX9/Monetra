import React, { useState, useCallback, useMemo } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, Modal, Alert } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useServices } from "../contexts/ServiceContext";
import { useTheme } from "../contexts/ThemeContext";
import { GradientBackground } from "../components/ui/GradientBackground";
import { GlassCard } from "../components/ui/GlassCard";
import DonutChart from "../components/DonutChart";
import TransactionListItem from "../components/TransactionListItem";
import { formatSmartNumber } from "../utils/formatCurrency";
import {
    exportTransactionsToJSON,
    exportTransactionsToCSV,
    importTransactionsFromJSON,
    importTransactionsFromCSV,
    generateFinancialReportPDF,
    ReportData
} from "../services/IOAndReportService";

const CATEGORY_COLORS: Record<string, string> = {
    Food: '#FF6B6B',
    Transport: '#00C6FF',
    Shopping: '#FF69B4',
    Bills: '#4ECDC4',
    Entertainment: '#FF4757',
    Health: '#95E1D3',
    Education: '#DDA0DD',
    Salary: '#22C55E',
    Income: '#22C55E',
    Other: '#A0AEC0',
    General: '#64748B',
};

const CATEGORIES = ["All", "Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Education", "Salary", "Other"];
const TYPES = ["All", "expense", "income"];
const MONTHS_FILTER = ["All Time", "This Month", "Last Month", "Last 3 Months", "Last 6 Months", "This Year"];

const AnalyticsScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const { transactionManager, settingsManager, currencyService } = useServices();
    const { theme, isDark } = useTheme();

    const [totalSpend, setTotalSpend] = useState(0);
    const [percentageChange, setPercentageChange] = useState(0);
    const [categoryData, setCategoryData] = useState<{ category: string; total: number; color: string; percentage: number }[]>([]);
    const [allTransactions, setAllTransactions] = useState<any[]>([]);
    const [currency, setCurrency] = useState("IDR");
    const [selectedPeriod, setSelectedPeriod] = useState("This Month");
    const [showPeriodModal, setShowPeriodModal] = useState(false);

    // Filter states
    const [filterType, setFilterType] = useState("All");
    const [filterCategory, setFilterCategory] = useState("All");
    const [filterMonth, setFilterMonth] = useState("All Time");
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [activeFilterTab, setActiveFilterTab] = useState<"type" | "category" | "month">("type");

    // Selection mode states
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Tools UI states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    // Status Modal State
    const [statusModal, setStatusModal] = useState<{ visible: boolean; type: 'success' | 'error'; message: string; title: string }>({
        visible: false,
        type: 'success',
        message: '',
        title: ''
    });

    // Sharing Lock
    const [isSharing, setIsSharing] = useState(false);

    // Report Period Modal
    const [showReportPeriodModal, setShowReportPeriodModal] = useState(false);
    const REPORT_PERIODS = [
        { label: 'Hari Ini', value: 'daily', days: 1 },
        { label: 'Minggu Ini', value: 'weekly', days: 7 },
        { label: 'Bulan Ini', value: 'monthly', days: 30 },
        { label: 'Tahun Ini', value: 'annual', days: 365 },
        { label: 'Semua Waktu', value: 'all', days: 0 },
    ];

    const loadAnalytics = async () => {
        await transactionManager.load();
        const s = await settingsManager.getSettings();
        const cur = s?.currency ?? "IDR";
        setCurrency(cur);

        const exp = transactionManager.getTotalExpense(currencyService, cur);
        setTotalSpend(exp);
        setPercentageChange(12);

        const categories = transactionManager.getCategorySummary(currencyService, cur);
        const total = categories.reduce((sum, c) => sum + c.total, 0);

        const formattedCategories = categories.map(c => ({
            category: c.category,
            total: c.total,
            color: CATEGORY_COLORS[c.category] || CATEGORY_COLORS.Other,
            percentage: total > 0 ? Math.round((c.total / total) * 100) : 0,
        })).slice(0, 4);

        setCategoryData(formattedCategories);

        const transactions = transactionManager.getAll();
        setAllTransactions(transactions);
    };

    useFocusEffect(
        useCallback(() => {
            loadAnalytics();
        }, [])
    );

    // Filter transactions
    const filteredTransactions = useMemo(() => {
        let filtered = [...allTransactions];

        // Filter by type
        if (filterType !== "All") {
            filtered = filtered.filter(tx => tx.type === filterType);
        }

        // Filter by category
        if (filterCategory !== "All") {
            filtered = filtered.filter(tx => tx.category === filterCategory);
        }

        // Filter by month
        if (filterMonth !== "All Time") {
            const now = new Date();
            const txDate = (dateStr: string) => new Date(dateStr);

            filtered = filtered.filter(tx => {
                const date = txDate(tx.date);
                const diffMonths = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());

                switch (filterMonth) {
                    case "This Month":
                        return diffMonths === 0;
                    case "Last Month":
                        return diffMonths === 1;
                    case "Last 3 Months":
                        return diffMonths < 3;
                    case "Last 6 Months":
                        return diffMonths < 6;
                    case "This Year":
                        return date.getFullYear() === now.getFullYear();
                    default:
                        return true;
                }
            });
        }

        return filtered;
    }, [allTransactions, filterType, filterCategory, filterMonth]);

    const activeFiltersCount = [filterType, filterCategory, filterMonth].filter(f => f !== "All" && f !== "All Time").length;

    const clearFilters = () => {
        setFilterType("All");
        setFilterCategory("All");
        setFilterMonth("All Time");
    };

    const toggleSelectionMode = () => {
        if (selectionMode) {
            setSelectedIds(new Set());
        }
        setSelectionMode(!selectionMode);
    };

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const selectAll = () => {
        const allIds = new Set(filteredTransactions.map(tx => tx.id));
        setSelectedIds(allIds);
    };

    const deleteSelected = () => {
        if (selectedIds.size === 0) return;
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        setShowDeleteModal(false);
        const ok = await transactionManager.deleteMultiple(Array.from(selectedIds));
        if (ok) {
            setSelectedIds(new Set());
            setSelectionMode(false);
            loadAnalytics();
        } else {
            setStatusModal({ visible: true, type: 'error', title: 'Error', message: 'Failed to delete transactions' });
        }
    };

    const handleExportJSON = async () => {
        setShowExportModal(false);
        try {
            await exportTransactionsToJSON(allTransactions);
        } catch (e) {
            setStatusModal({ visible: true, type: 'error', title: 'Export Failed', message: 'Failed to export JSON backup.' });
        }
    };

    const handleExportCSV = async () => {
        setShowExportModal(false);
        try {
            await exportTransactionsToCSV(allTransactions);
        } catch (e) {
            setStatusModal({ visible: true, type: 'error', title: 'Export Failed', message: 'Failed to export CSV file.' });
        }
    };

    const handleImportFile = async () => {
        setShowImportModal(false);
        try {
            const transactions = await importTransactionsFromJSON();
            if (transactions) {
                const ok = await transactionManager.importTransactions(transactions);
                if (ok) {
                    setStatusModal({ visible: true, type: 'success', title: 'Import Successful', message: `Successfully imported ${transactions.length} transactions.` });
                    loadAnalytics();
                } else {
                    setStatusModal({ visible: true, type: 'error', title: 'Import Failed', message: 'Failed to save imported transactions.' });
                }
            }
        } catch (e) {
            setStatusModal({ visible: true, type: 'error', title: 'Import Error', message: 'Invalid file format or user cancelled.' });
        }
    };

    const handleImportCSV = async () => {
        setShowImportModal(false);
        try {
            const transactions = await importTransactionsFromCSV();
            if (transactions) {
                const ok = await transactionManager.importTransactions(transactions);
                if (ok) {
                    setStatusModal({ visible: true, type: 'success', title: 'CSV Import Successful', message: `Successfully imported ${transactions.length} transactions from CSV.` });
                    loadAnalytics();
                } else {
                    setStatusModal({ visible: true, type: 'error', title: 'Import Failed', message: 'Failed to save imported transactions.' });
                }
            }
        } catch (e: any) {
            setStatusModal({ visible: true, type: 'error', title: 'CSV Import Error', message: e?.message || 'Invalid CSV file format or user cancelled.' });
        }
    };

    const handleDownloadReport = async (periodDays: number = 0, periodLabel: string = 'All Time') => {
        if (isSharing) return;
        setIsSharing(true);
        setShowReportPeriodModal(false);
        try {
            // Filter transactions by period
            let reportTransactions = filteredTransactions;
            if (periodDays > 0) {
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - periodDays);
                reportTransactions = filteredTransactions.filter(t => new Date(t.date) >= cutoffDate);
            }

            // Re-calculate summary based on period-filtered transactions
            const filteredIncome = reportTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const filteredExpense = reportTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

            const catMap: Record<string, number> = {};
            reportTransactions.filter(t => t.type === 'expense').forEach(t => {
                catMap[t.category] = (catMap[t.category] || 0) + t.amount;
            });
            const filteredCategories = Object.entries(catMap)
                .map(([c, amount]) => ({ category: c, amount, percentage: 0 }))
                .sort((a, b) => b.amount - a.amount);

            const filteredTotalExp = filteredCategories.reduce((sum, c) => sum + c.amount, 0);
            filteredCategories.forEach(c => c.percentage = filteredTotalExp > 0 ? Math.round((c.amount / filteredTotalExp) * 100) : 0);

            const finalReportData: ReportData = {
                period: periodLabel,
                totalIncome: filteredIncome,
                totalExpense: filteredExpense,
                netBalance: filteredIncome - filteredExpense,
                currency,
                topCategories: filteredCategories.slice(0, 5),
                transactions: reportTransactions
            };

            await generateFinancialReportPDF(finalReportData);
        } catch (e) {
            setStatusModal({ visible: true, type: 'error', title: 'Report Failed', message: 'Failed to generate or share the report.' });
        } finally {
            setTimeout(() => setIsSharing(false), 1000); // Debounce
        }
    };




    const renderFilterContent = () => {
        switch (activeFilterTab) {
            case "type":
                return TYPES.map(t => (
                    <Pressable
                        key={t}
                        style={[styles.filterOption, filterType === t && { backgroundColor: theme.colors.primary + '30' }]}
                        onPress={() => setFilterType(t)}
                    >
                        <Text style={[styles.filterOptionText, { color: filterType === t ? theme.colors.primary : theme.colors.textPrimary }]}>
                            {t === "All" ? "All Types" : t.charAt(0).toUpperCase() + t.slice(1)}
                        </Text>
                        {filterType === t && <Ionicons name="checkmark" size={20} color={theme.colors.primary} />}
                    </Pressable>
                ));
            case "category":
                return CATEGORIES.map(c => (
                    <Pressable
                        key={c}
                        style={[styles.filterOption, filterCategory === c && { backgroundColor: theme.colors.primary + '30' }]}
                        onPress={() => setFilterCategory(c)}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            {c !== "All" && <View style={[styles.categoryDot, { backgroundColor: CATEGORY_COLORS[c] || CATEGORY_COLORS.Other }]} />}
                            <Text style={[styles.filterOptionText, { color: filterCategory === c ? theme.colors.primary : theme.colors.textPrimary }]}>
                                {c === "All" ? "All Categories" : c}
                            </Text>
                        </View>
                        {filterCategory === c && <Ionicons name="checkmark" size={20} color={theme.colors.primary} />}
                    </Pressable>
                ));
            case "month":
                return MONTHS_FILTER.map(m => (
                    <Pressable
                        key={m}
                        style={[styles.filterOption, filterMonth === m && { backgroundColor: theme.colors.primary + '30' }]}
                        onPress={() => setFilterMonth(m)}
                    >
                        <Text style={[styles.filterOptionText, { color: filterMonth === m ? theme.colors.primary : theme.colors.textPrimary }]}>
                            {m}
                        </Text>
                        {filterMonth === m && <Ionicons name="checkmark" size={20} color={theme.colors.primary} />}
                    </Pressable>
                ));
        }
    };

    return (
        <GradientBackground>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>

                {/* Header */}
                <View style={styles.header}>
                    <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
                    </Pressable>
                    <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Analytics</Text>
                    <Pressable
                        style={[styles.periodBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}
                        onPress={() => setShowPeriodModal(true)}
                    >
                        <Text style={[styles.periodText, { color: theme.colors.textPrimary }]}>{selectedPeriod}</Text>
                        <Ionicons name="chevron-down" size={14} color={theme.colors.textMuted} />
                    </Pressable>
                </View>

                {/* Donut Chart */}
                <GlassCard style={styles.chartCard}>
                    <DonutChart
                        data={categoryData}
                        size={220}
                        strokeWidth={22}
                        centerLabel="Total Spend"
                        centerValue={formatSmartNumber(totalSpend, currency)}
                        percentageChange={percentageChange}
                    />

                    {/* Legend */}
                    <View style={styles.legend}>
                        <View style={styles.legendRow}>
                            {categoryData.slice(0, 2).map((item) => (
                                <View key={item.category} style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                                    <Text style={[styles.legendLabel, { color: theme.colors.textMuted }]}>{item.category}</Text>
                                    <Text style={[styles.legendValue, { color: theme.colors.textPrimary }]}>{item.percentage}%</Text>
                                </View>
                            ))}
                        </View>
                        <View style={styles.legendRow}>
                            {categoryData.slice(2, 4).map((item) => (
                                <View key={item.category} style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                                    <Text style={[styles.legendLabel, { color: theme.colors.textMuted }]}>{item.category}</Text>
                                    <Text style={[styles.legendValue, { color: theme.colors.textPrimary }]}>{item.percentage}%</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </GlassCard>

                <View style={styles.toolsRow}>
                    <Pressable style={[styles.toolBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]} onPress={() => setShowExportModal(true)}>
                        <Ionicons name="download-outline" size={20} color={theme.colors.primary} />
                        <Text style={[styles.toolBtnText, { color: theme.colors.textPrimary }]}>Export</Text>
                    </Pressable>
                    <Pressable style={[styles.toolBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]} onPress={() => setShowImportModal(true)}>
                        <Ionicons name="cloud-upload-outline" size={20} color={theme.colors.primary} />
                        <Text style={[styles.toolBtnText, { color: theme.colors.textPrimary }]}>Import</Text>
                    </Pressable>
                    <Pressable style={[styles.toolBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]} onPress={() => setShowReportPeriodModal(true)}>
                        <Ionicons name="document-text-outline" size={20} color={theme.colors.primary} />
                        <Text style={[styles.toolBtnText, { color: theme.colors.textPrimary }]}>Report</Text>
                    </Pressable>
                </View>

                {/* History Transaction Header with Filter */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>History Transaction</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        {selectionMode ? (
                            <>
                                <Pressable
                                    style={[styles.filterBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}
                                    onPress={selectAll}
                                >
                                    <Ionicons name="checkbox-outline" size={16} color={theme.colors.primary} />
                                    <Text style={[styles.filterBtnText, { color: theme.colors.primary }]}>All</Text>
                                </Pressable>
                                <Pressable
                                    style={[styles.filterBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}
                                    onPress={toggleSelectionMode}
                                >
                                    <Ionicons name="close" size={16} color={theme.colors.danger} />
                                    <Text style={[styles.filterBtnText, { color: theme.colors.danger }]}>Cancel</Text>
                                </Pressable>
                            </>
                        ) : (
                            <>
                                <Pressable
                                    style={[styles.filterBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}
                                    onPress={toggleSelectionMode}
                                >
                                    <Ionicons name="checkbox-outline" size={16} color={theme.colors.textMuted} />
                                    <Text style={[styles.filterBtnText, { color: theme.colors.textMuted }]}>Select</Text>
                                </Pressable>
                                <Pressable
                                    style={[styles.filterBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}
                                    onPress={() => setShowFilterModal(true)}
                                >
                                    <Ionicons name="filter" size={16} color={theme.colors.primary} />
                                    <Text style={[styles.filterBtnText, { color: theme.colors.primary }]}>Filter</Text>
                                    {activeFiltersCount > 0 && (
                                        <View style={[styles.filterBadge, { backgroundColor: theme.colors.primary }]}>
                                            <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
                                        </View>
                                    )}
                                </Pressable>
                            </>
                        )}
                    </View>
                </View>

                {/* Selection Mode Delete Bar */}
                {selectionMode && selectedIds.size > 0 && (
                    <Pressable
                        style={[styles.deleteSelectedBar, { backgroundColor: theme.colors.danger }]}
                        onPress={deleteSelected}
                    >
                        <Ionicons name="trash" size={20} color="#FFF" />
                        <Text style={styles.deleteSelectedText}>
                            Delete {selectedIds.size} selected
                        </Text>
                    </Pressable>
                )}

                {/* Active Filters Display */}
                {activeFiltersCount > 0 && (
                    <View style={styles.activeFiltersRow}>
                        {filterType !== "All" && (
                            <View style={[styles.filterChip, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}>
                                <Text style={[styles.filterChipText, { color: theme.colors.textPrimary }]}>{filterType}</Text>
                                <Pressable onPress={() => setFilterType("All")}>
                                    <Ionicons name="close-circle" size={16} color={theme.colors.textMuted} />
                                </Pressable>
                            </View>
                        )}
                        {filterCategory !== "All" && (
                            <View style={[styles.filterChip, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}>
                                <Text style={[styles.filterChipText, { color: theme.colors.textPrimary }]}>{filterCategory}</Text>
                                <Pressable onPress={() => setFilterCategory("All")}>
                                    <Ionicons name="close-circle" size={16} color={theme.colors.textMuted} />
                                </Pressable>
                            </View>
                        )}
                        {filterMonth !== "All Time" && (
                            <View style={[styles.filterChip, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}>
                                <Text style={[styles.filterChipText, { color: theme.colors.textPrimary }]}>{filterMonth}</Text>
                                <Pressable onPress={() => setFilterMonth("All Time")}>
                                    <Ionicons name="close-circle" size={16} color={theme.colors.textMuted} />
                                </Pressable>
                            </View>
                        )}
                        <Pressable onPress={clearFilters}>
                            <Text style={[styles.clearAllText, { color: theme.colors.danger }]}>Clear All</Text>
                        </Pressable>
                    </View>
                )}

                {/* Transaction Count */}
                <Text style={[styles.transactionCount, { color: theme.colors.textMuted }]}>
                    {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
                </Text>

                {filteredTransactions.length === 0 ? (
                    <GlassCard style={styles.emptyCard}>
                        <Ionicons name="receipt-outline" size={48} color={theme.colors.textMuted} />
                        <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>No transactions found</Text>
                    </GlassCard>
                ) : (
                    filteredTransactions.map((tx: any) => (
                        <Pressable
                            key={tx.id}
                            onPress={() => selectionMode ? toggleSelection(tx.id) : navigation.navigate('TransactionDetail', { id: tx.id })}
                            onLongPress={() => {
                                if (!selectionMode) {
                                    setSelectionMode(true);
                                    setSelectedIds(new Set([tx.id]));
                                }
                            }}
                        >
                            <View style={[
                                styles.selectableItem,
                                selectionMode && selectedIds.has(tx.id) && { backgroundColor: theme.colors.primary + '20' }
                            ]}>
                                {selectionMode && (
                                    <View style={styles.checkboxContainer}>
                                        <View style={[
                                            styles.checkbox,
                                            { borderColor: theme.colors.primary },
                                            selectedIds.has(tx.id) && { backgroundColor: theme.colors.primary }
                                        ]}>
                                            {selectedIds.has(tx.id) && (
                                                <Ionicons name="checkmark" size={14} color="#FFF" />
                                            )}
                                        </View>
                                    </View>
                                )}
                                <View style={{ flex: 1 }}>
                                    <TransactionListItem item={tx} />
                                </View>
                            </View>
                        </Pressable>
                    ))
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Period Modal */}
            <Modal
                visible={showPeriodModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowPeriodModal(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setShowPeriodModal(false)}>
                    <GlassCard style={styles.modalContent}>
                        <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Select Period</Text>
                        {MONTHS_FILTER.slice(1).map((period) => (
                            <Pressable
                                key={period}
                                style={[
                                    styles.periodOption,
                                    selectedPeriod === period && { backgroundColor: theme.colors.primary + '30' }
                                ]}
                                onPress={() => {
                                    setSelectedPeriod(period);
                                    setShowPeriodModal(false);
                                }}
                            >
                                <Text style={[
                                    styles.periodOptionText,
                                    { color: selectedPeriod === period ? theme.colors.primary : theme.colors.textPrimary }
                                ]}>
                                    {period}
                                </Text>
                            </Pressable>
                        ))}
                    </GlassCard>
                </Pressable>
            </Modal>

            {/* Filter Modal */}
            <Modal
                visible={showFilterModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowFilterModal(false)}
            >
                <View style={[styles.filterModalContainer, { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }]}>
                    <View style={[styles.filterModalContent, { backgroundColor: isDark ? '#1B2838' : '#FFFFFF' }]}>
                        {/* Filter Modal Header */}
                        <View style={styles.filterModalHeader}>
                            <Text style={[styles.filterModalTitle, { color: theme.colors.textPrimary }]}>Filter Transactions</Text>
                            <Pressable onPress={() => setShowFilterModal(false)}>
                                <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                            </Pressable>
                        </View>

                        {/* Filter Tabs */}
                        <View style={[styles.filterTabs, { borderColor: theme.colors.border }]}>
                            {(["type", "category", "month"] as const).map(tab => (
                                <Pressable
                                    key={tab}
                                    style={[
                                        styles.filterTab,
                                        activeFilterTab === tab && { borderBottomColor: theme.colors.primary, borderBottomWidth: 2 }
                                    ]}
                                    onPress={() => setActiveFilterTab(tab)}
                                >
                                    <Text style={[
                                        styles.filterTabText,
                                        { color: activeFilterTab === tab ? theme.colors.primary : theme.colors.textMuted }
                                    ]}>
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>

                        {/* Filter Options */}
                        <ScrollView style={styles.filterOptionsContainer}>
                            {renderFilterContent()}
                        </ScrollView>

                        {/* Apply Button */}
                        <Pressable
                            style={[styles.applyBtn, { backgroundColor: theme.colors.primary }]}
                            onPress={() => setShowFilterModal(false)}
                        >
                            <Text style={styles.applyBtnText}>Apply Filters</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal transparent visible={showDeleteModal} animationType="fade" onRequestClose={() => setShowDeleteModal(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setShowDeleteModal(false)}>
                    <GlassCard style={styles.confirmModal}>
                        <Ionicons name="trash-outline" size={48} color={theme.colors.danger} style={{ marginBottom: 16, alignSelf: 'center' }} />
                        <Text style={[styles.confirmTitle, { color: theme.colors.textPrimary }]}>Delete Transactions?</Text>
                        <Text style={[styles.confirmDesc, { color: theme.colors.textMuted }]}>
                            Are you sure you want to delete {selectedIds.size} transactions? This action cannot be undone.
                        </Text>
                        <View style={styles.confirmActions}>
                            <Pressable style={[styles.confirmBtn, { backgroundColor: theme.colors.surface }]} onPress={() => setShowDeleteModal(false)}>
                                <Text style={[styles.confirmBtnText, { color: theme.colors.danger }]}>Cancel</Text>
                            </Pressable>
                            <Pressable style={[styles.confirmBtn, { backgroundColor: theme.colors.danger }]} onPress={confirmDelete}>
                                <Text style={[styles.confirmBtnText, { color: '#FFF' }]}>Delete</Text>
                            </Pressable>
                        </View>
                    </GlassCard>
                </Pressable>
            </Modal>

            {/* Export Modal */}
            <Modal transparent visible={showExportModal} animationType="fade" onRequestClose={() => setShowExportModal(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setShowExportModal(false)}>
                    <GlassCard style={styles.confirmModal}>
                        <Ionicons name="download-outline" size={48} color={theme.colors.primary} style={{ marginBottom: 16, alignSelf: 'center' }} />
                        <Text style={[styles.confirmTitle, { color: theme.colors.textPrimary }]}>Export Data</Text>
                        <Text style={[styles.confirmDesc, { color: theme.colors.textMuted }]}>
                            Choose a format to export your transaction history.
                        </Text>
                        <View style={styles.verticalActions}>
                            <Pressable style={[styles.actionBtn, { backgroundColor: theme.colors.primary }]} onPress={handleExportJSON}>
                                <Ionicons name="code-slash-outline" size={20} color="#FFF" />
                                <Text style={styles.actionBtnText}>Export JSON (Backup)</Text>
                            </Pressable>
                            <Pressable style={[styles.actionBtn, { backgroundColor: theme.colors.success }]} onPress={handleExportCSV}>
                                <Ionicons name="grid-outline" size={20} color="#FFF" />
                                <Text style={styles.actionBtnText}>Export CSV (Excel)</Text>
                            </Pressable>
                            <Pressable style={[styles.actionBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.danger }]} onPress={() => setShowExportModal(false)}>
                                <Text style={[styles.actionBtnText, { color: theme.colors.danger }]}>Cancel</Text>
                            </Pressable>
                        </View>
                    </GlassCard>
                </Pressable>
            </Modal>

            {/* Import Modal */}
            <Modal transparent visible={showImportModal} animationType="fade" onRequestClose={() => setShowImportModal(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setShowImportModal(false)}>
                    <GlassCard style={styles.confirmModal}>
                        <Ionicons name="cloud-upload-outline" size={48} color={theme.colors.success} style={{ marginBottom: 16, alignSelf: 'center' }} />
                        <Text style={[styles.confirmTitle, { color: theme.colors.textPrimary }]}>Import Data</Text>
                        <Text style={[styles.confirmDesc, { color: theme.colors.textMuted }]}>
                            Import transactions from JSON backup or CSV file. This will merge with existing data.
                        </Text>
                        <View style={styles.verticalActions}>
                            <Pressable style={[styles.actionBtn, { backgroundColor: theme.colors.primary }]} onPress={handleImportFile}>
                                <Ionicons name="code-slash-outline" size={20} color="#FFF" />
                                <Text style={styles.actionBtnText}>Import JSON Backup</Text>
                            </Pressable>
                            <Pressable style={[styles.actionBtn, { backgroundColor: theme.colors.success }]} onPress={handleImportCSV}>
                                <Ionicons name="grid-outline" size={20} color="#FFF" />
                                <Text style={styles.actionBtnText}>Import CSV File</Text>
                            </Pressable>
                            <Pressable style={[styles.actionBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.danger }]} onPress={() => setShowImportModal(false)}>
                                <Text style={[styles.actionBtnText, { color: theme.colors.danger }]}>Cancel</Text>
                            </Pressable>
                        </View>
                    </GlassCard>
                </Pressable>
            </Modal>

            {/* Status Modal (Success/Error) */}
            <Modal transparent visible={statusModal.visible} animationType="fade" onRequestClose={() => setStatusModal(prev => ({ ...prev, visible: false }))}>
                <Pressable style={styles.modalOverlay} onPress={() => setStatusModal(prev => ({ ...prev, visible: false }))}>
                    <GlassCard style={styles.confirmModal}>
                        <Ionicons
                            name={statusModal.type === 'success' ? "checkmark-circle-outline" : "alert-circle-outline"}
                            size={48}
                            color={statusModal.type === 'success' ? theme.colors.success : theme.colors.danger}
                            style={{ marginBottom: 16, alignSelf: 'center' }}
                        />
                        <Text style={[styles.confirmTitle, { color: theme.colors.textPrimary }]}>{statusModal.title}</Text>
                        <Text style={[styles.confirmDesc, { color: theme.colors.textMuted }]}>
                            {statusModal.message}
                        </Text>
                        <Pressable
                            style={[styles.confirmBtn, { backgroundColor: theme.colors.surface, width: '100%', flex: 0 }]}
                            onPress={() => setStatusModal(prev => ({ ...prev, visible: false }))}
                        >
                            <Text style={[styles.confirmBtnText, { color: theme.colors.textPrimary }]}>OK</Text>
                        </Pressable>
                    </GlassCard>
                </Pressable>
            </Modal>

            {/* Report Period Selection Modal */}
            <Modal transparent visible={showReportPeriodModal} animationType="fade" onRequestClose={() => setShowReportPeriodModal(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setShowReportPeriodModal(false)}>
                    <Pressable onPress={(e) => e.stopPropagation()}>
                        <GlassCard style={styles.confirmModal}>
                            <Ionicons name="calendar-outline" size={40} color={theme.colors.primary} style={{ marginBottom: 12, alignSelf: 'center' }} />
                            <Text style={[styles.confirmTitle, { color: theme.colors.textPrimary }]}>Pilih Periode Report</Text>
                            <Text style={[styles.confirmDesc, { color: theme.colors.textMuted, marginBottom: 16 }]}>
                                Filter transaksi berdasarkan periode waktu
                            </Text>
                            <View style={styles.verticalActions}>
                                {REPORT_PERIODS.map((period) => (
                                    <Pressable
                                        key={period.value}
                                        style={[styles.actionBtn, { backgroundColor: theme.colors.primary }]}
                                        onPress={() => handleDownloadReport(period.days, period.label)}
                                    >
                                        <Text style={styles.actionBtnText}>{period.label}</Text>
                                    </Pressable>
                                ))}
                                <Pressable
                                    style={[styles.actionBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.danger }]}
                                    onPress={() => setShowReportPeriodModal(false)}
                                >
                                    <Text style={[styles.actionBtnText, { color: theme.colors.danger }]}>Batal</Text>
                                </Pressable>
                            </View>
                        </GlassCard>
                    </Pressable>
                </Pressable>
            </Modal>
        </GradientBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    backBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    periodBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    periodText: {
        fontSize: 13,
        fontWeight: '600',
    },
    chartCard: {
        alignItems: 'center',
        paddingVertical: 32,
        marginBottom: 24,
    },
    legend: {
        marginTop: 24,
        width: '100%',
        gap: 12,
    },
    legendRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        minWidth: 120,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendLabel: {
        fontSize: 13,
        fontWeight: '500',
    },
    legendValue: {
        fontSize: 13,
        fontWeight: '700',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    filterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    filterBtnText: {
        fontSize: 13,
        fontWeight: '600',
    },
    filterBadge: {
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterBadgeText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '700',
    },
    activeFiltersRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
    },
    filterChipText: {
        fontSize: 12,
        fontWeight: '500',
    },
    clearAllText: {
        fontSize: 12,
        fontWeight: '600',
    },
    transactionCount: {
        fontSize: 13,
        marginBottom: 12,
    },
    emptyCard: {
        paddingVertical: 48,
        alignItems: 'center',
        gap: 12,
    },
    emptyText: {
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        width: '100%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
        textAlign: 'center',
    },
    periodOption: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    periodOptionText: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    filterModalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    filterModalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        paddingBottom: 32,
        maxHeight: '80%',
    },
    filterModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    filterModalTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    filterTabs: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        marginBottom: 16,
    },
    filterTab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    filterTabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    filterOptionsContainer: {
        paddingHorizontal: 20,
        maxHeight: 300,
    },
    filterOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    filterOptionText: {
        fontSize: 15,
        fontWeight: '500',
    },
    categoryDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    applyBtn: {
        marginHorizontal: 20,
        marginTop: 16,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    applyBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    deleteSelectedBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        marginBottom: 12,
    },
    deleteSelectedText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '600',
    },
    selectableItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        marginBottom: 2,
    },
    checkboxContainer: {
        paddingLeft: 4,
        paddingRight: 8,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    toolsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    toolBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    toolBtnText: {
        fontSize: 14,
        fontWeight: '600',
    },
    confirmModal: {
        width: '90%',
        padding: 24,
        // alignItems: 'center', // Removed to allow full width buttons
    },
    confirmTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    confirmDesc: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    confirmActions: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    confirmBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    confirmBtnText: {
        fontSize: 15,
        fontWeight: '600',
    },
    verticalActions: {
        width: '100%',
        gap: 12,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    actionBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFF',
    },
});

export default AnalyticsScreen;
