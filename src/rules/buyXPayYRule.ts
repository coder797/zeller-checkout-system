import {PricingRule} from "@/domain/types";
import {Cart} from "@/domain/cart";
import {Catalog} from "@/domain/catalog";

export class BuyXPayYRule implements PricingRule {
    constructor(
        private readonly sku: string,
        private readonly buyX: number,
        private readonly payY: number
    ) {}

    getSku(): string {
        return this.sku;
    }

    apply(cart: Cart, catalog: Catalog): number {
        const quantity = cart.getItemCount(this.sku);
        const dealCount = Math.floor(quantity / this.buyX);
        const product = catalog.getProduct(this.sku);
        
        if (!product) return 0;
        
        // Calculate free items based on the deal
        const freeItems = dealCount * (this.buyX - this.payY);
        
        // Return the discount amount using current price
        return freeItems * product.price;
    }

    getBuyX(): number {
        return this.buyX;
    }
    
    getPayY(): number {
        return this.payY;
    }
}
