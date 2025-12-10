import React, { useState } from 'react';
import { useCart } from '../lib/cartContext';
import { useCurrency } from '../lib/currencyContext';
import { api } from '../lib/api';
import { Button, Card, Input, Label } from './ui';
import { Lock, Truck, CreditCard, ShieldCheck } from 'lucide-react';
import { Address } from '../types';

interface CheckoutFormProps {
    onSuccess: (email: string) => void;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSuccess }) => {
    const { cart, cartTotal, clearCart } = useCart();
    const { formatPrice, currentCurrency, convertPrice } = useCurrency();
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Form State
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zip, setZip] = useState('');
    const [country, setCountry] = useState('United States');
    const [shipping, setShipping] = useState<'standard' | 'express'>('standard');

    // Calculate Costs in Base USD
    const shippingCostUsd = shipping === 'standard' ? 25 : 150;
    const taxAmountUsd = cartTotal * (currentCurrency.taxPercent / 100);
    const grandTotalUsd = cartTotal + shippingCostUsd + taxAmountUsd;

    // We store USD in the database for consistency, but display converted
    const displayShipping = formatPrice(shippingCostUsd);
    const displayTotal = formatPrice(grandTotalUsd);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        const address: Address = {
            firstName, lastName, addressLine1, city, state, zip, country
        };

        try {
            // We pass the total in USD to the backend API, but log the currency used in the order object properties if needed
            // Ideally, the order object should be extended to support currencyCode and exchangeRateSnapshot
            await api.orders.create(email, address, shipping, cart, grandTotalUsd);
            clearCart();
            onSuccess(email);
        } catch (err: any) {
            alert("Checkout Error: " + err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <h3 className="text-xl font-serif text-white mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-gold" /> Investor Details
                </h3>
                <div className="grid gap-4">
                    <div>
                        <Label>Email Address</Label>
                        <Input 
                            required 
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            placeholder="investor@example.com" 
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>First Name</Label>
                            <Input required value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John" />
                        </div>
                        <div>
                            <Label>Last Name</Label>
                            <Input required value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" />
                        </div>
                    </div>
                </div>
            </Card>

            <Card>
                <h3 className="text-xl font-serif text-white mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-gold" /> Shipping Address
                </h3>
                <div className="grid gap-4">
                    <div>
                        <Label>Address Line 1</Label>
                        <Input required value={addressLine1} onChange={e => setAddressLine1(e.target.value)} placeholder="123 Bullion Way" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>City</Label>
                            <Input required value={city} onChange={e => setCity(e.target.value)} />
                        </div>
                        <div>
                            <Label>State / Province</Label>
                            <Input required value={state} onChange={e => setState(e.target.value)} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>ZIP / Postal Code</Label>
                            <Input required value={zip} onChange={e => setZip(e.target.value)} />
                        </div>
                        <div>
                            <Label>Country</Label>
                            <select 
                                className="flex h-10 w-full rounded-md border border-charcoal-lighter bg-charcoal-light px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                                value={country}
                                onChange={e => setCountry(e.target.value)}
                            >
                                <option value="United States">United States</option>
                                <option value="Canada">Canada</option>
                                <option value="United Kingdom">United Kingdom</option>
                                <option value="Switzerland">Switzerland</option>
                                <option value="Singapore">Singapore</option>
                            </select>
                        </div>
                    </div>
                </div>
            </Card>

            <Card>
                <h3 className="text-xl font-serif text-white mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-gold" /> Delivery Method
                </h3>
                <div className="space-y-3">
                    <label className={`flex items-center justify-between p-4 rounded border cursor-pointer transition-colors ${shipping === 'standard' ? 'border-gold bg-gold/5' : 'border-charcoal-lighter hover:border-gray-600'}`}>
                        <div className="flex items-center gap-3">
                            <input type="radio" name="shipping" checked={shipping === 'standard'} onChange={() => setShipping('standard')} className="text-gold focus:ring-gold" />
                            <div>
                                <div className="text-white font-medium">Insured Standard</div>
                                <div className="text-gray-500 text-sm">3-5 Business Days. Fully insured by Lloyd's of London.</div>
                            </div>
                        </div>
                        <div className="text-white font-mono">{formatPrice(25)}</div>
                    </label>
                    <label className={`flex items-center justify-between p-4 rounded border cursor-pointer transition-colors ${shipping === 'express' ? 'border-gold bg-gold/5' : 'border-charcoal-lighter hover:border-gray-600'}`}>
                            <div className="flex items-center gap-3">
                            <input type="radio" name="shipping" checked={shipping === 'express'} onChange={() => setShipping('express')} className="text-gold focus:ring-gold" />
                            <div>
                                <div className="text-white font-medium">Express Armored</div>
                                <div className="text-gray-500 text-sm">1-2 Business Days. Dedicated armored transport.</div>
                            </div>
                        </div>
                        <div className="text-white font-mono">{formatPrice(150)}</div>
                    </label>
                </div>
            </Card>

            <Card>
                <h3 className="text-xl font-serif text-white mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-gold" /> Payment ({currentCurrency.code})
                </h3>
                <div className="p-4 bg-charcoal rounded border border-charcoal-lighter flex items-center gap-3 text-sm mb-4">
                    <Lock className="w-4 h-4 text-green-500" />
                    <span className="text-gray-300">Payments processed securely via Stripe. 256-bit SSL Encrypted.</span>
                </div>
                <div className="grid gap-4">
                        <div>
                        <Label>Card Number</Label>
                        <Input placeholder="0000 0000 0000 0000" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Expiry</Label>
                            <Input placeholder="MM/YY" />
                        </div>
                        <div>
                            <Label>CVC</Label>
                            <Input placeholder="123" />
                        </div>
                    </div>
                </div>
            </Card>

            <div className="lg:hidden">
                 {/* Mobile Total Display */}
                 <div className="flex justify-between items-center text-xl font-serif text-white border-t border-charcoal-lighter pt-4">
                    <span>Total</span>
                    <span className="text-gold">{displayTotal}</span>
                 </div>
                 <Button className="w-full mt-4" size="lg" type="submit" isLoading={isProcessing}>
                    Confirm Order
                </Button>
            </div>
        </form>
    );
};