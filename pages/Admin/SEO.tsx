import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { PageHeader } from '../../components/ui';
import { api } from '../../lib/api';
import { Product } from '../../types';
import { SEOMetadataManager } from '../../components/SEOMetadataManager';
import { XMLFeedsPanel } from '../../components/XMLFeedsPanel';
import { StructuredDataTester } from '../../components/StructuredDataTester';
import { PageSpeedSimulator } from '../../components/PageSpeedSimulator';
import { KeywordInsights } from '../../components/KeywordInsights';
import { Globe, Code, Rss, Gauge, TrendingUp } from 'lucide-react';

type Tab = 'meta' | 'schema' | 'feeds' | 'speed' | 'keywords';

export const SEO = () => {
    const [activeTab, setActiveTab] = useState<Tab>('meta');
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        api.products.list().then(setProducts);
    }, []);

    const tabs = [
        { id: 'meta', label: 'Metadata & Templates', icon: Globe },
        { id: 'schema', label: 'Structured Data', icon: Code },
        { id: 'feeds', label: 'Feed Optimizer', icon: Rss },
        { id: 'speed', label: 'Performance', icon: Gauge },
        { id: 'keywords', label: 'Keyword Insights', icon: TrendingUp },
    ];

    return (
        <AdminLayout>
            <PageHeader title="SEO & Feeds" subtitle="Search visibility, data feeds, and performance optimization." />

            <div className="mb-8 overflow-x-auto">
                <div className="flex gap-1 border-b border-charcoal-lighter min-w-max">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as Tab)}
                                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                                    isActive 
                                        ? 'border-gold text-gold' 
                                        : 'border-transparent text-gray-400 hover:text-white hover:bg-charcoal-lighter/20'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="min-h-[500px]">
                {activeTab === 'meta' && <SEOMetadataManager products={products} />}
                {activeTab === 'schema' && <StructuredDataTester products={products} />}
                {activeTab === 'feeds' && <XMLFeedsPanel />}
                {activeTab === 'speed' && <PageSpeedSimulator />}
                {activeTab === 'keywords' && <KeywordInsights products={products} />}
            </div>
        </AdminLayout>
    );
};