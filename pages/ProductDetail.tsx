import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Product, Variant } from '../types';
import { Layout } from '../components/Layout';
import { Button, Badge, Card } from '../components/ui';
import { useCart } from '../lib/cartContext';
import { useCurrency } from '../lib/currencyContext';
import { Check, Shield, AlertCircle, Info } from 'lucide-react';
import { SEO } from '../components/SEO';
import { ProductJSONLD } from '../components/ProductJSONLD';

export const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      const p = await api.products.get(slug);
      setProduct(p || null);
      if (p && p.variants.length > 0) {
        setSelectedVariant(p.variants[0]);
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    addToCart({
      productId: product.id,
      productTitle: product.title,
      variantId: selectedVariant.id,
      variantName: selectedVariant.name,
      price: selectedVariant.price,
      quantity: 1
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return <Layout><div className="p-12 text-center text-gold">Loading...</div></Layout>;
  if (!product || !selectedVariant) return <Layout><div className="p-12 text-center text-red-500">Product not found</div></Layout>;

  return (
    <Layout>
      <SEO 
        title={product.seo?.metaTitle || product.title}
        description={product.seo?.metaDescription || product.description.slice(0, 160)}
        image={product.seo?.ogImage || product.images[0]}
        url={window.location.href}
        type="product"
      />
      <ProductJSONLD product={product} selectedVariant={selectedVariant} />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
             <div className="aspect-square bg-charcoal-light rounded-lg overflow-hidden border border-charcoal-lighter">
               <img src={product.images[0] || 'https://placehold.co/600x600/1a1a1c/d4af37?text=No+Image'} alt={product.title} className="w-full h-full object-cover" />
             </div>
             {product.images.length > 1 && (
                 <div className="grid grid-cols-4 gap-4">
                   {product.images.map((img, i) => (
                     <div key={i} className="aspect-square bg-charcoal-light rounded cursor-pointer border border-charcoal-lighter hover:border-gold">
                       <img src={img} alt="" className="w-full h-full object-cover" />
                     </div>
                   ))}
                 </div>
             )}
          </div>

          {/* Info */}
          <div>
            <div className="mb-2">
               {product.categories.map(c => (
                   <span key={c} className="text-gold text-sm font-medium mr-2 uppercase tracking-wide">{c}</span>
               ))}
            </div>
            <h1 className="text-4xl font-serif text-white mb-4">{product.title}</h1>
            <p className="text-gray-400 mb-8 leading-relaxed">{product.description}</p>

            {/* Variant Selector */}
            <div className="bg-charcoal-light p-6 rounded-lg border border-charcoal-lighter mb-8 shadow-lg shadow-black/20">
               <label className="text-xs text-gold-dim uppercase tracking-wider font-semibold block mb-3">Select Variant</label>
               <div className="flex flex-wrap gap-3 mb-6">
                 {product.variants.map(v => (
                   <button
                     key={v.id}
                     onClick={() => setSelectedVariant(v)}
                     className={`px-4 py-3 rounded border text-sm font-medium transition-all ${
                       selectedVariant.id === v.id 
                       ? 'border-gold bg-gold/10 text-gold shadow-[0_0_10px_rgba(212,175,55,0.2)]' 
                       : 'border-charcoal-lighter text-gray-400 hover:border-gray-600'
                     }`}
                   >
                     {v.name}
                   </button>
                 ))}
               </div>

               <div className="flex items-center justify-between mb-6 pb-6 border-b border-charcoal-lighter">
                 <div>
                    <div className="text-sm text-gray-500 mb-1">Price per unit</div>
                    <div className="text-3xl font-mono text-white tracking-tight">{formatPrice(selectedVariant.price)}</div>
                 </div>
                 <div className="text-right">
                    <div className="text-sm text-gray-500 mb-1">Vault Status</div>
                    {selectedVariant.stock > 0 ? (
                        <div className="text-green-400 flex items-center justify-end gap-1 font-medium bg-green-900/20 px-2 py-1 rounded">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> In Stock ({selectedVariant.stock})
                        </div>
                    ) : (
                        <div className="text-red-400 font-medium bg-red-900/20 px-2 py-1 rounded">Sold Out</div>
                    )}
                 </div>
               </div>

               <Button 
                 size="lg" 
                 className="w-full text-lg h-14" 
                 onClick={handleAddToCart}
                 disabled={selectedVariant.stock === 0}
                >
                 {added ? <span className="flex items-center gap-2"><Check className="w-5 h-5"/> Added to Cart</span> : (selectedVariant.stock === 0 ? 'Unavailable' : 'Add to Order')}
               </Button>
               
               <div className="mt-4 text-center text-xs text-gray-500 flex justify-center gap-4">
                   <span className="flex items-center gap-1"><Shield className="w-3 h-3"/> Insured Shipping</span>
                   <span className="flex items-center gap-1"><Check className="w-3 h-3"/> Verified Authentic</span>
               </div>
            </div>

            {/* Technical Specs */}
            <h3 className="text-white font-serif text-lg mb-4">Technical Specifications</h3>
            <div className="grid grid-cols-2 gap-4 text-sm mb-8">
                <div className="p-4 rounded bg-charcoal-light border border-charcoal-lighter flex justify-between">
                    <span className="text-gray-500">Purity</span>
                    <span className="text-white font-medium font-mono">{(selectedVariant.purity).toFixed(2)}%</span>
                </div>
                <div className="p-4 rounded bg-charcoal-light border border-charcoal-lighter flex justify-between">
                    <span className="text-gray-500">Weight</span>
                    <span className="text-white font-medium font-mono">{selectedVariant.weight}g</span>
                </div>
                {selectedVariant.mint && (
                    <div className="p-4 rounded bg-charcoal-light border border-charcoal-lighter flex justify-between">
                        <span className="text-gray-500">Mint</span>
                        <span className="text-white font-medium">{selectedVariant.mint}</span>
                    </div>
                )}
                {selectedVariant.year && (
                    <div className="p-4 rounded bg-charcoal-light border border-charcoal-lighter flex justify-between">
                        <span className="text-gray-500">Year</span>
                        <span className="text-white font-medium">{selectedVariant.year}</span>
                    </div>
                )}
                <div className="p-4 rounded bg-charcoal-light border border-charcoal-lighter flex justify-between col-span-2">
                    <span className="text-gray-500">SKU</span>
                    <span className="text-white font-mono tracking-wider">{selectedVariant.sku}</span>
                </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-900/10 border border-blue-900/30 rounded text-sm text-blue-200">
                <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-400" />
                <p>Authenticity Guaranteed. All products are sourced directly from sovereign mints or verified secondary markets and tested via XRF analysis before shipping.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};