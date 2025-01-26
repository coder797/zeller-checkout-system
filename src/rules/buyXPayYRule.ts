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

    apply(quantity: number, unitPrice: number, currentTotal: number): number {
        const sets = Math.floor(quantity / this.buyX);
        const remainder = quantity % this.buyX;
        return (sets * this.payY + remainder) * unitPrice;
    }

    getBuyX(): number {
        return this.buyX;
    }
    
    getPayY(): number {
        return this.payY;
    }
}
