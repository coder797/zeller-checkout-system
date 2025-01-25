import {PricingRule} from "../domain/types";
import {Cart} from "../domain/cart";
import {Catalog} from "../domain/catalog";

export class BuyXPayYRule implements PricingRule {
    constructor(
        private readonly sku: string,
        private readonly buyX: number,
        private readonly payY: number
    ) {
        this.sku = sku;
        this.buyX = buyX;
        this.payY = payY;
    }

    apply(cart: Cart, catalog: Catalog): number {
        const quantity = cart.getItemCount(this.sku);
        const dealCount = Math.floor(quantity / this.buyX);
        return dealCount * (this.buyX - this.payY) * catalog.getProduct(this.sku)!.price;
    }
}
