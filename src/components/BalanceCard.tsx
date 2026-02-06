import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Modal, ScrollView } from "react-native";
import { useServices } from "../contexts/ServiceContext";
import { useTheme } from "../contexts/ThemeContext";
import { GlassCard } from "./ui/GlassCard";
import { formatSmartNumber, formatAdaptive, CURRENCY_SYMBOLS } from "../utils/formatCurrency";

type Props = {
  balance: number;
  income: number;
  expense: number;
  currency: string;
  onCurrencyChange?: () => void;
};

const currencyOptions = ["IDR", "USD", "EUR", "JPY", "GBP"];

const BalanceCard: React.FC<Props> = ({ balance, income, expense, currency, onCurrencyChange }) => {
  const { settingsManager, currencyService } = useServices();
  const { theme, isDark } = useTheme();
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [currentCurrency, setCurrentCurrency] = useState(currency);

  useEffect(() => {
    setCurrentCurrency(currency);
  }, [currency]);

  const handleCurrencyChange = async (newCurrency: string) => {
    if (newCurrency === currentCurrency) {
      setShowCurrencyModal(false);
      return;
    }
    await currencyService.loadRates(newCurrency);
    await settingsManager.update({ currency: newCurrency });
    setCurrentCurrency(newCurrency);
    setShowCurrencyModal(false);
    if (onCurrencyChange) onCurrencyChange();
  };

  const safeBalance = typeof balance === "number" && Number.isFinite(balance) ? balance : 0;
  const safeIncome = typeof income === "number" && Number.isFinite(income) ? income : 0;
  const safeExpense = typeof expense === "number" && Number.isFinite(expense) ? expense : 0;

  // Format with smart abbreviation
  const formattedBalance = formatSmartNumber(safeBalance, currentCurrency);
  const formattedIncome = formatAdaptive(safeIncome, currentCurrency, 10);
  const formattedExpense = formatAdaptive(safeExpense, currentCurrency, 10);

  // Get responsive font size based on length
  const getBalanceFontSize = () => {
    const len = formattedBalance.length;
    if (len <= 10) return 40;
    if (len <= 14) return 34;
    if (len <= 18) return 28;
    return 24;
  };

  const getStatFontSize = () => {
    const maxLen = Math.max(formattedIncome.length, formattedExpense.length);
    if (maxLen <= 10) return 18;
    if (maxLen <= 14) return 16;
    return 14;
  };

  return (
    <GlassCard style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.colors.textMuted }]}>Total Balance</Text>
        <Pressable onPress={() => setShowCurrencyModal(true)} style={[styles.currencyButton, { backgroundColor: theme.colors.primary }]}>
          <Text style={[styles.currencyText, { color: isDark ? '#000' : '#FFF' }]}>{currentCurrency}</Text>
        </Pressable>
      </View>

      <Text
        style={[styles.balance, { color: theme.colors.textPrimary, fontSize: getBalanceFontSize() }]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {formattedBalance}
      </Text>

      <View style={styles.row}>
        <GlassCard variant="inner" style={styles.statCard}>
          <View style={styles.statHeader}>
            <Text style={[styles.arrowIcon, { color: theme.colors.success }]}>↓</Text>
            <Text style={[styles.statLabel, { color: theme.colors.success }]}>Income</Text>
          </View>
          <Text
            style={[styles.statValue, { color: theme.colors.textPrimary, fontSize: getStatFontSize() }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formattedIncome}
          </Text>
        </GlassCard>

        <GlassCard variant="inner" style={styles.statCard}>
          <View style={styles.statHeader}>
            <Text style={[styles.arrowIcon, { color: theme.colors.danger }]}>↑</Text>
            <Text style={[styles.statLabel, { color: theme.colors.danger }]}>Expense</Text>
          </View>
          <Text
            style={[styles.statValue, { color: theme.colors.textPrimary, fontSize: getStatFontSize() }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formattedExpense}
          </Text>
        </GlassCard>
      </View>

      <Modal
        visible={showCurrencyModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowCurrencyModal(false)}>
          <GlassCard style={styles.modalContent}>
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Select Currency</Text>
            <ScrollView style={styles.currencyList}>
              {currencyOptions.map((cur) => (
                <Pressable
                  key={cur}
                  style={[
                    styles.currencyOption,
                    currentCurrency === cur && { backgroundColor: theme.colors.primary + '30' }
                  ]}
                  onPress={() => handleCurrencyChange(cur)}
                >
                  <Text style={[
                    styles.currencyOptionText,
                    { color: currentCurrency === cur ? theme.colors.primary : theme.colors.textPrimary }
                  ]}>
                    {CURRENCY_SYMBOLS[cur] || cur} - {cur}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </GlassCard>
        </Pressable>
      </Modal>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
  },
  currencyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  currencyText: {
    fontSize: 12,
    fontWeight: "700",
  },
  balance: {
    fontWeight: "700",
    letterSpacing: -1,
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  arrowIcon: {
    fontSize: 14,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  statValue: {
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxHeight: "60%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  currencyList: {
    maxHeight: 300,
  },
  currencyOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  currencyOptionText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default BalanceCard;
