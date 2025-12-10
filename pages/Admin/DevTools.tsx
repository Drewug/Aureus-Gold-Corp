import React from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { PageHeader, Button, Card } from '../../components/ui';
import { DataExporter } from '../../components/DataExporter';
import { ApiPlayground } from '../../components/ApiPlayground';
import { devUtils } from '../../lib/devUtils';
import { RotateCcw, AlertTriangle } from 'lucide-react';

export const DevTools = () => {
    const handleReset = () => {
        if (confirm('WARNING: This will wipe all orders, products, CMS settings, and logs. It will reset the application to its initial seeded state. Are you sure?')) {
            devUtils.resetToSeeded();
        }
    };

    return (
        <AdminLayout>
            <PageHeader title="Developer Tools" subtitle="Utilities for debugging and data management." />
            
            <div className="space-y-8">
                <Card className="border-red-900/50 bg-red-900/10">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="text-red-400 font-bold flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" /> Danger Zone
                            </h3>
                            <p className="text-sm text-gray-400 mt-1">Resetting will clear all local storage data and reload the page. Use this to restore the initial demo state.</p>
                        </div>
                        <Button variant="danger" onClick={handleReset} className="whitespace-nowrap">
                            <RotateCcw className="w-4 h-4 mr-2" /> Reset to Seeded State
                        </Button>
                    </div>
                </Card>

                <DataExporter />
                
                <ApiPlayground />
            </div>
        </AdminLayout>
    );
};
