import { Product, Variant } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { getTaxonomyId } from './taxonomy';

// Helper to slugify text
const slugify = (text: string): string => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-');  // Replace multiple - with single -
};

// Generate a unique slug based on title and existing products
const generateUniqueSlug = (title: string, existingProducts: Product[]): string => {
    let slug = slugify(title);
    let counter = 1;
    const originalSlug = slug;

    while (existingProducts.some(p => p.slug === slug)) {
        slug = `${originalSlug}-${counter}`;
        counter++;
    }
    return slug;
};

// Generate a SKU if missing based on variant attributes
const generateSku = (variant: Partial<Variant>, productSlug: string): string => {
    if (variant.sku) return variant.sku;
    
    const parts = [
        variant.mint ? slugify(variant.mint).toUpperCase() : 'GEN',
        variant.weight ? `${variant.weight}G` : '',
        variant.year ? variant.year : '',
        slugify(variant.name || '').toUpperCase().slice(0, 3)
    ].filter(Boolean);

    if (parts.length < 2) {
        // Fallback to random string if not enough info
        return `${productSlug.toUpperCase().slice(0, 3)}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    }

    return parts.join('-');
};

export const processIngestData = (
    jsonInput: string, 
    existingProducts: Product[]
): { products: Product[], errors: string[] } => {
    const products: Product[] = [];
    const errors: string[] = [];

    let rawData: any[];

    try {
        const parsed = JSON.parse(jsonInput);
        rawData = Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
        return { products: [], errors: ['Invalid JSON format. Please check your syntax.'] };
    }

    rawData.forEach((item, index) => {
        // Validation
        if (!item.title) {
            errors.push(`Item at index ${index} is missing a title.`);
            return;
        }

        const id = uuidv4();
        // Determine Slug
        const slug = item.slug || generateUniqueSlug(item.title, [...existingProducts, ...products]);

        // Map Categories
        let categories: string[] = [];
        if (Array.isArray(item.categories)) {
            categories = item.categories;
        } else if (typeof item.categories === 'string') {
            categories = [item.categories];
        } else {
            categories = ['Uncategorized'];
        }

        // Process Variants
        const variants: Variant[] = Array.isArray(item.variants) ? item.variants.map((v: any) => {
            const variantId = uuidv4();
            return {
                id: variantId,
                name: v.name || `${v.weight}g`,
                weight: Number(v.weight) || 0,
                purity: Number(v.purity) || 99.99,
                mint: v.mint || '',
                year: Number(v.year) || new Date().getFullYear(),
                price: Number(v.price) || 0,
                stock: Number(v.stock) || 0,
                sku: generateSku(v, slug)
            };
        }) : [];

        // If no variants provided, create a default one
        if (variants.length === 0) {
            variants.push({
                id: uuidv4(),
                sku: `${slug.toUpperCase().slice(0, 6)}-001`,
                name: 'Standard',
                weight: 0,
                purity: 99.99,
                price: 0,
                stock: 0
            });
        }

        const product: Product = {
            id,
            title: item.title,
            slug,
            description: item.description || '',
            categories,
            images: Array.isArray(item.images) ? item.images : [],
            variants
        };

        products.push(product);
    });

    return { products, errors };
};
