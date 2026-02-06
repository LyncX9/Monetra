import { TransactionManager } from "../src/services/TransactionManager";
import * as DatabaseService from "../src/services/DatabaseService";
import * as FirebaseService from "../src/services/FirebaseService";

// Mock dependencies
jest.mock("../src/services/DatabaseService");
jest.mock("../src/services/FirebaseService");

describe("TransactionManager", () => {
  let manager: TransactionManager;

  beforeEach(() => {
    jest.clearAllMocks();
    manager = new TransactionManager();

    // Setup default mock returns
    (DatabaseService.getTransactions as jest.Mock).mockResolvedValue([]);
    (DatabaseService.addTransaction as jest.Mock).mockResolvedValue(undefined);
    (DatabaseService.deleteTransaction as jest.Mock).mockResolvedValue(undefined);
    (DatabaseService.updateTransaction as jest.Mock).mockResolvedValue(undefined);
    (FirebaseService.syncTransaction as jest.Mock).mockResolvedValue(undefined);
  });

  test("add transaction updates cache and calls services", async () => {
    const t = { title: "Lunch", amount: 10, date: new Date().toISOString(), category: "Food", type: "expense" as const };

    // Mock addTransaction to return the transaction with an ID (as logic in Manager creates ID)
    await manager.addTransaction(t);

    const all = manager.getAll();
    expect(all.length).toBe(1);
    expect(all[0].title).toBe("Lunch");
    expect(all[0].id).toBeDefined();

    expect(DatabaseService.addTransaction).toHaveBeenCalledTimes(1);
    expect(FirebaseService.syncTransaction).toHaveBeenCalledTimes(1);
  });

  test("delete transaction updates cache", async () => {
    // Pre-populate
    await manager.addTransaction({ title: "Test", amount: 100, date: new Date().toISOString(), category: "Test", type: "income" });
    const id = manager.getAll()[0].id;

    const result = await manager.deleteTransaction(id);

    expect(result).toBe(true);
    expect(manager.getAll().length).toBe(0);
    expect(DatabaseService.deleteTransaction).toHaveBeenCalledWith(id);
  });

  test("balance calculation", async () => {
    await manager.addTransaction({ title: "Income", amount: 100, date: new Date().toISOString(), category: "Salary", type: "income" });
    await manager.addTransaction({ title: "Expense", amount: 40, date: new Date().toISOString(), category: "Food", type: "expense" });

    const balance = manager.getBalance();
    expect(balance).toBe(60); // 100 - 40
  });
});
