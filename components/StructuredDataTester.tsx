import React, { useState } from 'react';
import { Product } from '../types';
import { Card, Button, Label } from './ui';
import { Code, CheckCircle, AlertTriangle, Play } from 'lucide-react';

interface StructuredDataTesterProps {
    products: Product[];
}

export const StructuredDataTester: React.FC<StructuredDataTesterProps> = ({ products }) => {
    const [jsonLd, setJsonLd] = useState('');
    const [result, setResult] = useState<'valid' | 'error' | 'warning' | null>(null);
    const [messages, setMessages] = useState<string[]>([]);

    const generateJsonLd = () => {
        if (products.length === 0) return;
        const p = products[0];
        const v = p.variants[0];
        
        // Intentionally create potential issues for demo purposes randomly
        const missingBrand = Math.random() > 0.7;
        
        const schema = {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": p.title,
            "image": p.images,
            "description": p.description,
            "sku": v.sku,
            "brand": missingBrand ? undefined : {
                "@type": "Brand",
                "name": v.mint || "Aureus"
            },
            "offers": {
                "@type": "Offer",
                "url": `https://aureus.demo/product/${p.slug}`,
                "priceCurrency": "USD",
                "price": v.price,
                "itemCondition": "https://schema.org/NewCondition",
                "availability": v.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
            }
        };
        setJsonLd(JSON.stringify(schema, null, 2));
        setResult(null);
        setMessages([]);
    };

    const validate = () => {
        if (!jsonLd) return;
        try {
            const parsed = JSON.parse(jsonLd);
            const msgs = [];
            let status: 'valid' | 'error' | 'warning' = 'valid';

            if (!parsed.name) { msgs.push("Missing required field: 'name'"); status = 'error'; }
            if (!parsed.image || parsed.image.length === 0) { msgs.push("Missing required field: 'image'"); status = 'warning'; }
            if (!parsed.offers?.price) { msgs.push("Missing 'offers.price'"); status = 'error'; }
            if (!parsed.brand) { msgs.push("Recommended field 'brand' is missing."); status = 'warning'; }

            setResult(status);
            setMessages(msgs.length > 0 ? msgs : ['Schema is valid and eligible for Rich Results.']);
        } catch (e) {
            setResult('error');
            setMessages(['Invalid JSON syntax.']);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            <div className="flex flex-col gap-4">
                <Card className="flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white font-medium flex items-center gap-2">
                            <Code className="w-5 h-5 text-gold" /> Schema Generator
                        </h3>
                        <Button size="sm" variant="secondary" onClick={generateJsonLd}>
                            Generate Sample
                        </Button>
                    </div>
                    <textarea 
                        className="flex-1 w-full bg-charcoal-lighter border border-charcoal-light rounded p-4 font-mono text-xs text-green-400 focus:border-gold outline-none resize-none"
                        value={jsonLd}
                        onChange={e => setJsonLd(e.target.value)}
                        placeholder="// Generate or paste JSON-LD here..."
                    />
                </Card>
            </div>

            <div className="flex flex-col gap-4">
                <Card className="h-full">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-white font-medium">Validation Results</h3>
                        <Button onClick={validate} disabled={!jsonLd}>
                            <Play className="w-4 h-4 mr-2" /> Test Code
                        </Button>
                    </div>

                    {result ? (
                        <div className={`p-6 rounded border ${
                            result === 'valid' ? 'bg-green-900/10 border-green-900/30' : 
                            result === 'warning' ? 'bg-yellow-900/10 border-yellow-900/30' : 
                            'bg-red-900/10 border-red-900/30'
                        }`}>
                            <div className="flex items-center gap-2 mb-4">
                                {result === 'valid' && <CheckCircle className="w-6 h-6 text-green-500" />}
                                {result === 'warning' && <AlertTriangle className="w-6 h-6 text-yellow-500" />}
                                {result === 'error' && <AlertTriangle className="w-6 h-6 text-red-500" />}
                                <span className={`text-lg font-bold ${
                                    result === 'valid' ? 'text-green-400' : 
                                    result === 'warning' ? 'text-yellow-400' : 
                                    'text-red-400'
                                }`}>
                                    {result === 'valid' ? 'Valid Structured Data' : result === 'warning' ? 'Warnings Detected' : 'Critical Errors'}
                                </span>
                            </div>
                            <ul className="list-disc list-inside text-sm space-y-2 text-gray-300">
                                {messages.map((msg, i) => <li key={i}>{msg}</li>)}
                            </ul>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-12">
                            Run the test to see validation results against Schema.org standards for Product objects.
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};