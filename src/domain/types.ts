
export interface PricingRule {
    getSku(): string;
    apply(quantity: number, unitPrice: number, currentTotal: number): number;
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
