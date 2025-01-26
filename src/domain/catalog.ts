import {DEFAULT_CATALOG_DATA} from "@/constants/constants";
import {CatalogError, Product} from './types';

export class Catalog {
    private readonly products: Map<string, Product>;

    constructor(productData?: readonly Product[]) {
        this.products = new Map<string, Product>();
        this.initializeCatalog(productData);
    }

    private initializeCatalog(productData?: readonly Product[]): void {
        const dataToUse = productData || DEFAULT_CATALOG_DATA;

        try {
            dataToUse.forEach(this.validateAndAddProduct.bind(this));
        } catch (error) {
            if (error instanceof Error) {
                throw new CatalogError(`Failed to initialize catalog: ${error.message}`);
            } else {
                throw new CatalogError('Failed to initialize catalog: Unknown error');
            }
        }
    }

    public getProduct(sku: string): Product | undefined {
        if (!sku) {
            throw new CatalogError('SKU cannot be empty');
        }
        return this.products.get(sku);
    }


    public addProduct(sku: string, name: string, price: number): Product {
        this.validateProductData(sku, name, price);

        if (this.products.has(sku)) {
            throw new CatalogError(`Product with SKU ${sku} already exists in catalog`);
        }

        const newProduct: Product = { sku, name, price };
        return this.validateAndAddProduct(newProduct);
    }


    private validateProductData(sku: string, name: string, price: number): void {
        if (!sku) throw new CatalogError('SKU cannot be empty');
        if (!name) throw new CatalogError('Product name cannot be empty');
        if (price < 0) throw new CatalogError('Price cannot be negative');
    }


    private validateAndAddProduct(product: Product): Product {
        this.validateProductData(product.sku, product.name, product.price);
        this.products.set(product.sku, product);
        return product;
    }


    public get size(): number {
        return this.products.size;
    }


    public hasProduct(sku: string): boolean {
        return this.products.has(sku);
    }
}
