import React, { useState, useEffect } from 'react';
import { Product, Variant, SeoSettings } from '../types';
import { Button, Input, Label, Card } from './ui';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2, Save, X, ImageIcon, Globe } from 'lucide-react';
import { MediaLibrary } from './MediaLibrary';
import { SeoEditor } from './SeoEditor';

interface ProductAdminFormProps {
    initialProduct?: Product;
    onSave: (product: Product) => void;
    onCancel: () => void;
}

const EMPTY_VARIANT: Variant = {
    id: '',
    sku: '',
    name: '1 oz',
    weight: 31.1,
    purity: 99.99,
    mint: '',
    year: new Date().getFullYear(),
    price: 0,
    stock: 0
};

export const ProductAdminForm: React.FC<ProductAdminFormProps> = ({ initialProduct, onSave, onCancel }) => {
    const [product, setProduct] = useState<Product>(initialProduct || {
        id: '',
        title: '',
        slug: '',
        description: '',
        categories: [],
        images: [],
        variants: [],
        seo: {}
    });
    const [showMedia, setShowMedia] = useState(false);
    const [showSeo, setShowSeo] = useState(false);
    const [categoryInput, setCategoryInput] = useState('');

    useEffect(() => {
        if (!initialProduct && !product.id) {
            // Initialize new product with one variant
            setProduct(p => ({
                ...p, 
                id: uuidv4(),
                variants: [{ ...EMPTY_VARIANT, id: uuidv4() }]
            }));
        }
    }, [initialProduct]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(product);
    };

    const updateVariant = (index: number, field: keyof Variant, value: any) => {
        const newVariants = [...product.variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setProduct({ ...product, variants: newVariants });
    };

    const addVariant = () => {
        setProduct({
            ...product,
            variants: [...product.variants, { ...EMPTY_VARIANT, id: uuidv4() }]
        });
    };

    const removeVariant = (index: number) => {
        const newVariants = product.variants.filter((_, i) => i !== index);
        setProduct({ ...product, variants: newVariants });
    };

    const addCategory = () => {
        if (categoryInput && !product.categories.includes(categoryInput)) {
            setProduct({ ...product, categories: [...product.categories, categoryInput] });
            setCategoryInput('');
        }
    };

    const removeCategory = (cat: string) => {
        setProduct({ ...product, categories: product.categories.filter(c => c !== cat) });
    };

    const addImage = (url: string) => {
        setProduct({ ...product, images: [...product.images, url] });
        setShowMedia(false);
    };

    const removeImage = (index: number) => {
        setProduct({ ...product, images: product.images.filter((_, i) => i !== index) });
    };

    const saveSeo = (settings: SeoSettings) => {
        setProduct({ ...product, seo: settings });
        setShowSeo(false);
    };

    return (
        <form onSubmit={handleSave} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <h3 className="text-white font-medium mb-4 border-b border-charcoal-lighter pb-2">Basic Information</h3>
                        <div className="space-y-4">
                            <div>
                                <Label>Title</Label>
                                <Input 
                                    required 
                                    value={product.title} 
                                    onChange={e => setProduct({ ...product, title: e.target.value })} 
                                />
                            </div>
                            <div>
                                <Label>Slug</Label>
                                <Input 
                                    required 
                                    value={product.slug} 
                                    onChange={e => setProduct({ ...product, slug: e.target.value })} 
                                />
                            </div>
                            <div>
                                <Label>Description</Label>
                                <textarea 
                                    className="w-full h-32 bg-charcoal-lighter border border-charcoal-lighter rounded p-2 text-sm text-gray-300 focus:border-gold outline-none"
                                    value={product.description}
                                    onChange={e => setProduct({ ...product, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex justify-between items-center mb-4 border-b border-charcoal-lighter pb-2">
                            <h3 className="text-white font-medium">Variants</h3>
                            <Button type="button" size="sm" variant="secondary" onClick={addVariant}>
                                <Plus className="w-4 h-4 mr-2" /> Add Variant
                            </Button>
                        </div>
                        <div className="space-y-6">
                            {product.variants.map((variant, idx) => (
                                <div key={variant.id} className="p-4 bg-charcoal rounded border border-charcoal-lighter relative group">
                                    <button 
                                        type="button" 
                                        className="absolute top-2 right-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => removeVariant(idx)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        <div className="col-span-2">
                                            <Label>Variant Name</Label>
                                            <Input value={variant.name} onChange={e => updateVariant(idx, 'name', e.target.value)} placeholder="1 oz" />
                                        </div>
                                        <div className="col-span-2">
                                            <Label>SKU</Label>
                                            <Input value={variant.sku} onChange={e => updateVariant(idx, 'sku', e.target.value)} />
                                        </div>
                                        <div>
                                            <Label>Price (USD)</Label>
                                            <Input type="number" step="0.01" value={variant.price} onChange={e => updateVariant(idx, 'price', parseFloat(e.target.value))} />
                                        </div>
                                        <div>
                                            <Label>Stock</Label>
                                            <Input type="number" value={variant.stock} onChange={e => updateVariant(idx, 'stock', parseInt(e.target.value))} />
                                        </div>
                                        <div>
                                            <Label>Weight (g)</Label>
                                            <Input type="number" step="0.0001" value={variant.weight} onChange={e => updateVariant(idx, 'weight', parseFloat(e.target.value))} />
                                        </div>
                                        <div>
                                            <Label>Purity (%)</Label>
                                            <Input type="number" step="0.01" value={variant.purity} onChange={e => updateVariant(idx, 'purity', parseFloat(e.target.value))} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Mint</Label>
                                            <Input value={variant.mint || ''} onChange={e => updateVariant(idx, 'mint', e.target.value)} />
                                        </div>
                                        <div>
                                            <Label>Year</Label>
                                            <Input type="number" value={variant.year || ''} onChange={e => updateVariant(idx, 'year', parseInt(e.target.value))} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card>
                        <h3 className="text-white font-medium mb-4">Organization</h3>
                        <div className="space-y-4">
                            <div>
                                <Label>Categories</Label>
                                <div className="flex gap-2 mb-2">
                                    <Input 
                                        value={categoryInput} 
                                        onChange={e => setCategoryInput(e.target.value)} 
                                        placeholder="Add category..."
                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                                    />
                                    <Button type="button" variant="secondary" onClick={addCategory}>Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {product.categories.map(cat => (
                                        <span key={cat} className="text-xs bg-charcoal border border-charcoal-lighter text-gray-300 px-2 py-1 rounded flex items-center gap-1">
                                            {cat}
                                            <button type="button" onClick={() => removeCategory(cat)} className="hover:text-red-400"><X className="w-3 h-3"/></button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="text-white font-medium mb-4">Media</h3>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {product.images.map((img, idx) => (
                                <div key={idx} className="aspect-square relative group bg-charcoal rounded overflow-hidden border border-charcoal-lighter">
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                    <button 
                                        type="button" 
                                        className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                        onClick={() => removeImage(idx)}
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            <button 
                                type="button"
                                className="aspect-square border-2 border-dashed border-charcoal-lighter rounded flex flex-col items-center justify-center text-gray-500 hover:text-gold hover:border-gold transition-colors"
                                onClick={() => setShowMedia(true)}
                            >
                                <ImageIcon className="w-6 h-6 mb-1" />
                                <span className="text-xs">Add Image</span>
                            </button>
                        </div>
                    </Card>
                    
                    <Card>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-white font-medium">Search Engine Optimization</h3>
                            {product.seo?.metaTitle && <Globe className="w-4 h-4 text-green-400" />}
                        </div>
                        <p className="text-xs text-gray-500 mb-4">Edit how this product appears in Google search results and social shares.</p>
                        <Button type="button" variant="secondary" className="w-full" onClick={() => setShowSeo(true)}>
                            {product.seo?.metaTitle ? 'Edit SEO Metadata' : 'Configure SEO'}
                        </Button>
                    </Card>

                    <div className="flex flex-col gap-3">
                        <Button type="submit" size="lg" className="w-full">
                            <Save className="w-4 h-4 mr-2" /> Save Product
                        </Button>
                        <Button type="button" variant="outline" className="w-full" onClick={onCancel}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>

            {/* Media Selector Modal */}
            {showMedia && (
                <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-8">
                    <div className="bg-charcoal-light w-full max-w-4xl h-[80vh] rounded-lg border border-charcoal-lighter flex flex-col shadow-2xl">
                        <div className="p-4 border-b border-charcoal-lighter flex justify-between items-center">
                            <h3 className="text-white font-serif text-xl">Select Image</h3>
                            <button onClick={() => setShowMedia(false)} className="text-gray-500 hover:text-white"><X/></button>
                        </div>
                        <div className="flex-1 overflow-hidden p-4">
                            <MediaLibrary onSelect={addImage} />
                        </div>
                    </div>
                </div>
            )}

            {/* SEO Editor Modal */}
            {showSeo && (
                <SeoEditor 
                    initialSettings={product.seo} 
                    onSave={saveSeo} 
                    onCancel={() => setShowSeo(false)}
                    titleOverride={product.title}
                    descOverride={product.description.slice(0, 160)}
                />
            )}
        </form>
    );
};
