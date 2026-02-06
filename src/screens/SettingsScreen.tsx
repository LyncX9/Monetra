import React from "react";
import { View, Text, StyleSheet, Switch, ScrollView } from "react-native";
import { GradientBackground } from "../components/ui/GradientBackground";
import { GlassCard } from "../components/ui/GlassCard";
import { useTheme } from "../contexts/ThemeContext";

const SettingsScreen: React.FC = () => {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <GradientBackground>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Settings</Text>

        <GlassCard style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>🌙 Dark Mode</Text>
              <Text style={[styles.settingDesc, { color: theme.colors.textMuted }]}>
                {isDark ? 'Currently using dark theme' : 'Currently using light theme'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: theme.colors.primary }}
              thumbColor={isDark ? '#FFF' : '#f4f3f4'}
            />
          </View>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Currency</Text>
          <Text style={[styles.settingDesc, { color: theme.colors.textMuted }]}>
            Currency settings are available in the Balance card on Home screen. Tap the currency button to change.
          </Text>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>About</Text>
          <Text style={[styles.settingDesc, { color: theme.colors.textMuted }]}>
            Monetra v1.0{'\n'}
            Built with React Native + Expo{'\n'}
            Design inspired by Stitch AI
          </Text>
        </GlassCard>

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
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
  },
  card: {
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
});

export default SettingsScreen;
