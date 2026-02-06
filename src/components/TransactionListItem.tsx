import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useServices } from "../contexts/ServiceContext";
import { useTheme } from "../contexts/ThemeContext";
import { Transaction } from "../types";
import { formatSmartNumber } from "../utils/formatCurrency";

type Props = { item: Transaction; onDelete?: (id: string) => void };

interface CategoryConfig {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
}

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  Food: { icon: 'cart', color: '#FF6B6B', bgColor: '#FF6B6B' },
  Transport: { icon: 'car', color: '#00C6FF', bgColor: '#00C6FF' },
  Shopping: { icon: 'bag-handle', color: '#FF69B4', bgColor: '#FF69B4' },
  Bills: { icon: 'receipt', color: '#4ECDC4', bgColor: '#4ECDC4' },
  Entertainment: { icon: 'tv', color: '#FF4757', bgColor: '#FF4757' },
  Health: { icon: 'medical', color: '#95E1D3', bgColor: '#95E1D3' },
  Education: { icon: 'book', color: '#DDA0DD', bgColor: '#DDA0DD' },
  Salary: { icon: 'wallet', color: '#22C55E', bgColor: '#22C55E' },
  Income: { icon: 'cash', color: '#22C55E', bgColor: '#22C55E' },
  Other: { icon: 'apps', color: '#64748B', bgColor: '#64748B' },
  General: { icon: 'apps', color: '#64748B', bgColor: '#64748B' },
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  }
};

const TransactionListItem: React.FC<Props> = ({ item }) => {
  const navigation = useNavigation<any>();
  const { currencyService, settingsManager } = useServices();
  const { theme, isDark } = useTheme();
  const [displayAmount, setDisplayAmount] = React.useState<string>("");

  React.useEffect(() => {
    const load = async () => {
      const s = await settingsManager.getSettings();
      const currentCurrency = s?.currency ?? "IDR";

      let amt = typeof item.amount === "number" && Number.isFinite(item.amount) ? item.amount : 0;
      if (item.originalCurrency && item.originalAmount !== undefined) {
        amt = currencyService.convert(item.originalAmount, item.originalCurrency, currentCurrency);
      } else {
        const base = currencyService.getBaseCurrency?.() || "IDR";
        amt = currencyService.convert(amt, base, currentCurrency);
      }

      setDisplayAmount(formatSmartNumber(amt, currentCurrency));
    };
    void load();
  }, [item, currencyService, settingsManager]);

  const isIncome = item.type === "income";
  const category = item.category || "Other";
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.Other;

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("TransactionDetail", { id: item.id })}
      activeOpacity={0.7}
    >
      <View style={[
        styles.container,
        {
          backgroundColor: isDark ? 'rgba(30, 40, 55, 0.8)' : 'rgba(255, 255, 255, 0.9)',
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        }
      ]}>
        <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
          <Ionicons name={config.icon} size={20} color="#FFF" />
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]} numberOfLines={1}>
            {item.title || category}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            {category} • {formatDate(item.date)}
          </Text>
        </View>
        <Text style={[styles.amount, isIncome ? { color: theme.colors.success } : { color: theme.colors.danger }]}>
          {isIncome ? '+' : '-'}{displayAmount || "$0.00"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 12,
  },
  amount: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
});

export default React.memo(TransactionListItem);
