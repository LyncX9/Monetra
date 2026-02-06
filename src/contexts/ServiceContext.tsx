import React, { createContext, useContext } from "react";
import TransactionManager from "../services/TransactionManager";
import { SettingsManager } from "../services/SettingsManager";
import CurrencyService from "../services/CurrencyService";
import NotificationService from "../services/NotificationService";
import { initDatabase } from "../services/DatabaseService";
import { initFirebase } from "../services/FirebaseService";

export type Services = {
  transactionManager: TransactionManager;
  settingsManager: SettingsManager;
  currencyService: CurrencyService;
  notificationService: NotificationService;
};

// Instantiate services
const settingsManager = new SettingsManager();
const transactionManager = new TransactionManager();
const currencyService = new CurrencyService();
const notificationService = new NotificationService();

const ServicesContext = createContext<Services>({
  transactionManager,
  settingsManager,
  currencyService,
  notificationService
});

export const ServicesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialize = async () => {
    // Init Backend
    await initDatabase();
    initFirebase();

    // Init Services
    await transactionManager.load();
    const s = await settingsManager.load();
    const base: string = s.currency ?? "IDR";
    await currencyService.loadRates(base);
  };

  const [isReady, setIsReady] = React.useState(false);

  // Run initialization once
  React.useEffect(() => {
    const initialize = async () => {
      try {
        // Init Backend
        await initDatabase();
        initFirebase(); // Async but non-blocking for critical path? Or wait? logic says syncTransaction depends on it? No, sync checks initialized.

        // Init Services
        await transactionManager.load();
        const s = await settingsManager.load();
        const base: string = s.currency ?? "IDR";
        await currencyService.loadRates(base);

        // Schedule transaction reminder notification
        await notificationService.scheduleTransactionReminder();

        setIsReady(true);
      } catch (e) {
        console.error("Initialization Failed:", e);
      }
    };

    void initialize();
  }, []);

  if (!isReady) {
    return null; // Block rendering until ready
  }

  return (
    <ServicesContext.Provider
      value={{
        transactionManager,
        settingsManager,
        currencyService,
        notificationService
      }}
    >
      {children}
    </ServicesContext.Provider>
  );
};

export const useServices = () => useContext(ServicesContext);
