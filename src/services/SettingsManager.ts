import { AppSettings } from "../types";
import { getSetting, saveSetting } from "./DatabaseService";

export class SettingsManager {
  private cache: AppSettings = {
    currency: "IDR",
    selectedWeek: undefined,
    showDelta: false,
    selectedMonth: undefined
  };

  private listeners: Array<(s: AppSettings) => void> = [];

  constructor() {
    // No dep
  }

  async load(): Promise<AppSettings> {
    // Load each key individually or store as JSON blob.
    // Storing as JSON blob "settings_blob" is easier for full object
    const blob = await getSetting("master_settings");
    if (blob) {
      try {
        this.cache = JSON.parse(blob);
      } catch (e) {
        console.error("Settings parse error", e);
      }
    }
    return this.cache;
  }

  async loadSettings(): Promise<AppSettings> {
    return this.load();
  }

  getSettings(): AppSettings {
    return this.cache;
  }

  async saveSettings(s: AppSettings): Promise<void> {
    this.cache = s;
    await saveSetting("master_settings", JSON.stringify(s));
    this.notify();
  }

  async update(partial: Partial<AppSettings>): Promise<void> {
    this.cache = { ...this.cache, ...partial };
    await this.saveSettings(this.cache); // This triggers notify
  }

  onChange(fn: (s: AppSettings) => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  private notify(): void {
    for (const fn of this.listeners) fn(this.cache);
  }
}
export default SettingsManager;
