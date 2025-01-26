import { Cart } from './cart';
import { Catalog } from './catalog';
import {PricingRule} from "./types";

export class Checkout {
    private readonly cart: Cart;
    private readonly catalog: Catalog;
    private readonly pricingRules: PricingRule[];

    constructor(pricingRules: PricingRule[]) {
        this.cart = new Cart();
        this.catalog = new Catalog();
        this.pricingRules = pricingRules;
    }

    /**
     * Add an item to the cart by SKU.
     * Throws if SKU not found in catalog.
     */
    scan(sku: string): void {
        if (!this.catalog.getProduct(sku)) {
            throw new Error(`SKU ${sku} does not exist in the catalog`);
        }
        this.cart.addItem(sku);
    }

    /**
     * Calculate the final total:
     * 1) Sum up base prices from the catalog
     * 2) Apply each pricing rule (subtract discount from total)
     */
    total(): number {
        let totalPrice = 0;

        // 1) Calculate base price
        for (const [sku, quantity] of this.cart.getItems().entries()) {
            const product = this.catalog.getProduct(sku);
            if (!product) {
                throw new Error(`Product with SKU ${sku} not found in catalog`);
            }
            totalPrice += product.price * quantity;
        }
        // 2) Subtract discounts from each rule
        for (const rule of this.pricingRules) {
            // Each rule returns "how much to discount"
            // reduce totalPrice by that amount.
            const discount = rule.apply(this.cart, this.catalog);
            totalPrice -= discount;
        }

        // Round or fix decimals if needed
        return parseFloat(totalPrice.toFixed(2));
    }
}
