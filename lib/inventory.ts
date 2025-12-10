import { Product, Variant } from '../types';

export const parseStockCSV = (csvText: string): { sku: string; quantity: number }[] => {
    return csvText.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
            const [sku, qty] = line.split(',').map(s => s.trim());
            const quantity = parseInt(qty, 10);
            if (!sku || isNaN(quantity)) return null;
            return { sku, quantity };
        })
        .filter((item): item is { sku: string; quantity: number } => item !== null);
};

export const getLowStockVariants = (products: Product[]): { product: Product, variant: Variant }[] => {
    const lowStockItems: { product: Product, variant: Variant }[] = [];
    products.forEach(p => {
        p.variants.forEach(v => {
            const threshold = v.lowStockThreshold ?? 5;
            if (v.stock <= threshold) {
                lowStockItems.push({ product: p, variant: v });
            }
        });
    });
    return lowStockItems;
};

export const calculateInventoryValue = (products: Product[]) => {
    return products.reduce((total, p) => {
        return total + p.variants.reduce((pt, v) => pt + (v.stock * v.price), 0);
    }, 0);
};
