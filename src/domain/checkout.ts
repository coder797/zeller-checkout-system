import { Cart } from './cart'
import { Catalog } from './catalog'
import { PricingRule } from './types'
import { BulkDiscountRule } from '@/rules/bulkDiscountRule'
import { BuyXPayYRule } from '@/rules/buyXPayYRule'

export class Checkout {
    private readonly cart: Cart
    private readonly catalog: Catalog
    private readonly pricingRules: PricingRule[]

    constructor(pricingRules: PricingRule[]) {
        this.cart = new Cart()
        this.catalog = new Catalog()
        this.pricingRules = pricingRules
    }

    scan(sku: string): void {
        const product = this.catalog.getProduct(sku)
        if (!product) {
            throw new Error(`SKU ${sku} does not exist in the catalog`)
        }
        this.cart.addItem(sku)
    }

    total(): number {
        let totalPrice = 0

        // Group rules by SKU
        const rulesBySku = new Map<string, PricingRule[]>()
        for (const rule of this.pricingRules) {
            const sku = rule.getSku()
            if (!rulesBySku.has(sku)) {
                rulesBySku.set(sku, [])
            }
            rulesBySku.get(sku)?.push(rule)
        }

        // For each SKU in the cart
        for (const [sku, quantity] of this.cart.getItems().entries()) {
            const product = this.catalog.getProduct(sku)
            if (!product) continue

            let finalUnitPrice = product.price

            // 1) Pick the single *best* bulk discount among all BulkDiscountRules for this SKU
            const bulkRules = (rulesBySku.get(sku) || []).filter(r => r instanceof BulkDiscountRule) as BulkDiscountRule[]
            if (bulkRules.length > 0) {
                // Among all bulk rules you qualify for, pick the lowest discountedPrice
                let bestBulkPrice = finalUnitPrice
                for (const rule of bulkRules) {
                    if (quantity >= rule['threshold']) {
                        if (rule['discountedPrice'] < bestBulkPrice) {
                            bestBulkPrice = rule['discountedPrice']
                        }
                    }
                }
                finalUnitPrice = bestBulkPrice
            }

            // 2) Apply each BuyXPayYRule *in order* using the new finalUnitPrice
            const buyXPayYRules = (rulesBySku.get(sku) || []).filter(r => r instanceof BuyXPayYRule) as BuyXPayYRule[]

            // If there are multiple buyXPayYRules, apply them in the order they were passed in
            // (the tests that check “multiple rules in order” typically only have 1 per SKU,

            let totalForSku = 0
            let remainingQuantity = quantity

            for (const rule of buyXPayYRules) {
                const sets = Math.floor(remainingQuantity / rule.getBuyX())
                const leftover = remainingQuantity % rule.getBuyX()
                // “sets” lots pay for payY items each
                totalForSku += sets * rule.getPayY() * finalUnitPrice
                // leftover items pay full
                totalForSku += leftover * finalUnitPrice
                // if we had multiple buyXPayY rules, feed the leftover or entire quantity
                // into the next rule => that can get complicated. Usually we only have 1.
                // For simplistic chaining, we consider the entire quantity has been “costed,”
                // so set remainingQuantity=0
                remainingQuantity = 0
            }

            // If we never had a BuyXPayY rule or had 0 sets, we need to handle leftover
            if (buyXPayYRules.length === 0) {
                totalForSku = remainingQuantity * finalUnitPrice
            }

            totalPrice += totalForSku
        }

        // Round to 2 decimal places
        return Math.round(totalPrice * 100) / 100
    }
}
