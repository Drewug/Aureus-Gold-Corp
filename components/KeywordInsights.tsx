import React, { useState } from 'react';
import { api } from '../lib/api';
import { Product, KeywordOpportunity } from '../types';
import { Card, Button, Label, Input } from './ui';
import { Search, TrendingUp, BarChart2 } from 'lucide-react';

interface KeywordInsightsProps {
    products: Product[];
}

export const KeywordInsights: React.FC<KeywordInsightsProps> = ({ products }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [opportunities, setOpportunities] = useState<KeywordOpportunity[]>([]);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!searchTerm) return;
        setLoading(true);
        const results = await api.seo.analyzeKeywords(searchTerm);
        setOpportunities(results);
        setLoading(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <Label>Seed Keyword or Product Title</Label>
                    <div className="flex gap-2 mt-2">
                        <Input 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)} 
                            placeholder="e.g. Gold Coins" 
                        />
                        <Button onClick={handleAnalyze} isLoading={loading}>
                            <Search className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="mt-4">
                        <Label>Quick Select</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {products.slice(0, 5).map(p => (
                                <button 
                                    key={p.id} 
                                    onClick={() => setSearchTerm(p.title)}
                                    className="text-xs bg-charcoal-lighter hover:bg-gold hover:text-charcoal px-2 py-1 rounded transition-colors text-gray-300"
                                >
                                    {p.title}
                                </button>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>

            <div className="lg:col-span-2">
                <Card className="h-full flex flex-col">
                    <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-gold" /> Opportunity Explorer
                    </h3>
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-charcoal-lighter text-gray-400 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3">Keyword</th>
                                    <th className="px-4 py-3">Volume</th>
                                    <th className="px-4 py-3">Difficulty</th>
                                    <th className="px-4 py-3">Relevance</th>
                                    <th className="px-4 py-3 text-right">Est. Rank</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-charcoal-lighter">
                                {opportunities.length === 0 ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-gray-500">Enter a seed keyword to analyze opportunities.</td></tr>
                                ) : (
                                    opportunities.map((opp, idx) => (
                                        <tr key={idx} className="hover:bg-charcoal-lighter/30">
                                            <td className="px-4 py-3 font-medium text-white">{opp.keyword}</td>
                                            <td className="px-4 py-3 text-gray-300">{opp.volume}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1.5 bg-charcoal-lighter rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full ${opp.difficulty > 70 ? 'bg-red-500' : opp.difficulty > 40 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                                                            style={{width: `${opp.difficulty}%`}}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs text-gray-500">{opp.difficulty}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-green-400 font-bold">{opp.relevance}%</span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-gold font-mono">
                                                #{opp.currentRank}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
};