// BuyXPayYRule.ts
import { PricingRule } from "@/domain/types";

export class BuyXPayYRule implements PricingRule {
    public readonly sku: string;
    public readonly priority: number;

    constructor(
        sku: string,
        private readonly buyX: number,
        private readonly payY: number,
        priority?: number
    ) {
        this.sku = sku;
        this.priority = priority ?? 2; // Default lower priority than bulk discounts
    }

    apply(
        _originalQuantity: number,
        currentQuantity: number,
        currentPrice: number
    ) {
        const sets = Math.floor(currentQuantity / this.buyX);
        const remainder = currentQuantity % this.buyX;
        const newQuantity = sets * this.payY + remainder;
        return { quantity: newQuantity, price: currentPrice };
    }

    // Optional getters if needed
    getBuyX(): number {
        return this.buyX;
    }

    getPayY(): number {
        return this.payY;
    }
}
