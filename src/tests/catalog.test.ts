import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Catalog } from '@/domain/catalog';
import { CatalogError } from '@/domain/types';
import { DEFAULT_CATALOG_DATA } from '@/constants/constants';

describe('Catalog', () => {
    describe('Initialization', () => {
        it('should initialize with default products', () => {
            const catalog = new Catalog();
            assert.strictEqual(catalog.size, DEFAULT_CATALOG_DATA.length);
        });

        it('should initialize with custom products', () => {
            const customProducts = [
                { sku: 'test1', name: 'Test 1', price: 10.00 },
                { sku: 'test2', name: 'Test 2', price: 20.00 }
            ];
            const catalog = new Catalog(customProducts);
            assert.strictEqual(catalog.size, 2);
        });
    });

    describe('Product Operations', () => {
        it('should add new product successfully', () => {
            const catalog = new Catalog([]);
            catalog.addProduct('test', 'Test Product', 99.99);
            assert.strictEqual(catalog.size, 1);
            assert.strictEqual(catalog.getProduct('test')?.price, 99.99);
        });

        it('should retrieve existing product', () => {
            const catalog = new Catalog();
            const product = catalog.getProduct('ipd');
            assert.strictEqual(product?.name, 'Super iPad');
            assert.strictEqual(product?.price, 549.99);
        });

        it('should return undefined for non-existent product', () => {
            const catalog = new Catalog();
            assert.strictEqual(catalog.getProduct('nonexistent'), undefined);
        });
    });

    describe('Validation', () => {
        it('should throw error for empty SKU', () => {
            const catalog = new Catalog();
            assert.throws(
                () => catalog.addProduct('', 'Test', 10.00),
                CatalogError
            );
        });

        it('should throw error for empty name', () => {
            const catalog = new Catalog();
            assert.throws(
                () => catalog.addProduct('test', '', 10.00),
                CatalogError
            );
        });

        it('should throw error for negative price', () => {
            const catalog = new Catalog();
            assert.throws(
                () => catalog.addProduct('test', 'Test', -10.00),
                CatalogError
            );
        });

        it('should throw error for duplicate SKU', () => {
            const catalog = new Catalog();
            catalog.addProduct('test', 'Test', 10.00);
            assert.throws(
                () => catalog.addProduct('test', 'Test 2', 20.00),
                CatalogError
            );
        });
    });
}); 