import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, Alert, ScrollView, Pressable } from "react-native";
import { useRoute, useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useServices } from "../contexts/ServiceContext";
import { useTheme } from "../contexts/ThemeContext";
import { Transaction } from "../types";
import { GradientBackground } from "../components/ui/GradientBackground";
import { GlassCard } from "../components/ui/GlassCard";
import { formatSmartNumber } from "../utils/formatCurrency";

const TransactionDetail: React.FC = () => {
  const route = useRoute();
  const nav = useNavigation();
  const { transactionManager, currencyService, settingsManager } = useServices();
  const { theme } = useTheme();
  const { id } = (route.params || {}) as { id?: string };
  const [tx, setTx] = useState<Transaction | null>(null);
  const [currency, setCurrency] = useState<string>("IDR");

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        await transactionManager.load();
        const all = transactionManager.getAll();
        const found = all.find(t => t.id === id) ?? null;
        setTx(found);
        const s = await settingsManager.getSettings();
        setCurrency(s?.currency ?? "IDR");
      };
      void load();
    }, [id])
  );

  const remove = async () => {
    if (!id) return;
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const ok = await transactionManager.deleteTransaction(id);
            if (ok) (nav as any).goBack();
            else Alert.alert("Error", "Failed to delete transaction");
          }
        }
      ]
    );
  };

  if (!tx) {
    return (
      <GradientBackground>
        <View style={styles.centerContainer}>
          <Text style={[styles.notFound, { color: theme.colors.textMuted }]}>Transaction not found</Text>
        </View>
      </GradientBackground>
    );
  }

  let safeAmount = typeof tx.amount === "number" && Number.isFinite(tx.amount) && !Number.isNaN(tx.amount) ? tx.amount : 0;

  if (tx.originalCurrency && tx.originalAmount !== undefined) {
    safeAmount = currencyService.convert(tx.originalAmount, tx.originalCurrency, currency);
  } else {
    const base = currencyService.getBaseCurrency?.() || "IDR";
    safeAmount = currencyService.convert(safeAmount, base, currency);
  }

  const formattedAmount = formatSmartNumber(safeAmount, currency);
  const isIncome = tx.type === "income";

  return (
    <GradientBackground>
      <ScrollView style={styles.scrollContainer}>
        <GlassCard style={styles.card}>
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.category, { color: theme.colors.textPrimary }]}>{tx.category || "Other"}</Text>
            <Text style={[styles.amount, isIncome ? { color: theme.colors.success } : { color: theme.colors.danger }]}>
              {isIncome ? "+" : "-"} {formattedAmount}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.textMuted }]}>Title</Text>
            <Text style={[styles.value, { color: theme.colors.textSecondary }]}>{tx.title || "No title"}</Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.textMuted }]}>Type</Text>
            <View style={[styles.typeBadge, { backgroundColor: isIncome ? theme.colors.success + '20' : theme.colors.danger + '20' }]}>
              <Text style={[styles.typeText, { color: isIncome ? theme.colors.success : theme.colors.danger }]}>
                {tx.type === "income" ? "Income" : "Expense"}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.textMuted }]}>Date</Text>
            <Text style={[styles.value, { color: theme.colors.textSecondary }]}>{new Date(tx.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric"
            })}</Text>
          </View>

          {tx.note ? (
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.colors.textMuted }]}>Note</Text>
              <Text style={[styles.value, { color: theme.colors.textSecondary }]}>{tx.note}</Text>
            </View>
          ) : null}

          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.editButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => (nav as any).navigate('EditTransaction', { id: tx.id })}
            >
              <Ionicons name="pencil" size={18} color="#FFF" />
              <Text style={styles.editText}>Edit</Text>
            </Pressable>
            <Pressable style={[styles.deleteButton, { borderColor: theme.colors.danger }]} onPress={remove}>
              <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
              <Text style={[styles.deleteText, { color: theme.colors.danger }]}>Delete</Text>
            </Pressable>
          </View>
        </GlassCard>
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    padding: 16
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  },
  card: {
    padding: 24
  },
  notFound: {
    fontSize: 16,
    textAlign: "center",
  },
  header: {
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
  },
  category: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8
  },
  amount: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.5
  },
  section: {
    marginBottom: 24
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: "uppercase"
  },
  value: {
    fontSize: 16,
    fontWeight: "500"
  },
  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  typeText: {
    fontSize: 14,
    fontWeight: "600"
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  editText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    backgroundColor: 'transparent',
    gap: 8,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5
  }
});

export default TransactionDetail;
