import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { api } from '../../lib/api';
import { MultiCurrencySettings, CurrencyConfig, RateHistoryPoint } from '../../types';
import { Card, PageHeader, Button, Label, Input, Badge } from '../../components/ui';
import { Save, RefreshCw, Activity, DollarSign } from 'lucide-react';
import { formatDate } from '../../lib/utils';

export const Currency = () => {
    const [settings, setSettings] = useState<MultiCurrencySettings | null>(null);
    const [history, setHistory] = useState<RateHistoryPoint[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const s = await api.currency.getSettings();
        const h = await api.currency.getHistory();
        setSettings(s);
        setHistory(h);
    };

    const handleSave = async () => {
        if (!settings) return;
        setLoading(true);
        await api.currency.updateSettings(settings);
        setLoading(false);
        alert('Currency settings updated.');
    };

    const handleUpdateCurrency = (code: string, field: keyof CurrencyConfig, value: any) => {
        if (!settings) return;
        const updatedCurrencies = settings.currencies.map(c => 
            c.code === code ? { ...c, [field]: value } : c
        );
        setSettings({ ...settings, currencies: updatedCurrencies });
    };

    const handleForceSync = async () => {
        setLoading(true);
        await api.currency.simulateLiveRates(); // Force a simulation step
        await loadData();
        setLoading(false);
    };

    // Helper for simple SVG chart
    const renderSparkline = (code: string) => {
        const points = history.filter(h => h.code === code).slice(-20); // Last 20 points
        if (points.length < 2) return null;

        const min = Math.min(...points.map(p => p.rate));
        const max = Math.max(...points.map(p => p.rate));
        const range = max - min || 1;
        const height = 40;
        const width = 100;

        const pathData = points.map((p, i) => {
            const x = (i / (points.length - 1)) * width;
            const y = height - ((p.rate - min) / range) * height;
            return `${x},${y}`;
        }).join(' ');

        return (
            <svg width="100%" height="40" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
                <polyline points={pathData} fill="none" stroke="#d4af37" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
        );
    };

    if (!settings) return <AdminLayout><div>Loading...</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <PageHeader title="Multi-Currency Engine" subtitle="Manage exchange rates, margins, and tax rules." />
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={handleForceSync} isLoading={loading}>
                        <RefreshCw className="w-4 h-4 mr-2" /> Sync Live Rates
                    </Button>
                    <Button onClick={handleSave} isLoading={loading}>
                        <Save className="w-4 h-4 mr-2" /> Save Configuration
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Settings */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium text-white flex items-center gap-2">
                                <Activity className="w-5 h-5 text-gold" /> Active Currencies
                            </h3>
                            <div className="flex bg-charcoal-lighter rounded p-1">
                                <button 
                                    className={`px-3 py-1 text-xs rounded transition-colors ${settings.mode === 'live_simulated' ? 'bg-gold text-charcoal font-bold' : 'text-gray-400 hover:text-white'}`}
                                    onClick={() => setSettings({...settings, mode: 'live_simulated'})}
                                >
                                    Live (Simulated)
                                </button>
                                <button 
                                    className={`px-3 py-1 text-xs rounded transition-colors ${settings.mode === 'manual' ? 'bg-gold text-charcoal font-bold' : 'text-gray-400 hover:text-white'}`}
                                    onClick={() => setSettings({...settings, mode: 'manual'})}
                                >
                                    Manual Fixed
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-charcoal-lighter text-gray-400 uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3">Currency</th>
                                        <th className="px-4 py-3 w-32">Rate (to USD)</th>
                                        <th className="px-4 py-3 w-24">Margin %</th>
                                        <th className="px-4 py-3 w-24">Tax %</th>
                                        <th className="px-4 py-3">Rounding</th>
                                        <th className="px-4 py-3 text-right">Trend</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-charcoal-lighter">
                                    {settings.currencies.map(c => (
                                        <tr key={c.code} className="hover:bg-charcoal-lighter/30">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-white w-8">{c.code}</span>
                                                    <span className="text-gray-500 text-xs">{c.name}</span>
                                                    {c.isBase && <Badge className="ml-2">Base</Badge>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Input 
                                                    type="number" 
                                                    step="0.0001" 
                                                    value={c.exchangeRate} 
                                                    disabled={c.isBase || settings.mode === 'live_simulated'}
                                                    onChange={e => handleUpdateCurrency(c.code, 'exchangeRate', parseFloat(e.target.value))}
                                                    className="w-24 text-right font-mono"
                                                />
                                            </td>
                                            <td className="px-4 py-4">
                                                <Input 
                                                    type="number" 
                                                    step="0.1" 
                                                    value={c.marginPercent} 
                                                    onChange={e => handleUpdateCurrency(c.code, 'marginPercent', parseFloat(e.target.value))}
                                                    className="w-20 text-right"
                                                />
                                            </td>
                                            <td className="px-4 py-4">
                                                <Input 
                                                    type="number" 
                                                    step="0.1" 
                                                    value={c.taxPercent} 
                                                    onChange={e => handleUpdateCurrency(c.code, 'taxPercent', parseFloat(e.target.value))}
                                                    className="w-20 text-right"
                                                />
                                            </td>
                                            <td className="px-4 py-4">
                                                <select 
                                                    className="h-9 bg-charcoal border border-charcoal-lighter rounded text-xs text-gray-300 focus:border-gold outline-none"
                                                    value={c.rounding}
                                                    onChange={e => handleUpdateCurrency(c.code, 'rounding', e.target.value)}
                                                >
                                                    <option value="none">None</option>
                                                    <option value="decimals_2">.00</option>
                                                    <option value="nearest_1">Integer</option>
                                                    <option value="nearest_5">Nearest 5</option>
                                                    <option value="nearest_100">Nearest 100</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-4 w-32">
                                                {!c.isBase && renderSparkline(c.code)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Info Panel */}
                <div className="space-y-6">
                    <Card>
                        <h3 className="text-white font-medium mb-2">Engine Status</h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between border-b border-charcoal-lighter pb-2">
                                <span className="text-gray-500">Base Currency</span>
                                <span className="text-gold font-mono">{settings.baseCurrency}</span>
                            </div>
                            <div className="flex justify-between border-b border-charcoal-lighter pb-2">
                                <span className="text-gray-500">Active Mode</span>
                                <span className={settings.mode === 'live_simulated' ? 'text-green-400' : 'text-blue-400'}>
                                    {settings.mode === 'live_simulated' ? 'Live Stream' : 'Manual Override'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Last Sync</span>
                                <span className="text-gray-300 text-xs">{formatDate(settings.lastUpdated)}</span>
                            </div>
                        </div>
                    </Card>

                    <div className="bg-charcoal p-4 rounded border border-charcoal-lighter text-sm text-gray-400">
                        <div className="flex items-center gap-2 text-gold font-bold mb-2">
                            <DollarSign className="w-4 h-4" /> Pricing Logic
                        </div>
                        <p className="mb-2">Final Price = (Base Price * Rate) + Margin%</p>
                        <p>Rounding rules apply after margin calculation. Tax is calculated on top of the rounded price.</p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};