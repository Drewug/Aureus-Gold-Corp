import React from 'react';
import { devUtils } from '../lib/devUtils';
import { Button, Card } from './ui';
import { Download, Database } from 'lucide-react';

export const DataExporter = () => {
    return (
        <Card>
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-gold" /> Export Datasets
            </h3>
            <p className="text-sm text-gray-500 mb-6">Download raw JSON data currently stored in the browser's LocalStorage.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="secondary" onClick={() => devUtils.exportData('aureus_products_v1', 'products.json')}>
                    <Download className="w-4 h-4 mr-2" /> Products
                </Button>
                <Button variant="secondary" onClick={() => devUtils.exportData('aureus_orders', 'orders.json')}>
                    <Download className="w-4 h-4 mr-2" /> Orders
                </Button>
                 <Button variant="secondary" onClick={() => devUtils.exportData('aureus_cms_v1', 'cms.json')}>
                    <Download className="w-4 h-4 mr-2" /> CMS
                </Button>
                 <Button variant="secondary" onClick={() => devUtils.exportData('aureus_logs', 'logs.json')}>
                    <Download className="w-4 h-4 mr-2" /> Logs
                </Button>
            </div>
        </Card>
    );
};
