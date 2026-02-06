import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';

interface GlassCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    intensity?: number;
    variant?: 'default' | 'inner';
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style, intensity, variant = 'default' }) => {
    const { theme, isDark } = useTheme();
    const blurIntensity = intensity ?? (isDark ? 25 : 15);

    if (variant === 'inner') {
        return (
            <View style={[styles.innerContainer, {
                backgroundColor: isDark ? 'rgba(20, 35, 60, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)',
            }, style]}>
                {children}
            </View>
        );
    }

    return (
        <View style={[styles.container, {
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)',
        }, style]}>
            <LinearGradient
                colors={isDark
                    ? ['rgba(15, 23, 42, 0.9)', 'rgba(2, 6, 23, 0.95)'] // Much darker and higher opacity
                    : ['rgba(225, 245, 254, 0.95)', 'rgba(179, 229, 252, 0.9)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />
            <BlurView
                intensity={blurIntensity}
                tint={isDark ? "dark" : "light"}
                style={StyleSheet.absoluteFill}
            />
            <View style={[styles.glassOverlay, {
                backgroundColor: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)', // Dark overlay
            }]} />
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
    },
    innerContainer: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        padding: 16,
    },
    content: {
        padding: 20,
    },
    glassOverlay: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.5,
    },
});
