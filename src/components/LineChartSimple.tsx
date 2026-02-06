import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop, Circle, G, Line, Text as SvgText, Rect } from "react-native-svg";
import { useTheme } from "../contexts/ThemeContext";
import { formatSmartNumber } from "../utils/formatCurrency";

type Props = {
  data?: number[];
  dayLabels?: string[];
  width: number;
  height?: number;
  currency?: string;
};

const LineChartSimple: React.FC<Props> = ({ data = [], dayLabels, width, height = 200, currency = "USD" }) => {
  const { theme } = useTheme();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const labels = (dayLabels && dayLabels.length > 0) ? dayLabels : Array.from({ length: data.length || 4 }, (_, i) => `Week ${i + 1}`);
  const values = Array.isArray(data) && data.length > 0
    ? data.map(v => (typeof v === 'number' && isFinite(v) ? v : 0))
    : [0, 0, 0, 0];

  if (values.length === 0) return null;

  const padding = { top: 20, right: 20, bottom: 35, left: 55 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;

  // Calculate nice grid values
  const gridCount = 4;
  const gridStep = valueRange / (gridCount - 1);
  const gridValues = Array.from({ length: gridCount }, (_, i) => minValue + (gridStep * i));

  const getX = (index: number) => padding.left + (index / (values.length - 1 || 1)) * chartWidth;
  const getY = (value: number) => padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;

  // Create smooth curve path
  const createSmoothPath = () => {
    if (values.length < 2) return "";

    let path = `M ${getX(0)} ${getY(values[0])}`;

    for (let i = 0; i < values.length - 1; i++) {
      const x0 = getX(i);
      const y0 = getY(values[i]);
      const x1 = getX(i + 1);
      const y1 = getY(values[i + 1]);

      const cpx1 = x0 + (x1 - x0) / 3;
      const cpx2 = x0 + 2 * (x1 - x0) / 3;

      path += ` C ${cpx1} ${y0}, ${cpx2} ${y1}, ${x1} ${y1}`;
    }

    return path;
  };

  // Create area path for gradient fill
  const createAreaPath = () => {
    const linePath = createSmoothPath();
    if (!linePath) return "";

    const lastX = getX(values.length - 1);
    const firstX = getX(0);
    const bottomY = padding.top + chartHeight;

    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  const linePath = createSmoothPath();
  const areaPath = createAreaPath();

  const selectedValue = selectedIndex !== null && selectedIndex < values.length ? values[selectedIndex] : null;
  const selectedLabel = selectedIndex !== null && selectedIndex < labels.length ? labels[selectedIndex] : null;

  return (
    <View style={[styles.container, { width, height: height + 60 }]}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#0066FF" />
            <Stop offset="100%" stopColor="#00C6FF" />
          </LinearGradient>
          <LinearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#0066FF" stopOpacity="0.25" />
            <Stop offset="100%" stopColor="#0066FF" stopOpacity="0" />
          </LinearGradient>
          <LinearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#0066FF" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#00C6FF" stopOpacity="0.4" />
          </LinearGradient>
        </Defs>

        {/* Y-axis grid lines and labels */}
        {gridValues.map((value, index) => {
          const y = getY(value);
          return (
            <G key={index}>
              <Line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={1}
                strokeDasharray="4,4"
              />
              <SvgText
                x={padding.left - 8}
                y={y + 4}
                fill={theme.colors.textMuted}
                fontSize={11}
                textAnchor="end"
              >
                {formatSmartNumber(value, currency)}
              </SvgText>
            </G>
          );
        })}

        {/* Area fill */}
        <Path d={areaPath} fill="url(#areaGradient)" />

        {/* Glow effect */}
        <Path
          d={linePath}
          stroke="url(#glowGradient)"
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
        />

        {/* Main line */}
        <Path
          d={linePath}
          stroke="url(#lineGradient)"
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />

        {/* Data points */}
        {values.map((value, index) => {
          const isSelected = selectedIndex === index;
          return (
            <G key={index}>
              {/* Outer glow for selected */}
              {isSelected && (
                <Circle
                  cx={getX(index)}
                  cy={getY(value)}
                  r={14}
                  fill="rgba(0, 198, 255, 0.2)"
                />
              )}
              <Circle
                cx={getX(index)}
                cy={getY(value)}
                r={isSelected ? 8 : 6}
                fill={isSelected ? "#00C6FF" : "#0066FF"}
                stroke="#FFF"
                strokeWidth={2}
                onPress={() => setSelectedIndex(selectedIndex === index ? null : index)}
              />
            </G>
          );
        })}

        {/* Tooltip */}
        {selectedIndex !== null && selectedValue !== null && (
          <G>
            <Rect
              x={getX(selectedIndex) - 40}
              y={getY(selectedValue) - 50}
              width={80}
              height={32}
              rx={8}
              fill="#0066FF"
            />
            <Path
              d={`M ${getX(selectedIndex) - 6} ${getY(selectedValue) - 18} 
                  L ${getX(selectedIndex)} ${getY(selectedValue) - 12} 
                  L ${getX(selectedIndex) + 6} ${getY(selectedValue) - 18} Z`}
              fill="#0066FF"
            />
            <SvgText
              x={getX(selectedIndex)}
              y={getY(selectedValue) - 28}
              fill="#FFF"
              fontSize={14}
              fontWeight="700"
              textAnchor="middle"
            >
              {formatSmartNumber(selectedValue, currency)}
            </SvgText>
          </G>
        )}

        {/* X-axis labels */}
        {labels.map((label, index) => (
          <SvgText
            key={index}
            x={getX(index)}
            y={height - 8}
            fill={selectedIndex === index ? theme.colors.primary : theme.colors.textMuted}
            fontSize={11}
            fontWeight={selectedIndex === index ? "700" : "400"}
            textAnchor="middle"
          >
            {label}
          </SvgText>
        ))}
      </Svg>

      {/* Detail Preview */}
      {selectedIndex !== null && selectedValue !== null && selectedLabel && (
        <View style={[styles.detailCard, { backgroundColor: 'rgba(30, 50, 80, 0.8)', borderColor: theme.colors.border }]}>
          <View style={styles.detailHeader}>
            <Text style={[styles.detailLabel, { color: theme.colors.textMuted }]}>{selectedLabel}</Text>
            <Text style={[styles.detailValue, { color: theme.colors.primary }]}>{formatSmartNumber(selectedValue, currency)}</Text>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={[styles.detailItemLabel, { color: theme.colors.textMuted }]}>Income</Text>
              <Text style={[styles.detailItemValue, { color: theme.colors.success }]}>
                +{formatSmartNumber(selectedValue * 1.5, currency)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailItemLabel, { color: theme.colors.textMuted }]}>Expense</Text>
              <Text style={[styles.detailItemValue, { color: theme.colors.danger }]}>
                -{formatSmartNumber(selectedValue * 0.5, currency)}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  detailCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
  },
  detailItemLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  detailItemValue: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default LineChartSimple;
