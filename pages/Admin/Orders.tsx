import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { api } from '../../lib/api';
import { Order } from '../../types';
import { Badge, Button, Card, PageHeader, Input } from '../../components/ui';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Search, Eye } from 'lucide-react';
import { OrderAdminCard } from '../../components/OrderAdminCard';

export const Orders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        const data = await api.orders.list();
        setOrders(data);
    };

    const handleUpdate = () => {
        loadOrders();
        // If selected order changes status, we might want to reload it or close it?
        // For now, reloading list is fine. If selectedOrder is just a reference, we might need to refresh it too.
        if (selectedOrder) {
            api.orders.list().then(list => {
                const updated = list.find(o => o.id === selectedOrder.id);
                if (updated) setSelectedOrder(updated);
            });
        }
    };

    const filtered = orders.filter(o => {
        const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
        const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase()) || 
                              o.customerEmail.toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <AdminLayout>
            <PageHeader title="Orders" subtitle="Manage customer orders and fulfillment." />

            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
                {/* List Column */}
                <div className={`${selectedOrder ? 'hidden lg:flex' : 'flex'} flex-col flex-1 gap-4`}>
                    <div className="flex gap-4 mb-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                            <Input 
                                className="pl-9" 
                                placeholder="Search order ID or email..." 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <select 
                            className="h-10 rounded-md border border-charcoal-lighter bg-charcoal-light px-3 text-sm text-gray-100 focus:ring-2 focus:ring-gold outline-none"
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>

                    <Card className="flex-1 p-0 overflow-hidden flex flex-col">
                        <div className="overflow-y-auto custom-scrollbar flex-1">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-charcoal-lighter text-gray-400 uppercase text-xs sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3">Order</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Customer</th>
                                        <th className="px-4 py-3 text-right">Total</th>
                                        <th className="px-4 py-3 text-center">Status</th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-charcoal-lighter">
                                    {filtered.map(order => (
                                        <tr key={order.id} className="hover:bg-charcoal-lighter/50 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                                            <td className="px-4 py-4 font-mono text-gold">{order.id}</td>
                                            <td className="px-4 py-4 text-gray-400">{formatDate(order.createdAt)}</td>
                                            <td className="px-4 py-4 text-white">{order.customerEmail}</td>
                                            <td className="px-4 py-4 text-right font-mono">{formatCurrency(order.total)}</td>
                                            <td className="px-4 py-4 text-center">
                                                <Badge variant={order.status === 'delivered' ? 'success' : order.status === 'failed' ? 'error' : 'default'}>
                                                    {order.status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <Button size="sm" variant="secondary"><Eye className="w-3 h-3"/></Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filtered.length === 0 && <div className="p-8 text-center text-gray-500">No orders found.</div>}
                        </div>
                    </Card>
                </div>

                {/* Details Column */}
                {selectedOrder && (
                    <div className="w-full lg:w-[450px] flex flex-col gap-6 animate-in slide-in-from-right-10 duration-200">
                        <OrderAdminCard 
                            order={selectedOrder} 
                            onClose={() => setSelectedOrder(null)} 
                            onUpdate={handleUpdate}
                        />
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};
