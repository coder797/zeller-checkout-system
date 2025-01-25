export class Cart {
    private readonly items: Map<string, number>;

    constructor() {
        this.items = new Map();
    }

    /**
     * Add an item by SKU. Increments quantity if item already exists.
     */
    addItem(sku: string): void {
        if (!sku) {
            throw new Error('Invalid SKU');
        }
        const existingQty = this.items.get(sku) || 0;
        this.items.set(sku, existingQty + 1);
    }

    /**
     * Get the count of a specific SKU in the cart.
     */
    getItemCount(sku: string): number {
        return this.items.get(sku) || 0;
    }

    /**
     * Get a map of all items (read-only copy or direct reference).
     */
    getItems(): Map<string, number> {
        return new Map(this.items);
    }
}
