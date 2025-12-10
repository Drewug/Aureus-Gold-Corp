import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { processIngestData } from '../lib/ingest';
import { getTaxonomyId } from '../lib/taxonomy';
import { Product } from '../types';
import { Button, Card, Label, Input } from './ui';
import { FileText, CheckCircle, AlertTriangle, Upload, ArrowRight, Save, Trash2, Edit2 } from 'lucide-react';

const SAMPLE_JSON = `[
  {
    "title": "Swiss Gold Bar",
    "categories": ["Gold Bars", "Bullion"],
    "description": "Premium 999.9 fine gold bar from trusted Swiss refineries.",
    "variants": [
      {
        "name": "1kg",
        "mint": "PAMP",
        "weight": 1000,
        "price": 65000,
        "stock": 5
      },
      {
        "name": "100g",
        "mint": "Valcambi",
        "weight": 100,
        "price": 6600,
        "stock": 20
      }
    ]
  }
]`;

export const AdminIngestPanel = () => {
    const [step, setStep] = useState<'input' | 'preview'>('input');
    const [jsonInput, setJsonInput] = useState('');
    const [previewProducts, setPreviewProducts] = useState<Product[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [existingProducts, setExistingProducts] = useState<Product[]>([]);

    useEffect(() => {
        // Load existing products to check for duplicates/slug collisions
        api.products.list().then(setExistingProducts);
    }, []);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setJsonInput(content);
        };
        reader.readAsText(file);
    };

    const handleProcess = () => {
        setErrors([]);
        if (!jsonInput.trim()) {
            setErrors(['Please provide JSON input.']);
            return;
        }

        const result = processIngestData(jsonInput, existingProducts);
        if (result.errors.length > 0 && result.products.length === 0) {
            setErrors(result.errors);
            return;
        }

        setPreviewProducts(result.products);
        if (result.errors.length > 0) {
            setErrors(result.errors); // Warnings
        }
        setStep('preview');
    };

    const updateProduct = (index: number, field: keyof Product, value: any) => {
        const updated = [...previewProducts];
        updated[index] = { ...updated[index], [field]: value };
        setPreviewProducts(updated);
    };

    const updateCategory = (productIndex: number, catIndex: number, value: string) => {
        const updated = [...previewProducts];
        const newCats = [...updated[productIndex].categories];
        newCats[catIndex] = value;
        updated[productIndex].categories = newCats;
        setPreviewProducts(updated);
    };

    const removeProduct = (index: number) => {
        setPreviewProducts(prev => prev.filter((_, i) => i !== index));
    };

    const handleCommit = async () => {
        setLoading(true);
        try {
            await api.products.bulkCreate(previewProducts);
            alert(`Successfully imported ${previewProducts.length} products.`);
            setStep('input');
            setJsonInput('');
            setPreviewProducts([]);
            setErrors([]);
            // Refresh existing list
            const p = await api.products.list();
            setExistingProducts(p);
        } catch (e) {
            alert("Failed to commit import.");
        } finally {
            setLoading(false);
        }
    };

    if (step === 'input') {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <Label>Paste JSON</Label>
                        <textarea 
                            className="w-full h-80 bg-charcoal-lighter border border-charcoal-light rounded p-4 font-mono text-xs text-gray-300 mt-2 focus:border-gold outline-none"
                            placeholder={SAMPLE_JSON}
                            value={jsonInput}
                            onChange={e => setJsonInput(e.target.value)}
                        />
                        <div className="mt-4 flex justify-between items-center">
                            <Button variant="outline" size="sm" onClick={() => setJsonInput(SAMPLE_JSON)}>Load Sample</Button>
                            <span className="text-xs text-gray-500">Supports arrays or single objects</span>
                        </div>
                    </Card>

                    <div className="space-y-6">
                        <Card className="border-dashed border-2 border-charcoal-lighter hover:border-gold/50 transition-colors flex flex-col items-center justify-center h-40">
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <Label className="cursor-pointer">
                                <span>Upload JSON File</span>
                                <input type="file" accept=".json" className="hidden" onChange={handleFileUpload} />
                            </Label>
                        </Card>

                        <Card>
                            <h4 className="text-white font-medium mb-3">Ingestion Rules</h4>
                            <ul className="list-disc list-inside text-sm text-gray-400 space-y-2">
                                <li>Slugs are auto-generated from Titles if missing.</li>
                                <li>Variants will generate SKUs if missing (Format: MINT-WEIGHT-YEAR).</li>
                                <li>Categories are mapped to Google Taxonomy IDs automatically.</li>
                                <li>Existing products are not overwritten (duplicates created if slug differs).</li>
                            </ul>
                        </Card>

                        {errors.length > 0 && (
                            <div className="bg-red-900/20 border border-red-900/50 p-4 rounded text-red-400 text-sm">
                                <div className="flex items-center gap-2 font-bold mb-2"><AlertTriangle className="w-4 h-4"/> Errors</div>
                                <ul className="list-disc list-inside">
                                    {errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                                    {errors.length > 5 && <li>...and {errors.length - 5} more</li>}
                                </ul>
                            </div>
                        )}
                        
                        <Button className="w-full" size="lg" onClick={handleProcess} disabled={!jsonInput.trim()}>
                            Proceed to Preview <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-serif text-white">Preview Import</h3>
                    <p className="text-gray-400 text-sm">Review data mapping before committing to database.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => setStep('input')}>Back to Input</Button>
                    <Button onClick={handleCommit} isLoading={loading}>
                        <Save className="w-4 h-4 mr-2" /> Commit {previewProducts.length} Products
                    </Button>
                </div>
            </div>

            {errors.length > 0 && (
                <div className="bg-yellow-900/20 border border-yellow-900/50 p-4 rounded text-yellow-500 text-sm">
                    <div className="flex items-center gap-2 font-bold mb-2"><AlertTriangle className="w-4 h-4"/> Warnings</div>
                     <ul className="list-disc list-inside">
                        {errors.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                </div>
            )}

            <div className="bg-charcoal border border-charcoal-lighter rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-charcoal-lighter text-gray-400 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3">Product Title & Slug</th>
                                <th className="px-4 py-3">Categories & Taxonomy</th>
                                <th className="px-4 py-3">Variants</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-charcoal-lighter">
                            {previewProducts.map((p, idx) => (
                                <tr key={idx} className="hover:bg-charcoal-lighter/30">
                                    <td className="px-4 py-4 align-top w-1/3">
                                        <div className="space-y-2">
                                            <div>
                                                <Label className="text-xs">Title</Label>
                                                <Input 
                                                    value={p.title} 
                                                    onChange={e => updateProduct(idx, 'title', e.target.value)}
                                                    className="h-8 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Slug</Label>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-gray-500 text-xs">/</span>
                                                    <Input 
                                                        value={p.slug} 
                                                        onChange={e => updateProduct(idx, 'slug', e.target.value)}
                                                        className="h-8 text-xs font-mono"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 align-top w-1/3">
                                        <div className="space-y-2">
                                            {p.categories.map((cat, cIdx) => (
                                                <div key={cIdx} className="flex gap-2 items-center">
                                                    <Input 
                                                        value={cat} 
                                                        onChange={e => updateCategory(idx, cIdx, e.target.value)}
                                                        className="h-8 text-sm"
                                                    />
                                                    <div className="text-xs text-gold border border-gold/30 px-2 py-1 rounded whitespace-nowrap" title="Google Taxonomy ID">
                                                        ID: {getTaxonomyId(cat)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 align-top">
                                        <div className="space-y-1">
                                            {p.variants.map((v, vIdx) => (
                                                <div key={v.id} className="text-xs text-gray-300 flex items-center gap-2">
                                                    <span className="font-mono text-gold-dim w-24">{v.sku}</span>
                                                    <span>{v.name}</span>
                                                    <span className="text-gray-500">({v.stock} in stock)</span>
                                                </div>
                                            ))}
                                            {p.variants.length > 3 && <div className="text-xs text-gray-500 italic">+{p.variants.length - 3} more</div>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 align-top text-right">
                                        <button onClick={() => removeProduct(idx)} className="text-gray-500 hover:text-red-500 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
