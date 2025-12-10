import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { Button, Card, Input, Label, Badge } from './ui';
import { Search, Wand2, RefreshCw, Save, X, Plus, Tag, ArrowRight, CheckSquare, Square, AlertTriangle, CheckCircle, Eye } from 'lucide-react';
import { getTaxonomyId } from '../lib/taxonomy';

// --- Shared Types ---
interface ToolProps {
    selectedProducts: Product[];
    onApply: (updatedProducts: Product[]) => void;
}

// --- Product Selector Component ---
interface SelectorProps {
    products: Product[];
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
}

export const ProductTableSelector: React.FC<SelectorProps> = ({ products, selectedIds, onSelectionChange }) => {
    const [search, setSearch] = useState('');
    const filtered = products.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

    const toggleAll = () => {
        if (selectedIds.length === filtered.length) {
            onSelectionChange([]);
        } else {
            onSelectionChange(filtered.map(p => p.id));
        }
    };

    const toggleOne = (id: string) => {
        if (selectedIds.includes(id)) {
            onSelectionChange(selectedIds.filter(sid => sid !== id));
        } else {
            onSelectionChange([...selectedIds, id]);
        }
    };

    return (
        <Card className="flex flex-col h-full p-0 overflow-hidden">
            <div className="p-4 border-b border-charcoal-lighter bg-charcoal">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <Input 
                        className="pl-9" 
                        placeholder="Filter products..." 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-charcoal-lighter text-gray-400 uppercase text-xs sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-3 w-10">
                                <button onClick={toggleAll} className="flex items-center">
                                    {selectedIds.length > 0 && selectedIds.length === filtered.length 
                                        ? <CheckSquare className="w-4 h-4 text-gold" /> 
                                        : <Square className="w-4 h-4" />}
                                </button>
                            </th>
                            <th className="px-4 py-3">Product</th>
                            <th className="px-4 py-3">Category</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-charcoal-lighter">
                        {filtered.map(p => (
                            <tr key={p.id} className={`hover:bg-charcoal-lighter/30 cursor-pointer ${selectedIds.includes(p.id) ? 'bg-gold/5' : ''}`} onClick={() => toggleOne(p.id)}>
                                <td className="px-4 py-3">
                                     {selectedIds.includes(p.id) 
                                        ? <CheckSquare className="w-4 h-4 text-gold" /> 
                                        : <Square className="w-4 h-4 text-gray-600" />}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-medium text-gray-200">{p.title}</div>
                                    <div className="text-xs text-gray-500 truncate max-w-[200px]">{p.description.substring(0, 50)}...</div>
                                </td>
                                <td className="px-4 py-3 text-gray-400 text-xs">
                                    {p.categories[0]}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-2 bg-charcoal-light border-t border-charcoal-lighter text-xs text-center text-gray-500">
                {selectedIds.length} selected
            </div>
        </Card>
    );
};

// --- Tool 1: Bulk Description Editor ---
export const BulkDescriptionEditor: React.FC<ToolProps> = ({ selectedProducts, onApply }) => {
    const [mode, setMode] = useState<'append' | 'prepend' | 'replace'>('append');
    const [text, setText] = useState('');
    const [preview, setPreview] = useState<Product[]>([]);

    useEffect(() => {
        if (selectedProducts.length === 0) {
            setPreview([]);
            return;
        }

        const updated = selectedProducts.map(p => {
            let newDesc = p.description;
            const content = text.trim();
            
            if (mode === 'append' && content) {
                newDesc = p.description ? `${p.description} ${content}` : content;
            } else if (mode === 'prepend' && content) {
                newDesc = p.description ? `${content} ${p.description}` : content;
            } else if (mode === 'replace') {
                newDesc = text; // Keep raw text for replace including formatting
            }
            
            return { ...p, description: newDesc };
        });
        setPreview(updated);
    }, [selectedProducts, mode, text]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <Label>Operation</Label>
                    <select 
                        className="w-full h-10 rounded-md border border-charcoal-lighter bg-charcoal-light px-3 text-sm text-gray-100 mt-1 focus:ring-2 focus:ring-gold outline-none"
                        value={mode}
                        onChange={(e) => setMode(e.target.value as any)}
                    >
                        <option value="append">Append to End</option>
                        <option value="prepend">Prepend to Start</option>
                        <option value="replace">Replace Entirely</option>
                    </select>
                </div>
                <div className="md:col-span-2">
                    <Label>Text Content</Label>
                    <textarea 
                        className="w-full h-24 rounded-md border border-charcoal-lighter bg-charcoal-light px-3 py-2 text-sm text-gray-100 mt-1 focus:ring-2 focus:ring-gold outline-none resize-none"
                        value={text} 
                        onChange={e => setText(e.target.value)} 
                        placeholder={mode === 'replace' ? "Enter new full description..." : "Enter text to add..."}
                    />
                </div>
            </div>

            {preview.length > 0 && selectedProducts.length > 0 && (
                <Card className="bg-charcoal-light/50 border-gold/20">
                    <div className="flex justify-between items-center mb-3">
                        <Label className="mb-0 text-gold">Preview Change (First Item)</Label>
                        <span className="text-xs text-gray-500 font-mono bg-charcoal px-2 py-1 rounded">{preview[0].slug}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <span className="text-xs uppercase text-gray-500 font-bold tracking-wider">Original</span>
                            <div className="text-xs text-gray-400 p-3 bg-charcoal rounded border border-charcoal-lighter h-32 overflow-y-auto custom-scrollbar leading-relaxed">
                                {selectedProducts[0].description || <span className="italic opacity-50">Empty</span>}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs uppercase text-green-400 font-bold tracking-wider">After Update</span>
                            <div className="text-xs text-white p-3 bg-charcoal rounded border border-green-900/50 h-32 overflow-y-auto custom-scrollbar leading-relaxed">
                                {preview[0].description || <span className="italic opacity-50">Empty</span>}
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            <Button onClick={() => onApply(preview)} disabled={selectedProducts.length === 0 || !text}>
                Apply to {selectedProducts.length} Products
            </Button>
        </div>
    );
};

// --- Tool 2: SEO Rewrite Assistant ---
export const BulkSeoAssistant: React.FC<ToolProps> = ({ selectedProducts, onApply }) => {
    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const [generating, setGenerating] = useState(false);

    const generate = () => {
        setGenerating(true);
        // Simulate AI generation
        setTimeout(() => {
            const generated = selectedProducts.map(p => {
                const keyword = p.categories[0] || 'Bullion';
                return {
                    ...p,
                    seo: {
                        metaTitle: `Buy ${p.title} Online | Certified ${keyword}`,
                        metaDescription: `Secure your wealth with ${p.title}. ${p.description.substring(0, 100)}... Verified authentic and fully insured shipping by Aureus Gold Corp.`,
                        keywords: [keyword, 'Gold', 'Investment', 'Secure Storage']
                    }
                };
            });
            setSuggestions(generated);
            setGenerating(false);
        }, 1000);
    };

    const calculateDensity = (text: string, keyword: string) => {
        if (!text || !keyword) return '0';
        const normalizedText = text.toLowerCase();
        const normalizedKeyword = keyword.toLowerCase();
        // Simple exact match count
        const matches = normalizedText.split(normalizedKeyword).length - 1;
        const wordCount = text.split(/\s+/).length;
        if (wordCount === 0) return '0';
        return ((matches / wordCount) * 100).toFixed(1);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-sm text-gray-400">
                        Generates SEO-optimized titles and meta descriptions based on product content and industry standards.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Includes keyword density analysis and SERP preview.</p>
                </div>
                <Button onClick={generate} isLoading={generating} disabled={selectedProducts.length === 0}>
                    <Wand2 className="w-4 h-4 mr-2" /> Auto-Generate
                </Button>
            </div>

            {suggestions.length > 0 && (
                <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar p-1">
                    {suggestions.map((p, idx) => {
                        const primaryKeyword = p.seo?.keywords?.[0] || '';
                        const desc = p.seo?.metaDescription || '';
                        const title = p.seo?.metaTitle || '';
                        
                        const density = calculateDensity(desc, primaryKeyword);
                        const descLen = desc.length;
                        
                        // Status checks
                        const isLenOptimal = descLen >= 120 && descLen <= 160;
                        const isLenTooShort = descLen < 120;
                        const isLenTooLong = descLen > 160;
                        const isDensityGood = parseFloat(density) >= 0.5 && parseFloat(density) <= 3.0;

                        return (
                            <Card key={p.id} className="p-4 bg-charcoal border-charcoal-lighter">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="font-medium text-white">{p.title}</h4>
                                    <Badge variant={isDensityGood ? 'success' : 'default'} className="flex items-center gap-1">
                                        <Tag className="w-3 h-3" /> Kw: {primaryKeyword} ({density}%)
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Edit Side */}
                                    <div className="space-y-4 text-xs">
                                        <div>
                                            <Label>New Title</Label>
                                            <div className="text-green-400 mb-1">{title}</div>
                                            <div className="text-gray-500">{title.length} chars</div>
                                        </div>
                                        <div>
                                            <Label>New Description</Label>
                                            <div className="text-gray-300 mb-1">{desc}</div>
                                            <div className="flex items-center gap-2">
                                                <span className={`${isLenOptimal ? 'text-green-400' : isLenTooShort ? 'text-yellow-400' : 'text-red-400'} flex items-center gap-1`}>
                                                    {descLen} chars
                                                    {isLenOptimal && <CheckCircle className="w-3 h-3" />}
                                                    {(isLenTooShort || isLenTooLong) && <AlertTriangle className="w-3 h-3" />}
                                                </span>
                                                <span className="text-gray-600">|</span>
                                                <span className="text-gray-500">Target: 120-160</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SERP Preview Side */}
                                    <div>
                                        <Label className="flex items-center gap-2 text-gray-400 mb-2">
                                            <Eye className="w-3 h-3" /> Search Result Preview
                                        </Label>
                                        <div className="bg-white p-3 rounded border border-gray-300 font-sans">
                                            <div className="text-[#1a0dab] text-lg leading-snug hover:underline cursor-pointer truncate">
                                                {title || "Page Title"}
                                            </div>
                                            <div className="text-[#006621] text-xs mt-0.5">
                                                https://aureus.demo/product/{p.slug}
                                            </div>
                                            <div className="text-[#545454] text-sm leading-snug mt-1 line-clamp-2">
                                                {desc || "No description provided."}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                    <Button onClick={() => onApply(suggestions)} className="w-full">
                        Accept All Suggestions
                    </Button>
                </div>
            )}
        </div>
    );
};

// --- Tool 3: Global Find/Replace ---
export const BulkFindReplace: React.FC<ToolProps> = ({ selectedProducts, onApply }) => {
    const [findStr, setFindStr] = useState('');
    const [replaceStr, setReplaceStr] = useState('');
    const [targetField, setTargetField] = useState<'description' | 'title'>('description');
    
    const applyChanges = () => {
        if (!findStr) return;
        const regex = new RegExp(findStr, 'g'); // Simple global replace
        const updated = selectedProducts.map(p => {
            const original = String(p[targetField]);
            const modified = original.replace(regex, replaceStr);
            return { ...p, [targetField]: modified };
        });
        onApply(updated);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <Label>Find</Label>
                    <Input value={findStr} onChange={e => setFindStr(e.target.value)} />
                </div>
                <div>
                    <Label>Replace With</Label>
                    <Input value={replaceStr} onChange={e => setReplaceStr(e.target.value)} />
                </div>
                <div>
                    <Label>Target Field</Label>
                    <select 
                        className="w-full h-10 rounded-md border border-charcoal-lighter bg-charcoal-light px-3 text-sm text-gray-100 mt-1 focus:ring-2 focus:ring-gold outline-none"
                        value={targetField}
                        onChange={(e) => setTargetField(e.target.value as any)}
                    >
                        <option value="description">Description</option>
                        <option value="title">Title</option>
                    </select>
                </div>
            </div>
            <Button onClick={applyChanges} disabled={!findStr || selectedProducts.length === 0}>
                Run Find & Replace
            </Button>
        </div>
    );
};

// --- Tool 4: Bulk Badge Assignment ---
export const BulkTagManager: React.FC<ToolProps> = ({ selectedProducts, onApply }) => {
    const [tagInput, setTagInput] = useState('');
    const [operation, setOperation] = useState<'add' | 'remove'>('add');

    const handleApply = () => {
        if (!tagInput) return;
        const updated = selectedProducts.map(p => {
            const currentTags = p.tags || [];
            let newTags = [...currentTags];
            if (operation === 'add' && !currentTags.includes(tagInput)) {
                newTags.push(tagInput);
            }
            if (operation === 'remove') {
                newTags = newTags.filter(t => t !== tagInput);
            }
            return { ...p, tags: newTags };
        });
        onApply(updated);
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-4 items-end">
                <div className="flex-1">
                    <Label>Badge / Tag Name</Label>
                    <Input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="e.g. New 2025" />
                </div>
                <div className="flex-1">
                     <Label>Action</Label>
                     <div className="flex gap-2 mt-1">
                        <Button 
                            type="button" 
                            variant={operation === 'add' ? 'primary' : 'secondary'} 
                            onClick={() => setOperation('add')}
                            className="flex-1"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Add
                        </Button>
                        <Button 
                            type="button" 
                            variant={operation === 'remove' ? 'danger' : 'secondary'} 
                            onClick={() => setOperation('remove')}
                            className="flex-1"
                        >
                            <X className="w-4 h-4 mr-2" /> Remove
                        </Button>
                     </div>
                </div>
            </div>
            <Button onClick={handleApply} disabled={!tagInput || selectedProducts.length === 0} className="w-full">
                {operation === 'add' ? 'Assign Badge' : 'Remove Badge'} to Selection
            </Button>
        </div>
    );
};

// --- Tool 5: Bulk Categories ---
export const BulkCategoryManager: React.FC<ToolProps> = ({ selectedProducts, onApply }) => {
    const [category, setCategory] = useState('');
    
    const handleApply = () => {
        if (!category) return;
        const updated = selectedProducts.map(p => {
             // Logic: Replace primary category, move old primary to secondary? 
             // Simplification: Just replace list with new category for "Reassign" behavior
             return { 
                 ...p, 
                 categories: [category],
                 taxonomyIdOverride: undefined // Reset override if category changes, or set based on mapping logic
             };
        });
        onApply(updated);
    };

    const taxonomyId = getTaxonomyId(category);

    return (
        <div className="space-y-6">
            <div>
                <Label>Reassign to Category</Label>
                <div className="flex gap-4 mt-1">
                    <Input 
                        value={category} 
                        onChange={e => setCategory(e.target.value)} 
                        placeholder="e.g. Gold Coins" 
                        className="flex-1"
                    />
                </div>
                {category && (
                    <div className="mt-2 text-xs text-gray-400 flex items-center gap-2">
                        <ArrowRight className="w-3 h-3" />
                        Will map to Google Taxonomy ID: <span className="text-gold font-mono">{taxonomyId}</span>
                    </div>
                )}
            </div>
            <Button onClick={handleApply} disabled={!category || selectedProducts.length === 0}>
                Reassign Categories
            </Button>
        </div>
    );
};