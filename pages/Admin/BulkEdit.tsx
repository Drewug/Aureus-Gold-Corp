import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { PageHeader, Card } from '../../components/ui';
import { api } from '../../lib/api';
import { Product } from '../../types';
import { 
    ProductTableSelector, 
    BulkDescriptionEditor, 
    BulkSeoAssistant, 
    BulkFindReplace, 
    BulkTagManager, 
    BulkCategoryManager 
} from '../../components/BulkEditTools';
import { Edit3, Search, Tag, FolderTree, Wand2 } from 'lucide-react';

type ToolType = 'description' | 'seo' | 'find_replace' | 'badges' | 'categories';

export const BulkEdit = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [activeTool, setActiveTool] = useState<ToolType>('description');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setLoading(true);
        const p = await api.products.list();
        setProducts(p);
        setLoading(false);
    };

    const handleApplyChanges = async (updatedProducts: Product[]) => {
        if (confirm(`Apply changes to ${updatedProducts.length} products? This cannot be undone.`)) {
            setLoading(true);
            await api.products.bulkUpdate(updatedProducts);
            await loadProducts();
            setSelectedIds([]); // Reset selection
            setLoading(false);
            alert('Bulk update completed successfully.');
        }
    };

    const selectedProducts = products.filter(p => selectedIds.includes(p.id));

    const tools = [
        { id: 'description', label: 'Description Editor', icon: Edit3 },
        { id: 'seo', label: 'SEO Assistant', icon: Wand2 },
        { id: 'find_replace', label: 'Find & Replace', icon: Search },
        { id: 'badges', label: 'Badge Manager', icon: Tag },
        { id: 'categories', label: 'Taxonomy', icon: FolderTree },
    ];

    return (
        <AdminLayout>
            <PageHeader title="Bulk Editor" subtitle="Perform large-scale updates across the catalog." />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
                {/* Left: Product Selector */}
                <div className="lg:col-span-4 flex flex-col min-h-0">
                    <ProductTableSelector 
                        products={products} 
                        selectedIds={selectedIds} 
                        onSelectionChange={setSelectedIds} 
                    />
                </div>

                {/* Right: Tools Interface */}
                <div className="lg:col-span-8 flex flex-col min-h-0">
                    <Card className="flex-1 flex flex-col">
                        {/* Tool Tabs */}
                        <div className="flex gap-1 border-b border-charcoal-lighter mb-6 overflow-x-auto pb-2">
                            {tools.map(tool => {
                                const Icon = tool.icon;
                                const isActive = activeTool === tool.id;
                                return (
                                    <button
                                        key={tool.id}
                                        onClick={() => setActiveTool(tool.id as ToolType)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-t-md text-sm font-medium transition-colors whitespace-nowrap ${
                                            isActive 
                                                ? 'bg-charcoal text-gold border-b-2 border-gold' 
                                                : 'text-gray-400 hover:text-white hover:bg-charcoal-lighter/30'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {tool.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tool Content */}
                        <div className="flex-1 overflow-y-auto">
                            {selectedProducts.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                    <Edit3 className="w-12 h-12 mb-4 opacity-20" />
                                    <p>Select products from the list to begin editing.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-charcoal-lighter/20 p-4 rounded border border-charcoal-lighter mb-6 flex justify-between items-center">
                                        <span className="text-sm text-gray-300">Editing <strong>{selectedProducts.length}</strong> items</span>
                                        <button onClick={() => setSelectedIds([])} className="text-xs text-gold hover:underline">Clear Selection</button>
                                    </div>

                                    {activeTool === 'description' && (
                                        <BulkDescriptionEditor selectedProducts={selectedProducts} onApply={handleApplyChanges} />
                                    )}
                                    {activeTool === 'seo' && (
                                        <BulkSeoAssistant selectedProducts={selectedProducts} onApply={handleApplyChanges} />
                                    )}
                                    {activeTool === 'find_replace' && (
                                        <BulkFindReplace selectedProducts={selectedProducts} onApply={handleApplyChanges} />
                                    )}
                                    {activeTool === 'badges' && (
                                        <BulkTagManager selectedProducts={selectedProducts} onApply={handleApplyChanges} />
                                    )}
                                    {activeTool === 'categories' && (
                                        <BulkCategoryManager selectedProducts={selectedProducts} onApply={handleApplyChanges} />
                                    )}
                                </>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
};
