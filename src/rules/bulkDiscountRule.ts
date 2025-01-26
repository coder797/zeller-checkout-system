import { Cart } from '@/domain/cart';
import { Catalog } from '@/domain/catalog';
import {PricingRule} from "@/domain/types";


/**
 * If quantity >= threshold, each unit's price is discounted to a specified lower price.
 *
 * Example usage:
 *   new BulkDiscountRule('ipd', 4, 499.99)
 *   => If the cart has 4+ "ipd", each "ipd" is effectively 499.99 (instead of, say, 549.99).
 *   => The discount is (originalPrice - discountedPrice) * quantity
 */
export class BulkDiscountRule implements PricingRule {
    constructor(
        private readonly sku: string,
        private readonly threshold: number,
        private readonly discountedPrice: number
    ) {}

    getSku(): string {
        return this.sku;
    }

    apply(quantity: number, currentTotal: number): number {
        if (quantity >= this.threshold) {
            return quantity * this.discountedPrice;
        }
        return currentTotal;
    }

    getThreshold(): number {
        return this.threshold;
    }

    getDiscountedPrice(): number {
        return this.discountedPrice;
    }
}
