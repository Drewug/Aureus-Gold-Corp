import React from 'react';
import { Link } from 'react-router-dom';
import { Product, CMSSection, CMSContent } from '../types';
import { useCurrency } from '../lib/currencyContext';
import { Truck, ShieldCheck, Lock, ChevronDown, Check } from 'lucide-react';
import { Button, Card } from './ui';

interface SectionProps {
  data: any;
  products?: Product[];
}

export const HeroSection: React.FC<SectionProps> = ({ data }) => (
  <div className="relative h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden">
    <div className="absolute inset-0">
      <img 
        src={data.imageUrl} 
        alt="Hero" 
        className="w-full h-full object-cover opacity-40" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/60 to-transparent" />
    </div>
    
    <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
      <h1 className="text-4xl md:text-7xl font-serif text-white mb-6 drop-shadow-lg">
        {data.title}
      </h1>
      <p className="text-lg md:text-2xl text-gray-200 font-light mb-10 max-w-2xl mx-auto leading-relaxed">
        {data.subtitle}
      </p>
      {data.buttonText && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <a href="#catalog">
                <Button size="lg" className="min-w-[200px] shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                    {data.buttonText}
                </Button>
             </a>
        </div>
      )}
    </div>
  </div>
);

export const TrustSection: React.FC<SectionProps> = ({ data }) => {
    const iconMap: any = { truck: Truck, shield: ShieldCheck, lock: Lock };
    return (
      <div className="bg-charcoal-light border-y border-charcoal-lighter">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {data.badges.map((badge: any, idx: number) => {
                const Icon = iconMap[badge.icon] || ShieldCheck;
                return (
                    <div key={idx} className="flex items-center gap-4 p-4 rounded-lg bg-charcoal/50 border border-charcoal-lighter">
                      <Icon className="h-10 w-10 text-gold" />
                      <div>
                        <h3 className="font-serif text-lg text-white">{badge.title}</h3>
                        <p className="text-sm text-gray-500">{badge.text}</p>
                      </div>
                    </div>
                );
            })}
          </div>
        </div>
      </div>
    );
};

export const IntroSection: React.FC<SectionProps> = ({ data }) => (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-serif text-gold mb-6">{data.heading}</h2>
        <div className="w-24 h-1 bg-gold/20 mx-auto mb-8 rounded-full"></div>
        <p className="text-gray-400 text-lg leading-relaxed">{data.text}</p>
    </div>
);

export const CatalogSection: React.FC<SectionProps> = ({ data, products = [] }) => {
  const { formatPrice } = useCurrency();
  const limit = data.limit || 8;
  const displayProducts = products.slice(0, limit);
  const categories = Array.from(new Set(products.flatMap(p => p.categories)));

  return (
    <div id="catalog" className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-3xl font-serif text-gold">{data.heading || 'Current Inventory'}</h2>
        <div className="flex gap-2">
          {categories.map(cat => (
              <span key={cat} className="hidden sm:inline-block text-xs px-3 py-1 rounded-full border border-charcoal-lighter text-gray-400">
                  {cat}
              </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {displayProducts.map(product => {
          const minPrice = Math.min(...product.variants.map(v => v.price));
          return (
            <Link key={product.id} to={`/product/${product.slug}`} className="group block">
              <Card className="h-full p-0 overflow-hidden hover:border-gold/50 transition-all duration-300">
                <div className="aspect-square relative overflow-hidden bg-white/5">
                  <img 
                    src={product.images[0]} 
                    alt={product.title} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>
                <div className="p-6">
                  <div className="text-xs text-gold mb-2 uppercase tracking-wider">{product.categories[0]}</div>
                  <h3 className="font-serif text-lg text-white mb-2 group-hover:text-gold transition-colors line-clamp-2 min-h-[3.5rem]">
                    {product.title}
                  </h3>
                  <div className="flex items-end justify-between mt-4">
                    <div className="text-gray-400 text-xs">From</div>
                    <div className="font-mono text-xl text-white">{formatPrice(minPrice)}</div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export const FAQSection: React.FC<SectionProps> = ({ data }) => (
    <div className="bg-charcoal-light/30 border-t border-charcoal-lighter">
        <div className="max-w-3xl mx-auto px-4 py-16">
            <h2 className="text-2xl font-serif text-white mb-8 text-center">{data.title || 'FAQ'}</h2>
            <div className="space-y-4">
                {data.items.map((item: any, idx: number) => (
                    <div key={idx} className="border border-charcoal-lighter rounded-lg overflow-hidden">
                        <div className="bg-charcoal-light p-4 font-medium text-white flex justify-between items-center">
                            {item.question}
                        </div>
                        <div className="p-4 bg-charcoal text-gray-400 text-sm leading-relaxed">
                            {item.answer}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const PageBuilder = ({ content, products }: { content: CMSContent, products: Product[] }) => {
    return (
        <div className="bg-charcoal min-h-screen">
            {content.sections
                .filter(section => section.isVisible)
                .map(section => {
                    switch (section.type) {
                        case 'hero': return <HeroSection key={section.id} data={section.content} />;
                        case 'trust': return <TrustSection key={section.id} data={section.content} />;
                        case 'intro': return <IntroSection key={section.id} data={section.content} />;
                        case 'catalog': return <CatalogSection key={section.id} data={section.content} products={products} />;
                        case 'faq': return <FAQSection key={section.id} data={section.content} />;
                        default: return null;
                    }
                })}
        </div>
    );
};