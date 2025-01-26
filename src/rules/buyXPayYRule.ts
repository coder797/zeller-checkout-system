import {PricingRule} from "@/domain/types";

export class BuyXPayYRule implements PricingRule {
    constructor(
        private readonly sku: string,
        private readonly buyX: number,
        private readonly payY: number
    ) {}

    getSku(): string {
        return this.sku;
    }

    apply(quantity: number, unitPrice: number): number {
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
