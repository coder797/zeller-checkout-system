import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Cart } from '@/domain/cart';
import { ProductNotFoundError } from '@/domain/types';

describe('Cart', () => {
    describe('Basic Operations', () => {
        it('should start empty', () => {
            const cart = new Cart();
            assert.strictEqual(cart.getItems().size, 0);
        });

        it('should add item and increment quantity', () => {
            const cart = new Cart();
            cart.addItem('ipd');
            cart.addItem('ipd');
            assert.strictEqual(cart.getItemCount('ipd'), 2);
        });

        it('should return 0 for non-existent items', () => {
            const cart = new Cart();
            assert.strictEqual(cart.getItemCount('nonexistent'), 0);
        });
    });

    describe('Error Handling', () => {
        it('should throw ProductNotFoundError for empty SKU', () => {
            const cart = new Cart();
            assert.throws(
                () => cart.addItem(''),
                ProductNotFoundError
            );
        });
    });

    describe('Cart State Management', () => {
        it('should maintain separate quantities for different items', () => {
            const cart = new Cart();
            cart.addItem('ipd');
            cart.addItem('mbp');
            cart.addItem('ipd');
            
            assert.strictEqual(cart.getItemCount('ipd'), 2);
            assert.strictEqual(cart.getItemCount('mbp'), 1);
        });

        it('should return a new map instance from getItems', () => {
            const cart = new Cart();
            cart.addItem('ipd');
            
            const items1 = cart.getItems();
            const items2 = cart.getItems();
            
            assert.notStrictEqual(items1, items2);
            assert.deepStrictEqual(items1, items2);
        });
    });
}); 