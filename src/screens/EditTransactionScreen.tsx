import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Platform, ScrollView, Alert } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useServices } from "../contexts/ServiceContext";
import { useTheme } from "../contexts/ThemeContext";
import { GradientBackground } from "../components/ui/GradientBackground";
import { GlassCard } from "../components/ui/GlassCard";
import { Transaction } from "../types";

const CATEGORIES = ["General", "Food", "Transport", "Shopping", "Salary", "Bills", "Entertainment", "Health", "Education", "Other"];

const EditTransactionScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { transactionManager, settingsManager } = useServices();
    const { theme, isDark } = useTheme();

    const { id } = (route.params || {}) as { id?: string };

    const [title, setTitle] = useState<string>("");
    const [amountInput, setAmountInput] = useState<string>("");
    const [type, setType] = useState<"income" | "expense">("expense");
    const [category, setCategory] = useState<string>(CATEGORIES[0]);
    const [date, setDate] = useState<Date>(new Date());
    const [showPicker, setShowPicker] = useState<boolean>(false);
    const [currencySymbol, setCurrencySymbol] = useState<string>("IDR");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                await transactionManager.load();
                const all = transactionManager.getAll();
                const tx = all.find(t => t.id === id);

                if (tx) {
                    setTitle(tx.title || "");
                    setAmountInput(String(tx.originalAmount || tx.amount || 0));
                    setType(tx.type as "income" | "expense");
                    setCategory(tx.category || CATEGORIES[0]);
                    setDate(new Date(tx.date));
                }

                const s = await settingsManager.getSettings();
                setCurrencySymbol(s?.currency ?? "IDR");
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, [id]);

    const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowPicker(false);
        if (selectedDate) setDate(selectedDate);
    };

    const onChangeAmount = (v: string) => {
        const cleaned = v.replace(/[^0-9]/g, "");
        if (cleaned !== amountInput) setAmountInput(cleaned);
    };

    const getDisplayAmount = (): string => {
        if (!amountInput || amountInput === "0") return "";
        return amountInput.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const validate = (): string | null => {
        if (!title.trim()) return "Title is required";
        const num = Number(amountInput);
        if (isNaN(num) || num <= 0) return "Amount must be greater than 0";
        if (!category) return "Category required";
        return null;
    };

    const onSave = async () => {
        const err = validate();
        if (err) {
            Alert.alert("Validation Error", err);
            return;
        }

        if (!id) return;

        const num = Number(amountInput);
        if (isNaN(num) || num <= 0) return;

        const payload: Partial<Transaction> = {
            title: title.trim(),
            amount: num,
            category,
            type,
            date: date.toISOString(),
            originalAmount: num,
            originalCurrency: currencySymbol,
        };

        const ok = await transactionManager.updateTransaction(id, payload);
        if (ok) {
            (navigation as any).goBack();
        } else {
            Alert.alert("Error", "Failed to update transaction");
        }
    };

    if (loading) {
        return (
            <GradientBackground>
                <View style={styles.centerContainer}>
                    <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>Loading...</Text>
                </View>
            </GradientBackground>
        );
    }

    return (
        <GradientBackground>
            <ScrollView style={styles.container}>

                <GlassCard style={styles.formCard}>
                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Type</Text>
                    <View style={[styles.segment, { borderColor: theme.colors.border, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                        <Pressable style={[styles.segmentButton, type === "expense" && { backgroundColor: theme.colors.primary }]} onPress={() => setType("expense")}>
                            <Text style={[styles.segmentText, { color: type === "expense" ? (isDark ? '#000' : '#FFF') : theme.colors.textSecondary }]}>Expense</Text>
                        </Pressable>
                        <Pressable style={[styles.segmentButton, type === "income" && { backgroundColor: theme.colors.primary }]} onPress={() => setType("income")}>
                            <Text style={[styles.segmentText, { color: type === "income" ? (isDark ? '#000' : '#FFF') : theme.colors.textSecondary }]}>Income</Text>
                        </Pressable>
                    </View>

                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Title</Text>
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        style={[styles.input, { color: theme.colors.textPrimary, borderColor: theme.colors.border, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}
                        placeholder="e.g. Lunch"
                        placeholderTextColor={theme.colors.textMuted}
                    />

                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Amount ({currencySymbol})</Text>
                    <TextInput
                        value={getDisplayAmount()}
                        onChangeText={onChangeAmount}
                        style={[styles.input, { color: theme.colors.textPrimary, borderColor: theme.colors.border, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={theme.colors.textMuted}
                        returnKeyType="done"
                    />

                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Category</Text>
                    <View style={[styles.pickerWrap, { borderColor: theme.colors.border, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                        <Picker
                            selectedValue={category}
                            onValueChange={(v) => { if (v) setCategory(String(v)); }}
                            style={[styles.picker, { color: theme.colors.textPrimary, backgroundColor: 'transparent' }]}
                            dropdownIconColor={theme.colors.textPrimary}
                            mode="dropdown"
                        >
                            {CATEGORIES.map((c) => (
                                <Picker.Item
                                    key={c}
                                    label={c}
                                    value={c}
                                    color={isDark ? '#FFFFFF' : '#000000'}
                                    style={{ backgroundColor: isDark ? '#1B2838' : '#FFFFFF' }}
                                />
                            ))}
                        </Picker>
                    </View>

                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Date</Text>
                    <Pressable style={[styles.input, { borderColor: theme.colors.border, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} onPress={() => setShowPicker(true)}>
                        <Text style={{ color: theme.colors.textPrimary }}>{date.toDateString()}</Text>
                    </Pressable>
                    {showPicker && (
                        <DateTimePicker value={date} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={onChangeDate} />
                    )}

                    <Pressable style={[styles.saveButton, { backgroundColor: theme.colors.primary }]} onPress={onSave}>
                        <Text style={[styles.saveText, { color: isDark ? '#000' : '#FFF' }]}>Save Changes</Text>
                    </Pressable>
                </GlassCard>

            </ScrollView>
        </GradientBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
    },
    formCard: {
        padding: 20
    },
    label: {
        fontSize: 14,
        marginTop: 16,
        marginBottom: 8,
        fontWeight: "600",
        letterSpacing: 0.3
    },
    input: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        fontSize: 16,
    },
    segment: {
        flexDirection: "row",
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 8,
        borderWidth: 1,
    },
    segmentButton: {
        flex: 1,
        padding: 14,
        alignItems: "center",
        justifyContent: "center"
    },
    segmentText: {
        fontWeight: "600",
        fontSize: 15
    },
    pickerWrap: {
        borderRadius: 12,
        borderWidth: 1,
        overflow: "hidden"
    },
    picker: {
        height: 50,
    },
    saveButton: {
        marginTop: 32,
        padding: 18,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    saveText: {
        fontWeight: "700",
        fontSize: 16,
        letterSpacing: 0.5
    }
});

export default EditTransactionScreen;
