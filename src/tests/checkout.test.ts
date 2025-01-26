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
        it('applies multiple rules to same SKU correctly', () => {
            const rules: PricingRule[] = [
                new BulkDiscountRule('atv', 5, 90.00),
                new BuyXPayYRule('atv', 3, 2)
            ];
            const checkout = new Checkout(rules);

            for (let i = 0; i < 6; i++) checkout.scan('atv');

            assert.strictEqual(checkout.total(), 321.00);
        });

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
        it('handles decimal rounding correctly', () => {
            const mockRule: PricingRule = {
                apply: () => 10.555 // Mock rule returning uneven discount
            };
            const checkout = new Checkout([mockRule]);
            checkout.scan('vga');

            assert.strictEqual(checkout.total(), 19.45);
        });

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
});
