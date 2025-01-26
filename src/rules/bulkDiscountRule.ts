// BulkDiscountRule.ts
import { PricingRule } from "@/domain/types";

export class BulkDiscountRule implements PricingRule {
    public readonly sku: string;
    public readonly priority: number;

    constructor(
        sku: string,
        private readonly threshold: number,
        private readonly discountedPrice: number,
        priority?: number
    ) {
        this.sku = sku;
        this.priority = priority ?? 1; // Default higher priority
    }

    apply(
        originalQuantity: number,
        currentQuantity: number,
        currentPrice: number
    ) {
        const newPrice = originalQuantity >= this.threshold
            ? this.discountedPrice
            : currentPrice;
        return { quantity: currentQuantity, price: newPrice };
    }

    // Optional getters if needed
    getThreshold(): number {
        return this.threshold;
    }

    getDiscountedPrice(): number {
        return this.discountedPrice;
    }
}
