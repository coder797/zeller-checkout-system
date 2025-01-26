import { Cart } from './cart'
import { Catalog } from './catalog'
import { PricingRule } from './types'
import { BulkDiscountRule } from '@/rules/bulkDiscountRule'
import { BuyXPayYRule } from '@/rules/buyXPayYRule'

export class Checkout {
    private readonly cart: Cart
    private readonly catalog: Catalog
    private readonly rulesBySku: Map<string, PricingRule[]>

    constructor(pricingRules: PricingRule[]) {
        this.cart = new Cart()
        this.catalog = new Catalog()
        this.rulesBySku = this.initializeRulesBySku(pricingRules)
    }

    private initializeRulesBySku(rules: PricingRule[]): Map<string, PricingRule[]> {
        const rulesBySku = new Map<string, PricingRule[]>()
        for (const rule of rules) {
            const sku = rule.getSku()
            if (!rulesBySku.has(sku)) {
                rulesBySku.set(sku, [])
            }
            rulesBySku.get(sku)?.push(rule)
        }
        return rulesBySku
    }

    scan(sku: string): void {
        const product = this.catalog.getProduct(sku)
        if (!product) {
            throw new Error(`SKU ${sku} does not exist in the catalog`)
        }
        this.cart.addItem(sku)
    }

    private applyPricingRules(sku: string, quantity: number, basePrice: number): number {
        const rules = this.rulesBySku.get(sku) || []
        if (rules.length === 0) return quantity * basePrice

        // Sort rules by type - apply BuyXPayY first, then BulkDiscount
        const sortedRules = [...rules].sort((a, b) => {
            if (a instanceof BuyXPayYRule && b instanceof BulkDiscountRule) return -1;
            if (a instanceof BulkDiscountRule && b instanceof BuyXPayYRule) return 1;
            return 0;
        });

        // First calculate effective quantity after BuyXPayY rules
        let effectiveQuantity = quantity;
        let effectiveUnitPrice = basePrice;

        for (const rule of sortedRules) {
            if (rule instanceof BuyXPayYRule) {
                const buyX = (rule as BuyXPayYRule).getBuyX();
                const payY = (rule as BuyXPayYRule).getPayY();
                const sets = Math.floor(effectiveQuantity / buyX);
                effectiveQuantity = (sets * payY) + (effectiveQuantity % buyX);
            } else if (rule instanceof BulkDiscountRule) {
                if (quantity >= (rule as BulkDiscountRule).getThreshold()) {
                    effectiveUnitPrice = (rule as BulkDiscountRule).getDiscountedPrice();
                }
            }
        }

        return effectiveQuantity * effectiveUnitPrice;
    }

    total(): number {
        let totalPrice = 0

        for (const [sku, quantity] of this.cart.getItems().entries()) {
            const product = this.catalog.getProduct(sku)
            if (!product) continue

            const skuTotal = this.applyPricingRules(sku, quantity, product.price)
            totalPrice += skuTotal
        }

        return Math.round(totalPrice * 100) / 100
    }
}
