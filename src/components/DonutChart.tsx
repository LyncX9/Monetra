import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useTheme } from '../contexts/ThemeContext';

interface DonutChartProps {
    data: { category: string; total: number; color: string }[];
    size?: number;
    strokeWidth?: number;
    centerLabel?: string;
    centerValue?: string;
    percentageChange?: number;
}

const DonutChart: React.FC<DonutChartProps> = ({
    data,
    size = 220,
    strokeWidth = 20,
    centerLabel,
    centerValue,
    percentageChange,
}) => {
    const { theme } = useTheme();
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const center = size / 2;

    const total = data.reduce((sum, item) => sum + item.total, 0);

    let accumulatedPercentage = 0;
    const segments = data.map((item, index) => {
        const percentage = total > 0 ? item.total / total : 0;
        const strokeDasharray = `${circumference * percentage} ${circumference * (1 - percentage)}`;
        const rotation = accumulatedPercentage * 360 - 90;
        accumulatedPercentage += percentage;

        return {
            ...item,
            percentage,
            strokeDasharray,
            rotation,
        };
    });

    return (
        <View style={styles.container}>
            <Svg width={size} height={size}>
                <G>
                    {/* Background circle */}
                    <Circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    {/* Data segments */}
                    {segments.map((segment, index) => (
                        <Circle
                            key={index}
                            cx={center}
                            cy={center}
                            r={radius}
                            stroke={segment.color}
                            strokeWidth={strokeWidth}
                            strokeDasharray={segment.strokeDasharray}
                            strokeDashoffset={0}
                            strokeLinecap="round"
                            fill="transparent"
                            rotation={segment.rotation}
                            origin={`${center}, ${center}`}
                        />
                    ))}
                </G>
            </Svg>

            {/* Center content */}
            <View style={[styles.centerContent, { width: size, height: size }]}>
                {centerLabel && (
                    <Text style={[styles.centerLabel, { color: theme.colors.textMuted }]}>{centerLabel}</Text>
                )}
                {centerValue && (
                    <Text style={[styles.centerValue, { color: theme.colors.textPrimary }]}>{centerValue}</Text>
                )}
                {percentageChange !== undefined && (
                    <View style={styles.changeRow}>
                        <Text style={[styles.changeIcon, { color: percentageChange >= 0 ? theme.colors.danger : theme.colors.success }]}>
                            {percentageChange >= 0 ? '↗' : '↘'}
                        </Text>
                        <Text style={[styles.changeText, { color: percentageChange >= 0 ? theme.colors.danger : theme.colors.success }]}>
                            {Math.abs(percentageChange)}%
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerContent: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    centerValue: {
        fontSize: 32,
        fontWeight: '700',
        letterSpacing: -1,
    },
    changeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 2,
    },
    changeIcon: {
        fontSize: 14,
        fontWeight: '600',
    },
    changeText: {
        fontSize: 14,
        fontWeight: '600',
    },
});

export default DonutChart;
