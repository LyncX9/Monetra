import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing, Dimensions } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';

const { width } = Dimensions.get('window');

interface Props {
    onFinish: () => void;
}

const CustomSplashScreen: React.FC<Props> = ({ onFinish }) => {
    const { theme, isDark } = useTheme();
    const fadeAnim = useRef(new Animated.Value(1)).current; // Start visible
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const loadingRotate = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const init = async () => {
            // Hide native splash immediately so this screen takes over seamlessy
            try {
                await SplashScreen.hideAsync();
                console.log("Native splash hidden");
            } catch (e) {
                console.warn("Failed to hide splash", e);
            }
        };
        init();

        // Animation Sequence
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 6,
                tension: 40,
                useNativeDriver: true,
            })
        ]).start();

        // Loading Spinner Animation
        Animated.loop(
            Animated.timing(loadingRotate, {
                toValue: 1,
                duration: 2000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        // Simulate initialization (or wait for real init)
        const timer = setTimeout(() => {
            // Screen transition out
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start(() => onFinish());
        }, 3000); // 3 seconds splash

        return () => clearTimeout(timer);
    }, []);

    const spin = loadingRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Background Gradient for flair */}
            <LinearGradient
                colors={theme.gradients.background as any}
                style={StyleSheet.absoluteFill}
            />

            <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                {/* Logo (Icon) */}
                <Image
                    source={require('../../assets/icon.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />

                {/* Brand Text */}
                <Text style={[styles.brandTitle, { color: theme.colors.textPrimary }]}>MONETRA</Text>
                <Text style={[styles.brandSubtitle, { color: theme.colors.primary }]}>FINANCIAL INTELLIGENCE</Text>
            </Animated.View>

            {/* Modern Loading Ring */}
            <View style={styles.bottomContainer}>
                <Animated.View style={[styles.loaderContainer, { transform: [{ rotate: spin }] }]}>
                    <View style={[styles.loaderArc, { borderColor: theme.colors.primary }]} />
                </Animated.View>

                <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>
                    Loading Financial Intelligence...
                </Text>

                <Text style={[styles.version, { color: theme.colors.textSecondary }]}>
                    V2.1
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    logo: {
        width: width * 0.3, // Smaller logo
        height: width * 0.3,
        marginBottom: 20,
    },
    brandTitle: {
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: 4,
        marginBottom: 8,
        textAlign: 'center',
    },
    brandSubtitle: {
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 3,
        textAlign: 'center',
        opacity: 0.8,
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 50,
        alignItems: 'center',
    },
    loaderContainer: {
        width: 50,
        height: 50,
        marginBottom: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderArc: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 3,
        borderTopColor: 'transparent',
        borderRightColor: 'transparent',
    },
    loadingText: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    version: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 1,
    },
});

export default CustomSplashScreen;
