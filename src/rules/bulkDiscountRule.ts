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
    private readonly sku: string;
    private readonly threshold: number;
    private readonly discountedPrice: number;


    constructor(
        sku: string,
        threshold: number,
        discountedPrice: number
    ) {
        this.sku = sku;
        this.threshold = threshold;
        this.discountedPrice = discountedPrice;
    }

    apply(cart: Cart, catalog: Catalog): number {
        const quantity = cart.getItemCount(this.sku);
        if (quantity < this.threshold) return 0;

        const product = catalog.getProduct(this.sku);
        if (!product) return 0;

        const originalPrice = product.price;
        const discountPerUnit = originalPrice - this.discountedPrice;
        return discountPerUnit * quantity;
    }

}
