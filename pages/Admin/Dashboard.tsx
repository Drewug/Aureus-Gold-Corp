import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { api } from '../../lib/api';
import { Order, Product, LogEntry } from '../../types';
import { Card, PageHeader, Button } from '../../components/ui';
import { formatCurrency } from '../../lib/utils';
import { DollarSign, Package, ShoppingCart, Activity, RefreshCw, Trash2, Download, Play } from 'lucide-react';
import { LogsViewer } from '../../components/LogsViewer';
import { Link } from 'react-router-dom';
import { runCronJobs } from '../../lib/cron';

export const Dashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [o, p, l] = await Promise.all([
        api.orders.list(), 
        api.products.list(), 
        api.logs.list()
    ]);
    setOrders(o);
    setProducts(p);
    setLogs(l);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCron = async () => {
      await runCronJobs();
      await api.logs.create('system', 'Manual Cron', 'Manual cron job triggered by admin.', { author: 'Admin' });
      loadData();
      alert('Cron job executed.');
  };

  const handleClearOrders = async () => {
      if(confirm('Are you sure? This will delete all order records.')) {
          await api.orders.clearAll();
          loadData();
      }
  };

  if (loading) return <AdminLayout><div>Loading...</div></AdminLayout>;

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const lowStockCount = products.reduce((count, p) => count + p.variants.filter(v => v.stock < (v.lowStockThreshold || 5)).length, 0);
  const lastIngest = logs.find(l => l.type === 'ingest');

  return (
    <AdminLayout>
      <PageHeader title="Dashboard" subtitle="Store overview and system status." />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Total Revenue</h3>
                <DollarSign className="w-5 h-5 text-gold" />
            </div>
            <div className="text-2xl font-bold text-white">{formatCurrency(totalRevenue)}</div>
        </Card>
        <Link to="/admin/orders">
            <Card className="p-6 hover:border-gold/50 transition-colors cursor-pointer h-full">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-400">Pending Orders</h3>
                    <ShoppingCart className="w-5 h-5 text-gold" />
                </div>
                <div className="text-2xl font-bold text-white">{pendingOrders}</div>
                <div className="text-xs text-gray-500 mt-1">Action required</div>
            </Card>
        </Link>
        <Link to="/admin/inventory">
            <Card className="p-6 hover:border-gold/50 transition-colors cursor-pointer h-full">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-400">Low Stock Variants</h3>
                    <Activity className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-2xl font-bold text-red-400">{lowStockCount}</div>
                <div className="text-xs text-gray-500 mt-1">Below threshold</div>
            </Card>
        </Link>
        <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Active Products</h3>
                <Package className="w-5 h-5 text-gold" />
            </div>
            <div className="text-2xl font-bold text-white">{products.length}</div>
            <div className="text-xs text-gray-500 mt-1">Last ingest: {lastIngest ? new Date(lastIngest.timestamp).toLocaleDateString() : 'Never'}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
               {/* Quick Actions */}
              <Card>
                  <h3 className="text-lg font-medium text-white mb-4">Quick Actions</h3>
                  <div className="flex flex-wrap gap-3">
                      <Button variant="secondary" onClick={handleCron}>
                          <Play className="w-4 h-4 mr-2" /> Run System Cron
                      </Button>
                      <Button variant="secondary" onClick={() => window.open('#/admin/feeds', '_self')}>
                          <RefreshCw className="w-4 h-4 mr-2" /> Regenerate Feeds
                      </Button>
                      <Button variant="outline" onClick={() => {
                          const blob = new Blob([JSON.stringify(products, null, 2)], {type: 'application/json'});
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'products_backup.json';
                          a.click();
                      }}>
                          <Download className="w-4 h-4 mr-2" /> Export Products JSON
                      </Button>
                      <Button variant="danger" onClick={handleClearOrders}>
                          <Trash2 className="w-4 h-4 mr-2" /> Clear Test Orders
                      </Button>
                  </div>
              </Card>

              {/* Recent Logs */}
              <Card>
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-white">System Activity</h3>
                      <Link to="/admin/logs" className="text-sm text-gold hover:underline">View All</Link>
                  </div>
                  <LogsViewer logs={logs} limit={5} onRefresh={loadData} />
              </Card>
          </div>

          <div className="space-y-6">
              <Card className="bg-charcoal-light/50">
                  <h3 className="text-white font-medium mb-2">System Status</h3>
                  <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                          <span className="text-gray-500">API Status</span>
                          <span className="text-green-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Online</span>
                      </div>
                      <div className="flex justify-between">
                          <span className="text-gray-500">Storage Usage</span>
                          <span className="text-gray-300">{(JSON.stringify(localStorage).length / 1024).toFixed(2)} KB</span>
                      </div>
                      <div className="flex justify-between">
                          <span className="text-gray-500">Version</span>
                          <span className="text-gray-300">v1.0.4 (Beta)</span>
                      </div>
                  </div>
              </Card>
          </div>
      </div>
    </AdminLayout>
  );
};