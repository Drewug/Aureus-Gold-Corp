import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { api } from '../../lib/api';
import { Product } from '../../types';
import { Button, Card, PageHeader, Badge, Input, Label } from '../../components/ui';
import { ProductAdminForm } from '../../components/ProductAdminForm';
import { formatCurrency } from '../../lib/utils';
import { Plus, Edit, Trash2, Search, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export const Products = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [view, setView] = useState<'list' | 'edit' | 'create' | 'bulk_stock'>('list');
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    const [search, setSearch] = useState('');
    const [bulkCsv, setBulkCsv] = useState('');
    const [bulkResult, setBulkResult] = useState<{updated: number, errors: string[]} | null>(null);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        const p = await api.products.list();
        setProducts(p);
    };

    const handleCreate = () => {
        setEditingProduct(undefined);
        setView('create');
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setView('edit');
    };

    const handleDelete = async (id: string) => {
        if(confirm('Delete this product permanently?')) {
            await api.products.delete(id);
            loadProducts();
        }
    };

    const handleSave = async (product: Product) => {
        if (view === 'create') {
            await api.products.create(product);
        } else {
            await api.products.update(product);
        }
        await loadProducts();
        setView('list');
    };

    const handleBulkStock = async () => {
        const res = await api.products.importCSV(bulkCsv);
        setBulkResult(res);
        if (res.updated > 0) loadProducts();
    };

    const filtered = products.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

    if (view === 'create' || view === 'edit') {
        return (
            <AdminLayout>
                <PageHeader 
                    title={view === 'create' ? 'New Product' : 'Edit Product'} 
                    subtitle="Manage product details, pricing, and variants." 
                />
                <ProductAdminForm 
                    initialProduct={editingProduct} 
                    onSave={handleSave} 
                    onCancel={() => setView('list')} 
                />
            </AdminLayout>
        );
    }

    if (view === 'bulk_stock') {
         return (
            <AdminLayout>
                <PageHeader title="Bulk Stock Update" subtitle="Paste CSV data to update inventory quickly." />
                <div className="max-w-2xl">
                    <Card>
                        <Label>CSV Data (Format: SKU, Stock)</Label>
                        <textarea 
                            className="w-full h-64 bg-charcoal-lighter border border-charcoal-light rounded p-4 font-mono text-sm text-gray-300 mt-2 focus:border-gold outline-none"
                            placeholder={"RCM-1OZ, 50\nAGE-2024, 25\n..."}
                            value={bulkCsv}
                            onChange={e => setBulkCsv(e.target.value)}
                        />
                        
                        {bulkResult && (
                            <div className="mt-4 p-4 bg-charcoal border border-charcoal-lighter rounded text-sm">
                                <div className="flex items-center gap-2 text-green-400 mb-2">
                                    <CheckCircle className="w-4 h-4" /> Updated {bulkResult.updated} items.
                                </div>
                                {bulkResult.errors.length > 0 && (
                                    <div className="text-red-400 space-y-1">
                                        <div className="flex items-center gap-2 font-medium"><AlertCircle className="w-4 h-4"/> Errors:</div>
                                        {bulkResult.errors.map((e, i) => <div key={i}>{e}</div>)}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="mt-6 flex gap-3">
                            <Button onClick={handleBulkStock}>Process CSV</Button>
                            <Button variant="secondary" onClick={() => { setView('list'); setBulkResult(null); }}>Back to List</Button>
                        </div>
                    </Card>
                </div>
            </AdminLayout>
         )
    }

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <PageHeader title="Products" subtitle={`Manage ${products.length} items in catalog.`} />
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setView('bulk_stock')}>
                        <FileText className="w-4 h-4 mr-2" /> Bulk Stock
                    </Button>
                    <Button onClick={handleCreate}>
                        <Plus className="w-4 h-4 mr-2" /> New Product
                    </Button>
                </div>
            </div>

            <Card className="p-0 overflow-hidden">
                <div className="p-4 border-b border-charcoal-lighter bg-charcoal flex gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        <Input 
                            className="pl-9" 
                            placeholder="Search by title..." 
                            value={search} 
                            onChange={e => setSearch(e.target.value)} 
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-charcoal-lighter text-gray-400 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">Product</th>
                                <th className="px-6 py-3">Variants</th>
                                <th className="px-6 py-3">Categories</th>
                                <th className="px-6 py-3 text-right">Stock</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-charcoal-lighter">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No products found.</td></tr>
                            ) : (
                                filtered.map(product => {
                                    const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
                                    return (
                                        <tr key={product.id} className="hover:bg-charcoal-lighter/50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded bg-charcoal-light border border-charcoal-lighter overflow-hidden">
                                                        <img src={product.images[0] || ''} className="w-full h-full object-cover" alt="" />
                                                    </div>
                                                    <div>
                                                        <div className="text-white font-medium">{product.title}</div>
                                                        <div className="text-gray-500 text-xs">/{product.slug}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-300">
                                                {product.variants.length} options
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-1 flex-wrap">
                                                    {product.categories.slice(0, 2).map(c => (
                                                        <span key={c} className="text-xs bg-charcoal border border-charcoal-lighter px-2 py-0.5 rounded text-gray-400">{c}</span>
                                                    ))}
                                                    {product.categories.length > 2 && <span className="text-xs text-gray-500">+{product.categories.length - 2}</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={totalStock < 10 ? 'text-red-400 font-bold' : 'text-green-400'}>
                                                    {totalStock}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleEdit(product)} className="p-2 text-gray-400 hover:text-white bg-charcoal-light hover:bg-charcoal-lighter rounded">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-400 bg-charcoal-light hover:bg-charcoal-lighter rounded">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </AdminLayout>
    );
};
