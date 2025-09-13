export class TaxCalculator {
  calculate(
    base: number,
    rate: number
  ): { base: number; rate: number; amount: number; total: number } {
    const amount = base * rate;
    const total = base + amount;
    return { base, rate, amount, total };
  }
}
