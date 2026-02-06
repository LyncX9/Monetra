export default class CurrencyService {
  private base = "IDR";
  private rates: Record<string, number> = {
    IDR_IDR: 1,
    USD_USD: 1,
    EUR_EUR: 1,
    JPY_JPY: 1,
    GBP_GBP: 1
  };

  getBaseCurrency(): string {
    return this.base;
  }

  async loadRates(base: string): Promise<void> {
    this.base = base;

    const targets = ["IDR", "USD", "EUR", "JPY", "GBP"];
    for (const t of targets) {
      const rate = await this.fetchRate(base, t);
      this.rates[`${base}_${t}`] = rate;
    }
  }

  async fetchRate(base: string, target: string): Promise<number> {
    if (base === target) return 1;
    
    const key = `${base}_${target}`;
    if (this.rates[key]) {
      const cached = this.rates[key];
      return typeof cached === "number" && Number.isFinite(cached) && !Number.isNaN(cached) ? cached : 1;
    }

    try {
      const url = `https://open.er-api.com/v6/latest/${base}`;
      const res = await fetch(url);
      const json = await res.json();

      if (json?.rates && json.rates[target]) {
        const rate = typeof json.rates[target] === "number" && Number.isFinite(json.rates[target]) && !Number.isNaN(json.rates[target])
          ? json.rates[target]
          : 1;
        this.rates[key] = rate;
        return rate;
      }
      
      this.rates[key] = 1;
      return 1;
    } catch {
      this.rates[key] = 1;
      return 1;
    }
  }

  convert(amount: number, from: string, to: string): number {
    if (typeof amount !== "number" || !Number.isFinite(amount) || Number.isNaN(amount)) {
      return 0;
    }
    const key = `${from}_${to}`;
    const r = this.rates[key] ?? 1;
    if (typeof r !== "number" || !Number.isFinite(r) || Number.isNaN(r)) {
      return amount;
    }
    const result = amount * r;
    return Number.isFinite(result) && !Number.isNaN(result) ? result : 0;
  }

  formatDisplay(amount: number, currency: string): string {
    const safeAmount = typeof amount === "number" && Number.isFinite(amount) && !Number.isNaN(amount) ? amount : 0;
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency
      }).format(safeAmount);
    } catch {
      return safeAmount.toLocaleString();
    }
  }

  formatInput(v: string, currency: string): string {
    const numeric = v.replace(/[^0-9]/g, "");
    const num = Number(numeric) || 0;
    return this.formatDisplay(num, currency);
  }

  parseAmount(v: string): number {
    return Number(v.replace(/[^0-9]/g, "")) || 0;
  }
}
