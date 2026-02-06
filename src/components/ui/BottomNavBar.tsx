import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';

interface BottomNavBarProps {
    activeTab: 'home' | 'stats' | 'settings' | 'profile';
    onTabPress: (tab: 'home' | 'stats' | 'settings' | 'profile') => void;
    onAddPress: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onTabPress, onAddPress }) => {
    const { theme, isDark } = useTheme();

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={isDark
                    ? ['rgba(27, 40, 56, 0.95)', 'rgba(13, 27, 42, 0.98)']
                    : ['rgba(255,255,255,0.95)', 'rgba(240,245,255,0.98)']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            />
            <BlurView intensity={isDark ? 30 : 20} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />

            <View style={[styles.topBorder, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]} />

            <View style={styles.navContent}>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => onTabPress('home')}
                >
                    <Text style={[styles.navIcon, activeTab === 'home' && { opacity: 1 }]}>🏠</Text>
                    <Text style={[styles.navLabel, { color: activeTab === 'home' ? theme.colors.primary : theme.colors.textMuted }]}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => onTabPress('stats')}
                >
                    <Text style={[styles.navIcon, activeTab === 'stats' && { opacity: 1 }]}>📊</Text>
                    <Text style={[styles.navLabel, { color: activeTab === 'stats' ? theme.colors.primary : theme.colors.textMuted }]}>Stats</Text>
                </TouchableOpacity>

                <View style={styles.fabContainer}>
                    <LinearGradient
                        colors={['#0066FF', '#00C6FF']}
                        style={styles.fab}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <TouchableOpacity style={styles.fabTouch} onPress={onAddPress}>
                            <Text style={styles.fabIcon}>+</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => onTabPress('settings')}
                >
                    <Text style={[styles.navIcon, activeTab === 'settings' && { opacity: 1 }]}>⚙️</Text>
                    <Text style={[styles.navLabel, { color: activeTab === 'settings' ? theme.colors.primary : theme.colors.textMuted }]}>Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => onTabPress('profile')}
                >
                    <Text style={[styles.navIcon, activeTab === 'profile' && { opacity: 1 }]}>👤</Text>
                    <Text style={[styles.navLabel, { color: activeTab === 'profile' ? theme.colors.primary : theme.colors.textMuted }]}>Profile</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 85,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: 'hidden',
    },
    topBorder: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
    },
    navContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 12,
        paddingBottom: 12,
        paddingTop: 8,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
        minWidth: 56,
    },
    navIcon: {
        fontSize: 24,
        marginBottom: 4,
        opacity: 0.5,
    },
    navLabel: {
        fontSize: 11,
        fontWeight: '600',
    },
    fabContainer: {
        marginTop: -36,
    },
    fab: {
        width: 60,
        height: 60,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#0066FF',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10,
    },
    fabTouch: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    fabIcon: {
        fontSize: 32,
        fontWeight: '600',
        color: '#FFF',
        marginTop: -2,
    },
});
