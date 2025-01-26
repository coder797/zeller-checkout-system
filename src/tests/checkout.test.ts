import { describe, it } from 'node:test';
import assert from 'node:assert';
import { PricingRule } from "@/domain/types";
import { BulkDiscountRule } from "@/rules/bulkDiscountRule";
import { Checkout } from "@/domain/checkout";
import { BuyXPayYRule } from "@/rules/buyXPayYRule";

describe('Checkout', () => {
    describe('Empty Cart', () => {
        it('should return 0 when no items are scanned', () => {
            const checkout = new Checkout([]);
            assert.strictEqual(checkout.total(), 0);
        });
    });

    describe('Invalid SKU Handling', () => {
        it('should throw error when scanning invalid SKU', () => {
            const checkout = new Checkout([]);
            assert.throws(() => checkout.scan('invalid_sku'), /SKU invalid_sku does not exist/);
        });
    });

    describe('Bulk Discount Rule', () => {
        it('applies discount when meeting exact threshold', () => {
            const rules: PricingRule[] = [new BulkDiscountRule('ipd', 4, 499.99)];
            const checkout = new Checkout(rules);

            for (let i = 0; i < 4; i++) checkout.scan('ipd');

            assert.strictEqual(checkout.total(), 1999.96);
        });

        it('no discount when below threshold', () => {
            const rules: PricingRule[] = [new BulkDiscountRule('ipd', 4, 499.99)];
            const checkout = new Checkout(rules);

            checkout.scan('ipd');
            checkout.scan('ipd');

            assert.strictEqual(checkout.total(), 549.99 * 2);
        });
    });

    describe('Buy X Pay Y Rule', () => {
        it('applies discount for exact multiple quantities', () => {
            const rules: PricingRule[] = [new BuyXPayYRule('atv', 3, 2)];
            const checkout = new Checkout(rules);

            for (let i = 0; i < 3; i++) checkout.scan('atv');

            assert.strictEqual(checkout.total(), 2 * 109.50);
        });

        it('applies partial discount for excess quantities', () => {
            const rules: PricingRule[] = [new BuyXPayYRule('atv', 3, 2)];
            const checkout = new Checkout(rules);

            for (let i = 0; i < 5; i++) checkout.scan('atv');

            assert.strictEqual(checkout.total(), (2 * 109.50) + (2 * 109.50));
        });
    });

    describe('Rule Interactions', () => {
        it('applies different rules to different SKUs', () => {
            const rules: PricingRule[] = [
                new BuyXPayYRule('atv', 3, 2),
                new BulkDiscountRule('ipd', 4, 499.99)
            ];
            const checkout = new Checkout(rules);

            for (let i = 0; i < 3; i++) checkout.scan('atv');
            for (let i = 0; i < 5; i++) checkout.scan('ipd');

            assert.strictEqual(checkout.total(), (2 * 109.50) + (5 * 499.99));
        });
    });

    describe('Edge Cases', () => {
        it('ignores rules for missing products', () => {
            const rules: PricingRule[] = [
                new BulkDiscountRule('mbp', 1, 1000),
                new BuyXPayYRule('mbp', 1, 0)
            ];
            const checkout = new Checkout(rules);

            assert.strictEqual(checkout.total(), 0);
        });
    });

    describe('Cart Integrity', () => {
        it('correctly tracks multiple scans', () => {
            const checkout = new Checkout([]);

            checkout.scan('atv');
            checkout.scan('atv');
            checkout.scan('ipd');

            assert.strictEqual(checkout.total(), (2 * 109.50) + 549.99);
        });
    });

    describe('Multiple Item Scanning', () => {
        it('handles alternating product scans correctly', () => {
            const rules: PricingRule[] = [
                new BuyXPayYRule('atv', 3, 2),
                new BulkDiscountRule('ipd', 4, 499.99)
            ];
            const checkout = new Checkout(rules);

            checkout.scan('atv');
            checkout.scan('ipd');
            checkout.scan('atv');
            checkout.scan('ipd');
            checkout.scan('atv');
            checkout.scan('ipd');

            assert.strictEqual(checkout.total(), (2 * 109.50) + (3 * 549.99));
        });

        it('handles scanning same item multiple times with mixed rules', () => {
            const rules: PricingRule[] = [
                new BuyXPayYRule('atv', 3, 2),
                new BulkDiscountRule('atv', 5, 99.00)
            ];
            const checkout = new Checkout(rules);

            for (let i = 0; i < 7; i++) {
                checkout.scan('atv');
            }

            // Should apply both the 3-for-2 deal and bulk discount
            assert.strictEqual(checkout.total(), (7 * 99.00) - (2 * 99.00));
        });
    });

    describe('Complex Rule Combinations', () => {
        it('applies multiple rules in correct order', () => {
            const rules: PricingRule[] = [
                new BuyXPayYRule('vga', 2, 1),
                new BulkDiscountRule('vga', 4, 25.00)
            ];
            const checkout = new Checkout(rules);

            for (let i = 0; i < 4; i++) {
                checkout.scan('vga');
            }

            // Should apply bulk discount first, then buy-one-get-one
            assert.strictEqual(checkout.total(), 2 * 25.00);
        });

        it('handles mixed cart with multiple discounts', () => {
            const rules: PricingRule[] = [
                new BuyXPayYRule('atv', 3, 2),
                new BulkDiscountRule('ipd', 4, 499.99),
                new BuyXPayYRule('vga', 2, 1)
            ];
            const checkout = new Checkout(rules);

            // Add 3 ATVs (3-for-2 deal)
            for (let i = 0; i < 3; i++) checkout.scan('atv');
            // Add 4 iPads (bulk discount)
            for (let i = 0; i < 4; i++) checkout.scan('ipd');
            // Add 2 VGA adapters (buy-one-get-one)
            for (let i = 0; i < 2; i++) checkout.scan('vga');

            const expected = (2 * 109.50) + (4 * 499.99) + 30.00;
            assert.strictEqual(checkout.total(), expected);
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('handles zero quantity items with rules', () => {
            const rules: PricingRule[] = [
                new BulkDiscountRule('ipd', 1, 499.99)
            ];
            const checkout = new Checkout(rules);
            assert.strictEqual(checkout.total(), 0);
        });

        it('handles scanning same item repeatedly', () => {
            const checkout = new Checkout([]);
            for (let i = 0; i < 1000; i++) {
                checkout.scan('vga');
            }
            assert.strictEqual(checkout.total(), 1000 * 30.00);
        });

        it('maintains price precision for fractional quantities', () => {
            const rules: PricingRule[] = [
                new BuyXPayYRule('atv', 3, 2)
            ];
            const checkout = new Checkout(rules);

            for (let i = 0; i < 7; i++) {
                checkout.scan('atv');
            }

            // 7 items with 3-for-2 deal should result in paying for 5 items
            assert.strictEqual(checkout.total(), 5 * 109.50);
        });
    });

    describe('Rule Priority and Ordering', () => {
        it('applies most beneficial discount when rules overlap', () => {
            const rules: PricingRule[] = [
                new BulkDiscountRule('ipd', 3, 520.00),
                new BulkDiscountRule('ipd', 5, 499.99)
            ];
            const checkout = new Checkout(rules);

            for (let i = 0; i < 5; i++) {
                checkout.scan('ipd');
            }

            assert.strictEqual(checkout.total(), 5 * 499.99);
        });
    });

    describe('example Scenario Tests', () => {
        it('scenario 1: handles 3 ATVs and 1 VGA adapter', () => {
            const rules: PricingRule[] = [
                new BuyXPayYRule('atv', 3, 2)
            ];
            const checkout = new Checkout(rules);

            // Scan items
            checkout.scan('atv');
            checkout.scan('atv');
            checkout.scan('atv');
            checkout.scan('vga');

            assert.strictEqual(checkout.total(), 249.00);
        });

        it('scenario 2: handles 2 ATVs and 5 iPads', () => {
            const rules: PricingRule[] = [
                new BuyXPayYRule('atv', 3, 2),
                new BulkDiscountRule('ipd', 4, 499.99)
            ];
            const checkout = new Checkout(rules);

            // Scan items in given order
            checkout.scan('atv');
            checkout.scan('ipd');
            checkout.scan('ipd');
            checkout.scan('atv');
            checkout.scan('ipd');
            checkout.scan('ipd');
            checkout.scan('ipd');

            assert.strictEqual(checkout.total(), 2718.95);
        });
    });
});
