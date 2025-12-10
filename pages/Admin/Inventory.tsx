import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { api } from '../../lib/api';
import { Product, Variant } from '../../types';
import { Button, Card, PageHeader, Input, Badge } from '../../components/ui';
import { getLowStockVariants, calculateInventoryValue } from '../../lib/inventory';
import { AlertTriangle, Download, Save, TrendingDown, Package } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

export const Inventory = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [bulkCsv, setBulkCsv] = useState('');
    const [lowStockItems, setLowStockItems] = useState<{product: Product, variant: Variant}[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const p = await api.products.list();
        setProducts(p);
        setLowStockItems(getLowStockVariants(p));
    };

    const handleBulkUpdate = async () => {
        if (!bulkCsv) return;
        setLoading(true);
        const res = await api.products.importCSV(bulkCsv);
        setLoading(false);
        if (res.updated > 0) {
            alert(`Updated ${res.updated} variants successfully.`);
            setBulkCsv('');
            loadData();
        } else if (res.errors.length > 0) {
            alert(`Errors: \n${res.errors.join('\n')}`);
        }
    };

    const updateThreshold = async (product: Product, variantId: string, newThreshold: number) => {
        const updatedProduct = { ...product };
        const vIndex = updatedProduct.variants.findIndex(v => v.id === variantId);
        if (vIndex !== -1) {
            updatedProduct.variants[vIndex].lowStockThreshold = newThreshold;
            await api.products.update(updatedProduct);
            loadData(); // refresh to update low stock list
        }
    };

    const totalValue = calculateInventoryValue(products);
    const totalVariants = products.reduce((acc, p) => acc + p.variants.length, 0);

    return (
        <AdminLayout>
            <PageHeader title="Inventory Manager" subtitle="Stock control, valuation, and bulk updates." />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-6">
                    <div className="text-gray-400 text-sm mb-1">Total Inventory Value</div>
                    <div className="text-2xl font-mono text-gold">{formatCurrency(totalValue)}</div>
                </Card>
                <Card className="p-6">
                    <div className="text-gray-400 text-sm mb-1">Active Variants</div>
                    <div className="text-2xl font-bold text-white">{totalVariants}</div>
                </Card>
                <Card className="p-6">
                    <div className="text-gray-400 text-sm mb-1">Low Stock Alerts</div>
                    <div className="text-2xl font-bold text-red-400 flex items-center gap-2">
                        {lowStockItems.length} <AlertTriangle className="w-5 h-5" />
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Low Stock List */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="overflow-hidden">
                        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                            <TrendingDown className="w-5 h-5 text-red-400" /> Low Stock Items
                        </h3>
                        <div className="overflow-x-auto">
                             <table className="w-full text-sm text-left">
                                <thead className="bg-charcoal-lighter text-gray-400 uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3">SKU</th>
                                        <th className="px-4 py-3">Product Name</th>
                                        <th className="px-4 py-3 text-right">Stock</th>
                                        <th className="px-4 py-3 text-right">Threshold</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-charcoal-lighter">
                                    {lowStockItems.length === 0 ? (
                                        <tr><td colSpan={4} className="p-6 text-center text-gray-500">Inventory levels are healthy.</td></tr>
                                    ) : (
                                        lowStockItems.map(({product, variant}) => (
                                            <tr key={variant.id} className="hover:bg-charcoal-lighter/50">
                                                <td className="px-4 py-3 font-mono text-gold-dim">{variant.sku}</td>
                                                <td className="px-4 py-3">
                                                    <div className="text-white">{product.title}</div>
                                                    <div className="text-xs text-gray-500">{variant.name}</div>
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold text-red-400">{variant.stock}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <input 
                                                        type="number" 
                                                        className="w-16 bg-charcoal border border-charcoal-lighter rounded px-2 py-1 text-right text-gray-300 text-xs focus:border-gold outline-none"
                                                        defaultValue={variant.lowStockThreshold || 5}
                                                        onBlur={(e) => updateThreshold(product, variant.id, parseInt(e.target.value))}
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                             <Package className="w-5 h-5 text-gold" /> Bulk Stock Update
                        </h3>
                         <p className="text-sm text-gray-400 mb-4">Paste CSV content below (Format: <code>SKU, Quantity</code>) to rapidly update stock levels.</p>
                         <textarea 
                            className="w-full h-40 bg-charcoal-lighter border border-charcoal-light rounded p-4 font-mono text-sm text-gray-300 focus:border-gold outline-none"
                            placeholder={"RCM-1OZ, 100\nAGE-2024, 50"}
                            value={bulkCsv}
                            onChange={e => setBulkCsv(e.target.value)}
                         />
                         <div className="mt-4 flex justify-end">
                             <Button onClick={handleBulkUpdate} isLoading={loading}>
                                 <Save className="w-4 h-4 mr-2" /> Apply Updates
                             </Button>
                         </div>
                    </Card>
                </div>
                
                {/* Tools Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <h3 className="text-white font-medium mb-4">Quick Actions</h3>
                         <div className="space-y-3">
                            <Button variant="secondary" className="w-full justify-start" onClick={() => {
                                const data = "SKU,Current Stock,Threshold\n" + products.flatMap(p => p.variants.map(v => `${v.sku},${v.stock},${v.lowStockThreshold || 5}`)).join('\n');
                                const blob = new Blob([data], {type: 'text/csv'});
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `inventory_${new Date().toISOString().slice(0,10)}.csv`;
                                a.click();
                            }}>
                                <Download className="w-4 h-4 mr-2" /> Export Inventory CSV
                            </Button>
                         </div>
                    </Card>
                    
                    <div className="bg-blue-900/20 border border-blue-900/50 p-4 rounded text-blue-300 text-sm">
                        <h4 className="font-bold mb-2 flex items-center gap-2">Pro Tip</h4>
                        <p>Setting thresholds helps the automated cron job identify reorder needs. Variants below their threshold will appear in the Low Stock report.</p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};
