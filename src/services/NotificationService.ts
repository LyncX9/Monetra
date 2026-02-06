import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LAST_KEY = "LAST_THRESHOLD_NOTIFICATION";
const LAST_TRANSACTION_KEY = "LAST_TRANSACTION_TIME";
const REMINDER_IDENTIFIER = "transaction_reminder";

export default class NotificationService {
  async requestPermissions(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  }

  async canNotifyToday(): Promise<boolean> {
    const raw = await AsyncStorage.getItem(LAST_KEY);
    if (!raw) return true;
    const ts = Number(raw);
    return new Date(ts).toDateString() !== new Date().toDateString();
  }

  async markNotifiedNow(): Promise<void> {
    await AsyncStorage.setItem(LAST_KEY, String(Date.now()));
  }

  async scheduleThresholdNotification(body: string): Promise<void> {
    const ok = await this.requestPermissions();
    if (!ok) return;
    const can = await this.canNotifyToday();
    if (!can) return;
    await Notifications.scheduleNotificationAsync({ content: { title: "Budget Alert", body }, trigger: null });
    await this.markNotifiedNow();
  }

  // Track when last transaction was added
  async markTransactionAdded(): Promise<void> {
    await AsyncStorage.setItem(LAST_TRANSACTION_KEY, String(Date.now()));
  }

  // Schedule a reminder if no transaction in 24 hours
  async scheduleTransactionReminder(): Promise<void> {
    const ok = await this.requestPermissions();
    if (!ok) return;

    // Cancel existing reminder first
    await Notifications.cancelScheduledNotificationAsync(REMINDER_IDENTIFIER).catch(() => { });

    // Check if last transaction was more than 24 hours ago
    const lastTx = await AsyncStorage.getItem(LAST_TRANSACTION_KEY);
    const lastTime = lastTx ? Number(lastTx) : Date.now();
    const hoursSince = (Date.now() - lastTime) / (1000 * 60 * 60);

    if (hoursSince >= 24) {
      // Send immediate notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Monetra",
          body: "Hai! Jangan lupa catat transaksi hari ini ya! 💰",
        },
        trigger: null,
      });
    } else {
      // Schedule for 24 hours after last transaction
      const triggerTime = new Date(lastTime + 24 * 60 * 60 * 1000);
      await Notifications.scheduleNotificationAsync({
        identifier: REMINDER_IDENTIFIER,
        content: {
          title: "Monetra",
          body: "Hai! Jangan lupa catat transaksi hari ini ya! 💰",
        },
        trigger: { type: 'date', date: triggerTime } as any,
      });
    }
  }
}

