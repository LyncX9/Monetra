import { SettingsManager } from "../src/services/SettingsManager";
import * as DatabaseService from "../src/services/DatabaseService";

jest.mock("../src/services/DatabaseService");

describe("SettingsManager", () => {
  let manager: SettingsManager;

  beforeEach(() => {
    jest.clearAllMocks();
    manager = new SettingsManager();

    // Mock default behaviors
    (DatabaseService.getSetting as jest.Mock).mockResolvedValue(null);
    (DatabaseService.saveSetting as jest.Mock).mockResolvedValue(undefined);
  });

  test("update and load settings logic", async () => {
    const s = { currency: "EUR", showDelta: true, selectedWeek: 1, selectedMonth: "m1" };

    await manager.saveSettings(s);
    expect(manager.getSettings().currency).toBe("EUR");
    expect(DatabaseService.saveSetting).toHaveBeenCalledWith("master_settings", JSON.stringify(s));

    // Simulate reload from DB
    (DatabaseService.getSetting as jest.Mock).mockResolvedValue(JSON.stringify(s));

    const loaded = await manager.loadSettings();
    expect(loaded.currency).toBe("EUR");
    expect(loaded.showDelta).toBe(true);
  });

  test("partial update", async () => {
    await manager.update({ currency: "USD" });
    expect(manager.getSettings().currency).toBe("USD");
    // Check persistence
    expect(DatabaseService.saveSetting).toHaveBeenCalled();
  });
});
