import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useCurrency } from '../lib/currencyContext';
import { Card, Badge } from './ui';
import { ShieldCheck } from 'lucide-react';

interface ProductCardProps {
    product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { formatPrice } = useCurrency();
    
    // Determine logic for display: lowest price variant, or "Sold Out" if all 0 stock
    const variants = product.variants;
    const hasStock = variants.some(v => v.stock > 0);
    const minPrice = variants.length > 0 ? Math.min(...variants.map(v => v.price)) : 0;
    const displayImage = product.images.length > 0 ? product.images[0] : 'https://placehold.co/400x400/1a1a1c/d4af37?text=No+Image';

    return (
        <Link to={`/product/${product.slug}`} className="group block h-full">
            <Card className="h-full p-0 overflow-hidden border-charcoal-lighter group-hover:border-gold/50 transition-all duration-300 flex flex-col bg-charcoal-light">
                <div className="aspect-square relative overflow-hidden bg-white/5">
                    <img 
                        src={displayImage} 
                        alt={product.title} 
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" 
                    />
                    {!hasStock && (
                        <div className="absolute inset-0 bg-charcoal/80 flex items-center justify-center">
                            <span className="text-white font-serif tracking-widest uppercase border border-white px-4 py-2">Sold Out</span>
                        </div>
                    )}
                    {hasStock && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Badge variant="success" className="bg-charcoal/90 text-gold border-gold/30 backdrop-blur">
                                <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                            </Badge>
                        </div>
                    )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                    <div className="flex gap-2 mb-2 flex-wrap">
                        {product.categories.slice(0, 2).map(c => (
                            <span key={c} className="text-[10px] uppercase tracking-wider text-gold-dim border border-charcoal-lighter px-1.5 rounded">
                                {c}
                            </span>
                        ))}
                    </div>
                    <h3 className="font-serif text-lg text-white mb-2 leading-tight group-hover:text-gold transition-colors">
                        {product.title}
                    </h3>
                    
                    <div className="mt-auto pt-4 flex items-end justify-between border-t border-charcoal-lighter/50">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500">Starting from</span>
                            <span className="font-mono text-xl text-white">{formatPrice(minPrice)}</span>
                        </div>
                        {hasStock && (
                            <span className="text-xs text-green-500 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> In Vault
                            </span>
                        )}
                    </div>
                </div>
            </Card>
        </Link>
    );
};