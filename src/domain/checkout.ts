// Checkout.ts

import { PricingRule } from './types';
import {Cart} from "@/domain/cart";
import {Catalog} from "@/domain/catalog";

export class Checkout {
    private readonly cart: Cart;
    private readonly catalog: Catalog;
    private readonly rulesBySku: Map<string, PricingRule[]>;

    constructor(pricingRules: PricingRule[]) {
        this.cart = new Cart();
        this.catalog = new Catalog();
        this.rulesBySku = this.initializeRulesBySku(pricingRules);
    }

    private initializeRulesBySku(rules: PricingRule[]): Map<string, PricingRule[]> {
        const rulesBySku = new Map<string, PricingRule[]>();

        // Group rules by SKU
        for (const rule of rules) {
            const skuRules = rulesBySku.get(rule.sku) || [];
            skuRules.push(rule);
            rulesBySku.set(rule.sku, skuRules);
        }

        // Sort rules by priority for each SKU
        for (const [sku, skuRules] of rulesBySku) {
            skuRules.sort((a, b) => a.priority - b.priority);
        }

        return rulesBySku;
    }

    scan(sku: string): void {
        const product = this.catalog.getProduct(sku);
        if (!product) {
            throw new Error(`SKU ${sku} does not exist in the catalog`);
        }
        this.cart.addItem(sku);
    }

    private applyPricingRules(sku: string, quantity: number, basePrice: number): number {
        const rules = this.rulesBySku.get(sku) || [];
        let effectiveQty = quantity;
        let effectivePrice = basePrice;

        for (const rule of rules) {
            const result = rule.apply(
                quantity,
                effectiveQty,
                effectivePrice
            );
            effectiveQty = result.quantity;
            effectivePrice = result.price;
        }

        return effectiveQty * effectivePrice;
    }

    total(): number {
        let totalPrice = 0;

        for (const [sku, quantity] of this.cart.getItems().entries()) {
            const product = this.catalog.getProduct(sku);
            if (!product) continue;

            const skuTotal = this.applyPricingRules(sku, quantity, product.price);
            totalPrice += skuTotal;
        }

        return Math.round(totalPrice * 100) / 100;
    }
}
