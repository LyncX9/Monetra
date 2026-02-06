import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { useTheme } from "../contexts/ThemeContext";
import { GlassCard } from "./ui/GlassCard";

type Item = {
  category: string;
  total: number;
};

type Props = {
  data: Item[];
  width: number;
  height: number;
};

const COLORS = ["#0066FF", "#00C6FF", "#22C55E", "#EF4444", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4"];

const PieChartSimple: React.FC<Props> = ({ data = [], width, height }) => {
  const { theme, isDark } = useTheme();

  const cleaned = React.useMemo(() => (Array.isArray(data) ? data : [])
    .map(x => ({
      category: String(x?.category || "Others"),
      total: typeof x?.total === 'number' && isFinite(x.total) && x.total >= 0 ? x.total : 0,
    }))
    .filter(x => x.total > 0), [data]);

  if (cleaned.length === 0) {
    return (
      <GlassCard style={styles.emptyCard}>
        <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>No expense data available</Text>
      </GlassCard>
    );
  }

  const formatted = cleaned.map((item, i) => ({
    name: item.category,
    population: item.total,
    color: COLORS[i % COLORS.length],
    legendFontColor: theme.colors.textSecondary,
    legendFontSize: 12,
  }));

  const config = {
    backgroundGradientFrom: "transparent",
    backgroundGradientTo: "transparent",
    color: () => theme.colors.primary,
    labelColor: () => theme.colors.textSecondary,
  };

  return (
    <GlassCard style={styles.card}>
      <PieChart
        data={formatted}
        width={width - 40}
        height={height}
        accessor="population"
        backgroundColor="transparent"
        chartConfig={config}
        absolute
        hasLegend
        style={styles.chart}
      />
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
  },
  emptyCard: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 14,
  },
  chart: {
    borderRadius: 16,
    marginLeft: -8,
  },
});

export default PieChartSimple;
