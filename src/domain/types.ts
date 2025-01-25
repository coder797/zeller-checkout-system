import {Cart} from "./cart";
import {Catalog} from "./catalog";

export interface PricingRule {
    apply(cart: Cart, catalog: Catalog): number;
}

export interface Product {
    sku: string;
    name: string;
    price: number;
}
