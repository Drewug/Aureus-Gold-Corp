import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { Card, Label, Input, Button } from './ui';
import { Search, Filter, X } from 'lucide-react';

interface ProductListProps {
    products: Product[];
    title?: string;
}

export const ProductList: React.FC<ProductListProps> = ({ products, title = "Catalog" }) => {
    const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
    
    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [minPurity, setMinPurity] = useState<number>(0);
    const [selectedMint, setSelectedMint] = useState<string>('');

    // Derived Data for Filter Options
    const allCategories = Array.from(new Set(products.flatMap(p => p.categories))) as string[];
    const allMints = Array.from(new Set(products.flatMap(p => p.variants.map(v => v.mint).filter(Boolean) as string[])));

    useEffect(() => {
        let result = products;

        // Search
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(p => 
                p.title.toLowerCase().includes(lower) || 
                p.description.toLowerCase().includes(lower) ||
                p.variants.some(v => v.sku.toLowerCase().includes(lower))
            );
        }

        // Categories
        if (selectedCategories.length > 0) {
            result = result.filter(p => p.categories.some(c => selectedCategories.includes(c)));
        }

        // Purity (Check if any variant matches)
        if (minPurity > 0) {
            result = result.filter(p => p.variants.some(v => v.purity >= minPurity));
        }

        // Mint
        if (selectedMint) {
            result = result.filter(p => p.variants.some(v => v.mint === selectedMint));
        }

        setFilteredProducts(result);
    }, [products, searchTerm, selectedCategories, minPurity, selectedMint]);

    const toggleCategory = (cat: string) => {
        setSelectedCategories(prev => 
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategories([]);
        setMinPurity(0);
        setSelectedMint('');
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-64 space-y-6 flex-shrink-0">
                <div className="lg:sticky lg:top-24 space-y-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        <Input 
                            placeholder="Search catalog..." 
                            className="pl-9" 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="space-y-3">
                        <Label>Categories</Label>
                        <div className="space-y-2">
                            {allCategories.map(cat => (
                                <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedCategories.includes(cat) ? 'bg-gold border-gold' : 'border-charcoal-lighter bg-charcoal group-hover:border-gray-500'}`}>
                                        {selectedCategories.includes(cat) && <X className="w-3 h-3 text-charcoal" />}
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        className="hidden" 
                                        checked={selectedCategories.includes(cat)}
                                        onChange={() => toggleCategory(cat)}
                                    />
                                    <span className={`text-sm ${selectedCategories.includes(cat) ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>{cat}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label>Min Purity (%)</Label>
                        <input 
                            type="range" 
                            min="90" 
                            max="100" 
                            step="0.1" 
                            value={minPurity || 90} 
                            onChange={e => setMinPurity(parseFloat(e.target.value))}
                            className="w-full accent-gold h-1 bg-charcoal-lighter rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>90%</span>
                            <span className="text-gold font-mono">{minPurity > 0 ? minPurity + '%' : 'Any'}</span>
                            <span>100%</span>
                        </div>
                    </div>

                     {allMints.length > 0 && (
                        <div className="space-y-3">
                            <Label>Mint</Label>
                            <select 
                                className="w-full bg-charcoal-light border border-charcoal-lighter rounded p-2 text-sm text-gray-300 focus:border-gold outline-none"
                                value={selectedMint}
                                onChange={e => setSelectedMint(e.target.value)}
                            >
                                <option value="">All Mints</option>
                                {allMints.map(mint => (
                                    <option key={mint} value={mint}>{mint}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <Button variant="secondary" size="sm" onClick={clearFilters} className="w-full">
                        Reset Filters
                    </Button>
                </div>
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-serif text-white">{title} <span className="text-gray-500 text-lg font-sans">({filteredProducts.length})</span></h2>
                    <div className="text-sm text-gray-500">
                        Showing all results
                    </div>
                </div>

                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-charcoal-light border border-charcoal-lighter rounded-lg p-12 text-center">
                        <Filter className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl text-white mb-2">No products found</h3>
                        <p className="text-gray-500">Try adjusting your search or filters.</p>
                        <Button variant="outline" className="mt-4" onClick={clearFilters}>Clear Filters</Button>
                    </div>
                )}
            </div>
        </div>
    );
};