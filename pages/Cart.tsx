import React, { useState } from 'react';
import { useCart } from '../lib/cartContext';
import { useCurrency } from '../lib/currencyContext';
import { Layout } from '../components/Layout';
import { Button, Card, Input, Label } from '../components/ui';
import { Trash2, Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CheckoutForm } from '../components/CheckoutForm';

export const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { formatPrice, convertPrice, currentCurrency } = useCurrency();
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [confirmedEmail, setConfirmedEmail] = useState('');
  const navigate = useNavigate();

  // Convert subtotal for display
  const subtotal = convertPrice(cartTotal).value;
  // Estimate tax just for preview (actual calc happens in CheckoutForm/Context usually, but simulated here)
  const taxAmount = subtotal * (currentCurrency.taxPercent / 100);

  if (step === 'success') {
    return (
      <Layout>
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <div className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-serif text-white mb-4">Order Secured</h1>
          <p className="text-gray-400 mb-8">
            Thank you for your investment. A confirmation email has been sent to {confirmedEmail}.
            Your assets are being prepared for secure transport.
          </p>
          <Button onClick={() => { setStep('cart'); navigate('/'); }}>Return to Market</Button>
        </div>
      </Layout>
    );
  }

  if (cart.length === 0 && step === 'cart') {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
           <h1 className="text-3xl font-serif text-white mb-4">Your Vault is Empty</h1>
           <p className="text-gray-500 mb-8">Begin your collection by exploring our bullion catalog.</p>
           <Button onClick={() => navigate('/')}>Browse Inventory</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-12">
        {step === 'checkout' && (
            <button onClick={() => setStep('cart')} className="flex items-center text-gray-500 hover:text-gold mb-6 text-sm">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Cart
            </button>
        )}
        
        <h1 className="text-3xl font-serif text-white mb-8">
          {step === 'cart' ? 'Secure Checkout' : 'Finalize Order'}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {step === 'cart' && (
              <div className="space-y-4">
                {cart.map(item => (
                  <Card key={item.variantId} className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-white">{item.productTitle}</h3>
                      <p className="text-gold text-sm">{item.variantName}</p>
                      <p className="text-gray-500 text-sm mt-1 font-mono">Unit: {formatPrice(item.price)}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                       <div className="flex items-center border border-charcoal-lighter rounded">
                          <button 
                            className="px-3 py-1 hover:bg-charcoal-lighter text-gray-400"
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          >-</button>
                          <span className="px-3 py-1 text-white font-mono">{item.quantity}</span>
                          <button 
                             className="px-3 py-1 hover:bg-charcoal-lighter text-gray-400"
                             onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          >+</button>
                       </div>
                       <div className="text-right min-w-[100px]">
                          <div className="text-white font-mono">{formatPrice(item.price * item.quantity)}</div>
                       </div>
                       <button onClick={() => removeFromCart(item.variantId)} className="text-gray-600 hover:text-red-500">
                          <Trash2 className="w-5 h-5" />
                       </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {step === 'checkout' && (
              <CheckoutForm onSuccess={(email) => {
                  setConfirmedEmail(email);
                  setStep('success');
              }} />
            )}
          </div>

          {/* Summary Column */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <h3 className="font-serif text-xl text-white mb-6">Order Summary</h3>
              <div className="space-y-3 text-sm mb-6 pb-6 border-b border-charcoal-lighter">
                 <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span className="text-white font-mono">{formatPrice(cartTotal)}</span>
                 </div>
                 {step === 'cart' && (
                    <div className="flex justify-between text-gray-400">
                        <span>Shipping</span>
                        <span className="text-gray-500 italic">Calculated next step</span>
                    </div>
                 )}
                 <div className="flex justify-between text-gray-400">
                    <span>Tax ({currentCurrency.taxPercent}%)</span>
                    <span className="text-white font-mono">{formatPrice((cartTotal * (currentCurrency.taxPercent / 100)))}</span>
                 </div>
              </div>
              
              {step === 'cart' && (
                  <div className="flex justify-between items-end mb-8">
                    <span className="text-lg font-serif text-gold">Est. Total</span>
                    <span className="text-2xl font-mono text-white">{formatPrice(cartTotal, true)}</span>
                 </div>
              )}

              {step === 'cart' ? (
                <Button className="w-full" size="lg" onClick={() => setStep('checkout')}>
                    Proceed to Verification
                </Button>
              ) : (
                <div className="text-sm text-gray-500 text-center mb-4">
                    Complete the form to calculate final total with shipping.
                </div>
              )}
              
              {step === 'checkout' && (
                  <div className="hidden lg:block">
                     <Button 
                        className="w-full" 
                        size="lg" 
                        form="checkout-form" 
                        type="submit"
                    >
                        Confirm Order
                    </Button>
                  </div>
              )}
              
              <div className="mt-6 text-xs text-gray-500 text-center flex items-center justify-center gap-2">
                <Lock className="w-3 h-3" /> SSL Encrypted Transaction
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};