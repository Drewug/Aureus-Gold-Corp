import React, { useState, useEffect } from 'react';
import { SeoGlobalConfig, Product } from '../types';
import { api } from '../lib/api';
import { Button, Card, Input, Label } from './ui';
import { Save, Globe, Eye, RefreshCw } from 'lucide-react';

interface SEOMetadataManagerProps {
    products: Product[];
}

export const SEOMetadataManager: React.FC<SEOMetadataManagerProps> = ({ products }) => {
    const [config, setConfig] = useState<SeoGlobalConfig | null>(null);
    const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

    useEffect(() => {
        api.seo.getConfig().then(setConfig);
        if (products.length > 0) setPreviewProduct(products[0]);
    }, [products]);

    const handleSave = async () => {
        if (!config) return;
        await api.seo.updateConfig(config);
        alert('SEO Templates Updated');
    };

    const renderPreview = (template: string) => {
        if (!previewProduct) return template;
        return template
            .replace('{{title}}', previewProduct.title)
            .replace('{{price}}', `$${previewProduct.variants[0]?.price.toFixed(2)}`)
            .replace('{{sku}}', previewProduct.variants[0]?.sku);
    };

    if (!config) return <div>Loading SEO Config...</div>;

    const previewTitle = renderPreview(config.titleTemplate);
    const previewDesc = renderPreview(config.descriptionTemplate);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <Card>
                    <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-gold" /> Global Templates
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <Label>Page Title Template</Label>
                            <Input 
                                value={config.titleTemplate} 
                                onChange={e => setConfig({...config, titleTemplate: e.target.value})}
                            />
                            <p className="text-xs text-gray-500 mt-1">Variables: <code>{"{{title}}"}</code>, <code>{"{{price}}"}</code>, <code>{"{{sku}}"}</code></p>
                        </div>
                        <div>
                            <Label>Meta Description Template</Label>
                            <textarea 
                                className="w-full h-24 bg-charcoal-lighter border border-charcoal-light rounded p-2 text-sm text-gray-200 focus:border-gold outline-none"
                                value={config.descriptionTemplate}
                                onChange={e => setConfig({...config, descriptionTemplate: e.target.value})}
                            />
                        </div>
                        <div>
                            <Label>Default OG Image</Label>
                            <Input 
                                value={config.defaultOgImage} 
                                onChange={e => setConfig({...config, defaultOgImage: e.target.value})}
                                placeholder="https://..."
                            />
                        </div>
                        <Button onClick={handleSave} className="w-full">
                            <Save className="w-4 h-4 mr-2" /> Save Configuration
                        </Button>
                    </div>
                </Card>
            </div>

            <div className="space-y-6">
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white font-medium flex items-center gap-2">
                            <Eye className="w-5 h-5 text-gold" /> Live Preview
                        </h3>
                        <Button size="sm" variant="secondary" onClick={() => setPreviewProduct(products[Math.floor(Math.random() * products.length)])}>
                            <RefreshCw className="w-3 h-3 mr-2" /> Random Product
                        </Button>
                    </div>

                    <div className="bg-white p-4 rounded mb-6">
                        <Label className="text-gray-500 mb-2">Google SERP Simulator</Label>
                        <div className="font-sans">
                            <div className="text-[#1a0dab] text-xl truncate hover:underline cursor-pointer font-normal">
                                {previewTitle}
                            </div>
                            <div className="text-[#006621] text-sm">https://aureus.demo/product/{previewProduct?.slug}</div>
                            <div className="text-[#545454] text-sm leading-snug line-clamp-2">
                                {previewDesc}
                            </div>
                        </div>
                    </div>

                    <div className="bg-charcoal-lighter border border-charcoal-light p-4 rounded">
                        <Label className="text-gray-400 mb-2">Facebook / Social Share</Label>
                        <div className="bg-charcoal border border-charcoal-lighter rounded overflow-hidden max-w-sm mx-auto">
                            <div className="aspect-video bg-black flex items-center justify-center">
                                {previewProduct?.images[0] ? (
                                    <img src={previewProduct.images[0]} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <span className="text-gray-600 text-xs">No Image</span>
                                )}
                            </div>
                            <div className="p-3 bg-[#18191a]">
                                <div className="text-[#b0b3b8] text-xs uppercase mb-1">AUREUS.DEMO</div>
                                <div className="text-[#e4e6eb] font-bold leading-tight mb-1">{previewTitle}</div>
                                <div className="text-[#b0b3b8] text-xs line-clamp-1">{previewDesc}</div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};