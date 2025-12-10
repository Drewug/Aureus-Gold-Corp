import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { api } from '../../lib/api';
import { localDb } from '../../lib/localDb';
import { ScheduledTask, AutomationSettings, Product } from '../../types';
import { Button, Card, PageHeader, Input, Label, Badge } from '../../components/ui';
import { runCronJobs } from '../../lib/cron';
import { Play, Plus, Trash2, Calendar, Globe, Zap, Save, Clock } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const Automation = () => {
    const [tasks, setTasks] = useState<ScheduledTask[]>([]);
    const [settings, setSettings] = useState<AutomationSettings>({ webhookUrl: '', enabledEvents: { lowStock: true, orderCreated: true, dailySummary: false } });
    const [products, setProducts] = useState<Product[]>([]);
    
    // Create Task Modal State
    const [isCreating, setIsCreating] = useState(false);
    const [newTaskName, setNewTaskName] = useState('');
    const [newTaskType, setNewTaskType] = useState<'price_update'>('price_update'); // Only price update for basic UI
    const [targetProduct, setTargetProduct] = useState('');
    const [targetVariant, setTargetVariant] = useState('');
    const [newPrice, setNewPrice] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setTasks(localDb.getScheduledTasks());
        setSettings(localDb.getAutomationSettings());
        setProducts(await api.products.list());
    };

    const handleRunCron = async () => {
        await runCronJobs();
        alert('Cron job executed manually.');
        loadData();
    };

    const handleSaveSettings = () => {
        localDb.saveAutomationSettings(settings);
        alert('Automation settings saved.');
    };

    const handleCreateTask = () => {
        if (!newTaskName || !targetVariant || !newPrice || !scheduleTime) return;

        const task: ScheduledTask = {
            id: uuidv4(),
            name: newTaskName,
            type: 'price_update',
            targetId: targetVariant,
            payload: { price: Number(newPrice) },
            scheduledFor: new Date(scheduleTime).toISOString(),
            status: 'pending'
        };

        const updatedTasks = [...tasks, task];
        localDb.saveScheduledTasks(updatedTasks);
        setTasks(updatedTasks);
        setIsCreating(false);
        setNewTaskName('');
        setTargetProduct('');
        setNewPrice('');
        setScheduleTime('');
    };

    const deleteTask = (id: string) => {
        const updated = tasks.filter(t => t.id !== id);
        localDb.saveScheduledTasks(updated);
        setTasks(updated);
    };

    const selectedProduct = products.find(p => p.id === targetProduct);

    return (
        <AdminLayout>
            <PageHeader title="Automation Center" subtitle="Manage scheduled tasks and external integrations." />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Configuration */}
                <div className="space-y-6">
                    <Card>
                        <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-gold" /> Webhook Configuration
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Send JSON payloads to an external URL when specific system events occur.
                        </p>
                        <div className="space-y-4">
                            <div>
                                <Label>Endpoint URL</Label>
                                <Input 
                                    placeholder="https://api.external.com/webhook" 
                                    value={settings.webhookUrl}
                                    onChange={e => setSettings({...settings, webhookUrl: e.target.value})}
                                />
                            </div>
                            <div>
                                <Label>Trigger Events</Label>
                                <div className="space-y-2 mt-2">
                                    <label className="flex items-center gap-2 text-sm text-gray-300">
                                        <input 
                                            type="checkbox" 
                                            className="text-gold focus:ring-gold"
                                            checked={settings.enabledEvents.lowStock}
                                            onChange={e => setSettings({...settings, enabledEvents: {...settings.enabledEvents, lowStock: e.target.checked}})}
                                        />
                                        Low Stock Alerts
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-gray-300">
                                        <input 
                                            type="checkbox" 
                                            className="text-gold focus:ring-gold"
                                            checked={settings.enabledEvents.orderCreated}
                                            onChange={e => setSettings({...settings, enabledEvents: {...settings.enabledEvents, orderCreated: e.target.checked}})}
                                        />
                                        Order Created
                                    </label>
                                </div>
                            </div>
                            <Button onClick={handleSaveSettings} className="w-full">
                                <Save className="w-4 h-4 mr-2" /> Save Settings
                            </Button>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-gold" /> Cron Simulator
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            System cron runs automatically every 30 seconds. You can trigger it manually here.
                        </p>
                        <Button variant="secondary" className="w-full" onClick={handleRunCron}>
                            <Play className="w-4 h-4 mr-2" /> Run Now
                        </Button>
                    </Card>
                </div>

                {/* Right: Scheduler */}
                <div className="lg:col-span-2">
                    <Card>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-white font-medium flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-gold" /> Task Scheduler
                                </h3>
                                <p className="text-sm text-gray-500">Plan product updates and content changes.</p>
                            </div>
                            <Button onClick={() => setIsCreating(true)}>
                                <Plus className="w-4 h-4 mr-2" /> Schedule Task
                            </Button>
                        </div>

                        {/* Task Creation Form */}
                        {isCreating && (
                            <div className="bg-charcoal border border-charcoal-lighter p-4 rounded mb-6 animate-in fade-in slide-in-from-top-4">
                                <h4 className="text-white text-sm font-bold mb-4">New Price Update</h4>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <Label>Task Name</Label>
                                        <Input value={newTaskName} onChange={e => setNewTaskName(e.target.value)} placeholder="e.g. Flash Sale" />
                                    </div>
                                    <div>
                                        <Label>Run Time</Label>
                                        <Input type="datetime-local" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Product</Label>
                                        <select 
                                            className="w-full h-10 rounded-md border border-charcoal-lighter bg-charcoal-light px-3 text-sm text-gray-100"
                                            value={targetProduct}
                                            onChange={e => setTargetProduct(e.target.value)}
                                        >
                                            <option value="">Select Product</option>
                                            {products.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <Label>Variant</Label>
                                        <select 
                                            className="w-full h-10 rounded-md border border-charcoal-lighter bg-charcoal-light px-3 text-sm text-gray-100"
                                            value={targetVariant}
                                            onChange={e => setTargetVariant(e.target.value)}
                                            disabled={!targetProduct}
                                        >
                                            <option value="">Select Variant</option>
                                            {selectedProduct?.variants.map(v => <option key={v.id} value={v.id}>{v.name} (${v.price})</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <Label>New Price</Label>
                                        <Input type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="0.00" />
                                    </div>
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <Button variant="secondary" onClick={() => setIsCreating(false)}>Cancel</Button>
                                    <Button onClick={handleCreateTask}>Confirm Schedule</Button>
                                </div>
                            </div>
                        )}

                        {/* Task List */}
                        <div className="space-y-2">
                            {tasks.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">No scheduled tasks.</div>
                            ) : (
                                tasks.sort((a,b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()).map(task => (
                                    <div key={task.id} className="flex items-center justify-between p-3 bg-charcoal rounded border border-charcoal-lighter">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded ${task.status === 'completed' ? 'bg-green-900/20 text-green-400' : task.status === 'failed' ? 'bg-red-900/20 text-red-400' : 'bg-blue-900/20 text-blue-400'}`}>
                                                <Clock className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-white">{task.name}</div>
                                                <div className="text-xs text-gray-500">
                                                    {task.type === 'price_update' ? 'Update Price' : 'Content Swap'} &bull; {new Date(task.scheduledFor).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge variant={task.status === 'completed' ? 'success' : task.status === 'failed' ? 'error' : 'default'}>
                                                {task.status}
                                            </Badge>
                                            <button onClick={() => deleteTask(task.id)} className="text-gray-500 hover:text-red-400">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
};
