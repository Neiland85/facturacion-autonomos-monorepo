"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxCalculator = void 0;
class TaxCalculator {
    calculate(base, rate) {
        const amount = base * rate;
        const total = base + amount;
        return { base, rate, amount, total };
    }
}
exports.TaxCalculator = TaxCalculator;
