import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput, Alert, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useServices } from "../contexts/ServiceContext";
import { useTheme } from "../contexts/ThemeContext";
import { GradientBackground } from "../components/ui/GradientBackground";
import { GlassCard } from "../components/ui/GlassCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { formatSmartNumber } from "../utils/formatCurrency";
import * as ImagePicker from 'expo-image-picker';

const PROFILE_KEY = "@pocket_expense_profile";

interface ProfileData {
    name: string;
    monthlyBudget: number;
    profilePhoto: string | null;
}

const ProfileScreen: React.FC = () => {
    const { transactionManager, settingsManager, currencyService } = useServices();
    const { theme, isDark, toggleTheme } = useTheme();

    const [name, setName] = useState("User");
    const [monthlyBudget, setMonthlyBudget] = useState(0);
    const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
    const [budgetInput, setBudgetInput] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [totalSpent, setTotalSpent] = useState(0);
    const [currency, setCurrency] = useState("IDR");
    const [memberSince, setMemberSince] = useState("");
    const [transactionCount, setTransactionCount] = useState(0);

    const loadProfile = async () => {
        try {
            const saved = await AsyncStorage.getItem(PROFILE_KEY);
            if (saved) {
                const data: ProfileData = JSON.parse(saved);
                setName(data.name);
                setMonthlyBudget(data.monthlyBudget);
                setProfilePhoto(data.profilePhoto || null);
                setBudgetInput(String(data.monthlyBudget).replace(/\B(?=(\d{3})+(?!\d))/g, "."));
            }
        } catch { }

        await transactionManager.load();
        const s = await settingsManager.getSettings();
        const cur = s?.currency ?? "IDR";
        setCurrency(cur);

        const exp = transactionManager.getTotalExpense(currencyService, cur);
        setTotalSpent(exp);

        const all = transactionManager.getAll();
        setTransactionCount(all.length);

        if (all.length > 0) {
            const sorted = [...all].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            const firstDate = new Date(sorted[0].date);
            setMemberSince(firstDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }));
        } else {
            setMemberSince(new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }));
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadProfile();
        }, [])
    );

    const [isEditingBudget, setIsEditingBudget] = useState(false);

    const saveProfile = async () => {
        // Saves Name and photo
        const data: ProfileData = { name, monthlyBudget, profilePhoto };
        try {
            await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(data));
            setIsEditing(false);
            Alert.alert("Saved", "Profile updated successfully!");
        } catch {
            Alert.alert("Error", "Failed to save profile");
        }
    };

    const saveBudget = async () => {
        const budget = Number(budgetInput.replace(/[^0-9]/g, "")) || 0;
        const data: ProfileData = { name, monthlyBudget: budget, profilePhoto };
        try {
            await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(data));
            setMonthlyBudget(budget);
            setIsEditingBudget(false);
        } catch {
            Alert.alert("Error", "Failed to save budget");
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please allow access to your photo library to set a profile picture.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled && result.assets[0]) {
            const newPhoto = result.assets[0].uri;
            setProfilePhoto(newPhoto);
            // Auto-save after selecting photo
            const data: ProfileData = { name, monthlyBudget, profilePhoto: newPhoto };
            await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(data));
        }
    };

    const budgetProgress = monthlyBudget > 0 ? Math.min((totalSpent / monthlyBudget) * 100, 100) : 0;
    const budgetRemaining = monthlyBudget - totalSpent;

    return (
        <GradientBackground>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>

                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Profile</Text>
                    <Pressable onPress={() => setIsEditing(!isEditing)}>
                        <Text style={[styles.editBtn, { color: isEditing ? theme.colors.danger : theme.colors.primary }]}>{isEditing ? "Cancel" : "Edit"}</Text>
                    </Pressable>
                </View>

                <GlassCard style={styles.profileCard}>
                    <Pressable onPress={isEditing ? pickImage : undefined} style={styles.avatarContainer}>
                        {profilePhoto ? (
                            <Image source={{ uri: profilePhoto }} style={styles.avatarImage} />
                        ) : (
                            <View style={[styles.avatar, { backgroundColor: '#0066FF' }]}>
                                <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
                            </View>
                        )}
                        {isEditing && (
                            <View style={[styles.editPhotoOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                                <Ionicons name="camera" size={24} color="#FFF" />
                            </View>
                        )}
                    </Pressable>
                    {isEditing ? (
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            style={[styles.nameInput, { color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
                            placeholder="Your Name"
                            placeholderTextColor={theme.colors.textMuted}
                        />
                    ) : (
                        <Text style={[styles.profileName, { color: theme.colors.textPrimary }]}>{name}</Text>
                    )}
                    <Text style={[styles.memberSince, { color: theme.colors.textMuted }]}>Member since {memberSince}</Text>
                </GlassCard>

                <GlassCard style={styles.budgetCard}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, marginBottom: 0 }]}>Monthly Budget</Text>
                        <Pressable onPress={() => {
                            if (isEditingBudget) {
                                saveBudget();
                            } else {
                                setIsEditingBudget(true);
                                setBudgetInput(String(monthlyBudget));
                            }
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Ionicons
                                    name={isEditingBudget ? "checkmark-circle" : "create-outline"}
                                    size={20}
                                    color={isEditingBudget ? theme.colors.success : theme.colors.primary}
                                />
                                {monthlyBudget === 0 && !isEditingBudget && (
                                    <Text style={{ color: theme.colors.primary, fontSize: 14, fontWeight: '600' }}>Set Budget</Text>
                                )}
                            </View>
                        </Pressable>
                    </View>

                    {isEditingBudget ? (
                        <View style={{ marginTop: 12 }}>
                            <View style={[styles.budgetInputContainer, { borderColor: theme.colors.border }]}>
                                <Text style={[styles.currencyPrefix, { color: theme.colors.primary }]}>{currency}</Text>
                                <TextInput
                                    value={budgetInput}
                                    onChangeText={(text) => {
                                        // Auto-format currency
                                        const clean = text.replace(/[^0-9]/g, '');
                                        if (clean) {
                                            const formatted = Number(clean).toLocaleString('id-ID').replace(/\,/g, '.'); // Simple dot separator
                                            // Ideally use proper locale but this is a quick reliable dot separator for IDR/General
                                            // Let's use Number(clean).toLocaleString('en-US').replace(/,/g, '.') if we want dots?
                                            // Or just regex insert dots.
                                            const parts = clean.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                                            setBudgetInput(parts);
                                        } else {
                                            setBudgetInput('');
                                        }
                                    }}
                                    keyboardType="numeric"
                                    style={[styles.budgetInput, { color: theme.colors.textPrimary }]}
                                    placeholder="0"
                                    placeholderTextColor={theme.colors.textMuted}
                                    autoFocus
                                />
                            </View>
                            <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 4, textAlign: 'center' }}>
                                Tap checkmark to save
                            </Text>
                        </View>
                    ) : (
                        <View style={{ marginTop: 12 }}>
                            <Text
                                style={[styles.budgetValue, { color: theme.colors.primary }]}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            >
                                {formatSmartNumber(monthlyBudget, currency)}
                            </Text>
                            <View style={styles.progressContainer}>
                                <View style={[styles.progressBg, { backgroundColor: theme.colors.border }]}>
                                    <View
                                        style={[
                                            styles.progressBar,
                                            {
                                                width: `${budgetProgress}%`,
                                                backgroundColor: budgetProgress > 100 ? theme.colors.danger : theme.colors.primary
                                            }
                                        ]}
                                    />
                                </View>
                                <Text style={[styles.progressText, { color: theme.colors.textMuted }]}>
                                    {budgetProgress.toFixed(0)}% used
                                </Text>
                            </View>
                            <Text style={[styles.remainingText, { color: budgetRemaining >= 0 ? theme.colors.success : theme.colors.danger }]}>
                                {budgetRemaining >= 0 ? "Remaining: " : "Over budget: "}
                                {formatSmartNumber(Math.abs(budgetRemaining), currency)}
                            </Text>
                        </View>
                    )}
                </GlassCard>

                <View style={styles.statsRow}>
                    <GlassCard style={styles.statCard}>
                        <Text style={[styles.statValue, { color: theme.colors.primary }]}>{transactionCount}</Text>
                        <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Transactions</Text>
                    </GlassCard>
                    <GlassCard style={styles.statCard}>
                        <Text
                            style={[styles.statValue, { color: theme.colors.danger }]}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                        >
                            {formatSmartNumber(totalSpent, currency)}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Total Spent</Text>
                    </GlassCard>
                </View>

                <GlassCard style={styles.settingCard}>
                    <View style={styles.settingRow}>
                        <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>🌙 Dark Mode</Text>
                        <Pressable onPress={toggleTheme} style={[styles.toggleBtn, { backgroundColor: isDark ? theme.colors.primary : theme.colors.border }]}>
                            <Text style={{ color: isDark ? '#000' : theme.colors.textPrimary, fontWeight: '600' }}>{isDark ? 'ON' : 'OFF'}</Text>
                        </Pressable>
                    </View>
                </GlassCard>

                {isEditing && (
                    <Pressable style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]} onPress={saveProfile}>
                        <Text style={[styles.saveBtnText, { color: isDark ? '#000' : '#FFF' }]}>Save Changes</Text>
                    </Pressable>
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
    content: {
        padding: 20,
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
    },
    editBtn: {
        fontSize: 16,
        fontWeight: '600',
    },
    profileCard: {
        alignItems: 'center',
        paddingVertical: 24,
        marginBottom: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    avatarImage: {
        width: 80,
        height: 80,
        borderRadius: 24,
    },
    editPhotoOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FFF',
    },
    profileName: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    nameInput: {
        fontSize: 20,
        fontWeight: '600',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
        textAlign: 'center',
        marginBottom: 8,
        minWidth: 200,
    },
    memberSince: {
        fontSize: 14,
    },
    budgetCard: {
        paddingVertical: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    budgetValue: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 12,
    },
    budgetInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    currencyPrefix: {
        fontSize: 20,
        fontWeight: '700',
    },
    budgetInput: {
        flex: 1,
        fontSize: 20,
        fontWeight: '600',
        padding: 0, // removed padding as container has it
    },
    progressContainer: {
        marginBottom: 8,
    },
    progressBg: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 4,
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
    },
    remainingText: {
        fontSize: 14,
        fontWeight: '600',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 16,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
    },
    settingCard: {
        marginBottom: 16,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    toggleBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    saveBtn: {
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    saveBtnText: {
        fontSize: 16,
        fontWeight: '700',
    },
});

export default ProfileScreen;
