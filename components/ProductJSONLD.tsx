import React from 'react';
import { Product, Variant } from '../types';

interface ProductJSONLDProps {
    product: Product;
    selectedVariant?: Variant;
}

export const ProductJSONLD: React.FC<ProductJSONLDProps> = ({ product, selectedVariant }) => {
    const variant = selectedVariant || product.variants[0];
    const price = variant ? variant.price : 0;
    const availability = variant && variant.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
    
    const schema = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.title,
        "description": product.description,
        "image": product.images,
        "sku": variant?.sku,
        "brand": {
            "@type": "Brand",
            "name": variant?.mint || "Aureus Gold Corp"
        },
        "offers": {
            "@type": "Offer",
            "url": window.location.href,
            "priceCurrency": "USD",
            "price": price,
            "availability": availability,
            "itemCondition": "https://schema.org/NewCondition"
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
};
