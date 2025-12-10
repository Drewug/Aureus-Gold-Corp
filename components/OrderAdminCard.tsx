import React from 'react';
import { Order, OrderStatus } from '../types';
import { Card, Button, Badge } from './ui';
import { formatDate, formatCurrency } from '../lib/utils';
import { Check, Truck, AlertOctagon, Save, X, MapPin } from 'lucide-react';
import { api } from '../lib/api';

interface OrderAdminCardProps {
    order: Order;
    onClose: () => void;
    onUpdate: () => void;
}

export const OrderAdminCard: React.FC<OrderAdminCardProps> = ({ order, onClose, onUpdate }) => {
    const [note, setNote] = React.useState(order.notes || '');

    const handleStatusUpdate = async (newStatus: OrderStatus) => {
        const updated = { ...order, status: newStatus };
        await api.orders.update(updated);
        onUpdate();
    };

    const saveNote = async () => {
        const updated = { ...order, notes: note };
        await api.orders.update(updated);
        alert('Note saved.');
        onUpdate();
    };

    return (
        <Card className="flex-1 flex flex-col overflow-y-auto custom-scrollbar h-full">
            <div className="flex justify-between items-start mb-6 pb-6 border-b border-charcoal-lighter">
                <div>
                    <h2 className="text-2xl font-serif text-white mb-1">Order {order.id}</h2>
                    <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                </div>
                <button onClick={onClose} className="text-gray-500 hover:text-white lg:hidden">
                    <X />
                </button>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Customer</h3>
                        <div className="bg-charcoal p-3 rounded border border-charcoal-lighter text-sm text-gray-200">
                            <div className="font-medium text-white mb-1">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</div>
                            <div>{order.customerEmail}</div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                             <MapPin className="w-3 h-3" /> Shipping To
                        </h3>
                        <div className="bg-charcoal p-3 rounded border border-charcoal-lighter text-sm text-gray-200">
                            {order.shippingAddress ? (
                                <>
                                    <div>{order.shippingAddress.addressLine1}</div>
                                    <div>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</div>
                                    <div>{order.shippingAddress.country}</div>
                                </>
                            ) : <span className="text-gray-500">No address provided</span>}
                            <div className="mt-2 text-gold text-xs uppercase tracking-wide border-t border-charcoal-lighter pt-1">
                                {order.shippingOption === 'express' ? 'Express Armored' : 'Standard Insured'}
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Items</h3>
                    <div className="space-y-2">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-charcoal p-3 rounded border border-charcoal-lighter">
                                <div>
                                    <div className="text-white text-sm font-medium">{item.productTitle}</div>
                                    <div className="text-xs text-gold">{item.variantName}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-white font-mono">{item.quantity} x {formatCurrency(item.price)}</div>
                                </div>
                            </div>
                        ))}
                        <div className="flex justify-between items-center pt-2 font-medium text-white border-t border-charcoal-lighter mt-2">
                            <span>Total</span>
                            <span className="text-xl font-mono text-gold">{formatCurrency(order.total)}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Workflow</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <Button 
                            variant={order.status === 'processing' ? 'primary' : 'secondary'} 
                            size="sm" 
                            onClick={() => handleStatusUpdate('processing')}
                            disabled={order.status === 'processing'}
                        >
                            <Check className="w-3 h-3 mr-2" /> Mark Processing
                        </Button>
                        <Button 
                            variant={order.status === 'shipped' ? 'primary' : 'secondary'} 
                            size="sm"
                            onClick={() => handleStatusUpdate('shipped')}
                            disabled={order.status === 'shipped'}
                        >
                            <Truck className="w-3 h-3 mr-2" /> Mark Shipped
                        </Button>
                        <Button 
                            variant={order.status === 'delivered' ? 'primary' : 'secondary'} 
                            size="sm"
                            onClick={() => handleStatusUpdate('delivered')}
                            disabled={order.status === 'delivered'}
                        >
                            <Check className="w-3 h-3 mr-2" /> Mark Delivered
                        </Button>
                        <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => handleStatusUpdate('failed')}
                            disabled={order.status === 'failed'}
                        >
                            <AlertOctagon className="w-3 h-3 mr-2" /> Mark Failed
                        </Button>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Admin Notes</h3>
                    <textarea 
                        className="w-full h-24 bg-charcoal p-3 rounded border border-charcoal-lighter text-sm text-gray-200 focus:border-gold outline-none resize-none"
                        placeholder="Add internal notes regarding this order..."
                        value={note}
                        onChange={e => setNote(e.target.value)}
                    />
                    <Button size="sm" variant="secondary" className="mt-2 w-full" onClick={saveNote}>
                        <Save className="w-4 h-4 mr-2" /> Save Note
                    </Button>
                </div>
            </div>
        </Card>
    );
};
