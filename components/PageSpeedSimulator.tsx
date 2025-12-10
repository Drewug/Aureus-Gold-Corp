import React, { useState } from 'react';
import { api } from '../lib/api';
import { Card, Button, Label } from './ui';
import { Gauge, Play, Check, Zap, Layout } from 'lucide-react';

const MetricCard = ({ label, value, unit, score }: { label: string, value: number, unit: string, score: 'good' | 'needs-improvement' | 'poor' }) => {
    const color = score === 'good' ? 'text-green-400' : score === 'needs-improvement' ? 'text-yellow-400' : 'text-red-400';
    const borderColor = score === 'good' ? 'border-green-500' : score === 'needs-improvement' ? 'border-yellow-500' : 'border-red-500';
    
    return (
        <div className={`flex flex-col items-center justify-center p-6 rounded-lg bg-charcoal border ${borderColor} border-opacity-30`}>
            <span className={`text-3xl font-bold ${color} mb-1`}>{value}{unit}</span>
            <span className="text-gray-400 text-sm uppercase tracking-wider">{label}</span>
        </div>
    );
};

export const PageSpeedSimulator = () => {
    const [metrics, setMetrics] = useState<{ lcp: number, cls: number, fid: number } | null>(null);
    const [loading, setLoading] = useState(false);

    const runAnalysis = async () => {
        setLoading(true);
        const res = await api.seo.simulatePageSpeed();
        setMetrics(res);
        setLoading(false);
    };

    const getScore = (val: number, type: 'lcp' | 'cls' | 'fid') => {
        if (type === 'lcp') return val <= 2.5 ? 'good' : val <= 4.0 ? 'needs-improvement' : 'poor';
        if (type === 'cls') return val <= 0.1 ? 'good' : val <= 0.25 ? 'needs-improvement' : 'poor';
        if (type === 'fid') return val <= 100 ? 'good' : val <= 300 ? 'needs-improvement' : 'poor';
        return 'poor';
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-3 flex justify-between items-center bg-charcoal-light p-4 rounded border border-charcoal-lighter">
                <div>
                    <h3 className="text-white font-medium flex items-center gap-2">
                        <Gauge className="w-5 h-5 text-gold" /> Core Web Vitals Simulator
                    </h3>
                    <p className="text-sm text-gray-500">Estimates performance based on current asset load and render complexity.</p>
                </div>
                <Button onClick={runAnalysis} isLoading={loading}>
                    <Play className="w-4 h-4 mr-2" /> Run Audit
                </Button>
            </div>

            {metrics && (
                <>
                    <MetricCard 
                        label="LCP (Loading)" 
                        value={metrics.lcp} 
                        unit="s" 
                        score={getScore(metrics.lcp, 'lcp')} 
                    />
                    <MetricCard 
                        label="CLS (Stability)" 
                        value={metrics.cls} 
                        unit="" 
                        score={getScore(metrics.cls, 'cls')} 
                    />
                    <MetricCard 
                        label="FID (Interactivity)" 
                        value={metrics.fid} 
                        unit="ms" 
                        score={getScore(metrics.fid, 'fid')} 
                    />

                    <div className="lg:col-span-3">
                        <Card>
                            <h4 className="text-white font-medium mb-4">Optimization Opportunities</h4>
                            <div className="space-y-3">
                                {metrics.lcp > 2.5 && (
                                    <div className="flex gap-3 items-start p-3 bg-red-900/10 rounded">
                                        <Zap className="w-5 h-5 text-red-400 mt-0.5" />
                                        <div>
                                            <div className="text-red-400 font-bold text-sm">Reduce Largest Contentful Paint</div>
                                            <p className="text-gray-400 text-xs">The hero image is lazy-loaded. Consider eager loading the LCP element.</p>
                                        </div>
                                    </div>
                                )}
                                {metrics.cls > 0.1 && (
                                    <div className="flex gap-3 items-start p-3 bg-yellow-900/10 rounded">
                                        <Layout className="w-5 h-5 text-yellow-400 mt-0.5" />
                                        <div>
                                            <div className="text-yellow-400 font-bold text-sm">Cumulative Layout Shift Detected</div>
                                            <p className="text-gray-400 text-xs">Image dimensions are missing on some product thumbnails causing reflow.</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex gap-3 items-start p-3 bg-green-900/10 rounded">
                                    <Check className="w-5 h-5 text-green-400 mt-0.5" />
                                    <div>
                                        <div className="text-green-400 font-bold text-sm">Good Caching Policy</div>
                                        <p className="text-gray-400 text-xs">Static assets are served with an efficient cache-control policy.</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </>
            )}
            
            {!metrics && !loading && (
                <div className="lg:col-span-3 text-center py-12 text-gray-500">
                    Click "Run Audit" to simulate performance metrics.
                </div>
            )}
        </div>
    );
};