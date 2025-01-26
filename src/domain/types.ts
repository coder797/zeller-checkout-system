
// types.ts
export interface PricingRule {
    readonly sku: string;
    readonly priority: number;
    apply(
        originalQuantity: number,
        currentQuantity: number,
        currentPrice: number
    ): { quantity: number; price: number };
}
export interface Product {
    sku: string;
    name: string;
    price: number;
}

export class CatalogError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CatalogError';
    }
}

export class ProductNotFoundError extends Error {
    constructor(sku: string) {
        super(`Product with SKU ${sku} not found in catalog.`);
        this.name = "ProductNotFoundError";
    }
}
