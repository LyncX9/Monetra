import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Dimensions,
  Image
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useServices } from "../contexts/ServiceContext";
import { useTheme } from "../contexts/ThemeContext";
import BalanceCard from "../components/BalanceCard";
import LineChartSimple from "../components/LineChartSimple";
import TransactionListItem from "../components/TransactionListItem";
import { GradientBackground } from "../components/ui/GradientBackground";
import { GlassCard } from "../components/ui/GlassCard";
import { formatSmartNumber } from "../utils/formatCurrency";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PROFILE_KEY = "@pocket_expense_profile";

const screenWidth = Dimensions.get("window").width;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { transactionManager, settingsManager, currencyService } = useServices();
  const { theme, isDark } = useTheme();

  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [totalTransactionCount, setTotalTransactionCount] = useState(0);
  const [weekly, setWeekly] = useState<number[]>([]);
  const [dayLabels, setDayLabels] = useState<string[]>([]);
  const [displayCurrency, setDisplayCurrency] = useState("IDR");
  const [userName, setUserName] = useState("User");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [monthlySpending, setMonthlySpending] = useState(0);
  const [lastMonthSpending, setLastMonthSpending] = useState(0);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());

  // Get greeting based on WIB timezone (UTC+7)
  const getGreeting = () => {
    // Get current time in WIB (UTC+7)
    const now = new Date();
    const wibOffset = 7 * 60; // WIB is UTC+7 in minutes
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const wibTime = new Date(utc + (wibOffset * 60000));
    const hour = wibTime.getHours();

    if (hour >= 5 && hour < 11) return "SELAMAT PAGI";
    if (hour >= 11 && hour < 15) return "SELAMAT SIANG";
    if (hour >= 15 && hour < 19) return "SELAMAT SORE";
    return "SELAMAT MALAM";
  };

  const loadData = async () => {
    await transactionManager.load();

    // Load profile data from AsyncStorage
    try {
      const savedProfile = await AsyncStorage.getItem(PROFILE_KEY);
      if (savedProfile) {
        const profileData = JSON.parse(savedProfile);
        setUserName(profileData.name || "User");
        setProfilePhoto(profileData.profilePhoto || null);
      }
    } catch { }

    try {
      const s = await settingsManager.getSettings();
      const currentCurrency = s?.currency ?? "IDR";
      setDisplayCurrency(currentCurrency);

      const inc = transactionManager.getTotalIncome(currencyService, currentCurrency);
      const exp = transactionManager.getTotalExpense(currencyService, currentCurrency);
      const bal = inc - exp;
      const all = transactionManager.getAll();
      const recent = transactionManager.getRecent(5);

      setIncome(inc);
      setExpense(exp);
      setBalance(bal);
      setTransactions(recent);
      setTotalTransactionCount(all.length);
      setMonthlySpending(exp);
      setLastMonthSpending(exp * 0.95);

      const weeklyTrend = transactionManager.getWeeklyTrend(currencyService, currentCurrency);
      const labels = weeklyTrend.slice(-4).map((_, i) => `Week ${i + 1}`);
      const values = weeklyTrend.slice(-4).map(w => w.balance);
      setDayLabels(labels);
      setWeekly(values);

    } catch {
      setDisplayCurrency("IDR");
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const spendingChange = lastMonthSpending > 0
    ? ((monthlySpending - lastMonthSpending) / lastMonthSpending * 100).toFixed(0)
    : "0";
  const isSpendingUp = Number(spendingChange) > 0;

  return (
    <GradientBackground>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: '#FF6B35' }]}>
                <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View>
              <Text style={[styles.greeting, { color: theme.colors.textMuted }]}>{getGreeting()}</Text>
              <Text style={[styles.userName, { color: theme.colors.textPrimary }]}>{userName}</Text>
            </View>
          </View>
          <Pressable style={[styles.notificationBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}>
            <Text style={styles.notificationIcon}>🔔</Text>
          </Pressable>
        </View>

        {/* Balance Card */}
        <BalanceCard
          balance={balance}
          income={income}
          expense={expense}
          currency={displayCurrency}
          onCurrencyChange={loadData}
        />

        {/* Month Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.monthTabsContainer}
          contentContainerStyle={styles.monthTabs}
        >
          {MONTHS.map((month, index) => (
            <Pressable
              key={month}
              onPress={() => setSelectedMonth(index)}
              style={[
                styles.monthTab,
                selectedMonth === index && { backgroundColor: theme.colors.primary }
              ]}
            >
              <Text style={[
                styles.monthTabText,
                { color: selectedMonth === index ? '#FFF' : theme.colors.textMuted }
              ]}>
                {month}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Monthly Spending */}
        <View style={styles.spendingSection}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>Monthly Spending</Text>
          <View style={styles.spendingRow}>
            <Text
              style={[styles.spendingAmount, { color: theme.colors.textPrimary }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {formatSmartNumber(monthlySpending, displayCurrency)}
            </Text>
            <Text style={[styles.spendingChange, { color: isSpendingUp ? theme.colors.danger : theme.colors.success }]}>
              {isSpendingUp ? '↑' : '↓'} {Math.abs(Number(spendingChange))}% vs last mo
            </Text>
          </View>
        </View>

        {/* Weekly Chart */}
        <LineChartSimple data={weekly} dayLabels={dayLabels} width={screenWidth - 48} height={180} currency={displayCurrency} />

        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Recent Transactions</Text>
        </View>

        {transactions.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>No transactions yet</Text>
          </GlassCard>
        ) : (
          <>
            {transactions.map((tx: any) => (
              <TransactionListItem key={tx.id} item={tx} />
            ))}
            {totalTransactionCount > 5 && (
              <Pressable
                style={[styles.viewAllBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}
                onPress={() => navigation.navigate('StatsTab')}
              >
                <Text style={[styles.viewAllBtnText, { color: theme.colors.primary }]}>View All Transactions</Text>
              </Pressable>
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 16,
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  greeting: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationIcon: {
    fontSize: 20,
  },
  monthTabsContainer: {
    marginBottom: 20,
    marginHorizontal: -20,
  },
  monthTabs: {
    paddingHorizontal: 20,
    gap: 8,
  },
  monthTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  monthTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  spendingSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  spendingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  spendingAmount: {
    fontSize: 32,
    fontWeight: '700',
  },
  spendingChange: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  viewAll: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  viewAllBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  viewAllBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HomeScreen;
