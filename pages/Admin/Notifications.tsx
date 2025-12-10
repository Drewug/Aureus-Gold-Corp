import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { PageHeader, Card, Button } from '../../components/ui';
import { api } from '../../lib/api';
import { NotificationTemplate } from '../../types';
import { NotificationTemplateEditor } from '../../components/NotificationTemplateEditor';
import { BroadcastManager } from '../../components/BroadcastManager';
import { Mail, MessageSquare, Megaphone, Smartphone } from 'lucide-react';

export const Notifications = () => {
    const [activeTab, setActiveTab] = useState<'templates' | 'broadcasts'>('templates');
    const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        const t = await api.notifications.getTemplates();
        setTemplates(t);
        if (t.length > 0 && !selectedTemplateId) {
            setSelectedTemplateId(t[0].id);
        }
    };

    const handleSaveTemplate = async (updated: NotificationTemplate) => {
        await api.notifications.saveTemplate(updated);
        await loadTemplates();
        alert('Template updated successfully.');
    };

    const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

    return (
        <AdminLayout>
            <PageHeader title="Communications" subtitle="Manage automated notifications and admin alerts." />

            <div className="mb-6 flex gap-1 border-b border-charcoal-lighter">
                <button
                    onClick={() => setActiveTab('templates')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'templates' ? 'border-gold text-gold' : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                    <Mail className="w-4 h-4" /> Templates & Triggers
                </button>
                <button
                    onClick={() => setActiveTab('broadcasts')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'broadcasts' ? 'border-gold text-gold' : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                    <Megaphone className="w-4 h-4" /> Admin Broadcasts
                </button>
            </div>

            {activeTab === 'templates' && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-250px)]">
                    {/* Template List */}
                    <div className="lg:col-span-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                        {templates.map(t => (
                            <div 
                                key={t.id} 
                                onClick={() => setSelectedTemplateId(t.id)}
                                className={`p-4 rounded border cursor-pointer transition-colors ${selectedTemplateId === t.id ? 'bg-gold/10 border-gold' : 'bg-charcoal border-charcoal-lighter hover:border-gray-500'}`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    {t.type === 'email' ? <Mail className="w-4 h-4 text-gray-400" /> : <Smartphone className="w-4 h-4 text-gray-400" />}
                                    <span className="text-sm font-medium text-white truncate">{t.name}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-gray-500">
                                    <span>{t.event}</span>
                                    <span className={t.isActive ? 'text-green-400' : 'text-gray-600'}>
                                        {t.isActive ? 'Active' : 'Disabled'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Editor Area */}
                    <div className="lg:col-span-3 min-h-0">
                        {selectedTemplate ? (
                            <NotificationTemplateEditor 
                                template={selectedTemplate} 
                                onSave={handleSaveTemplate}
                            />
                        ) : (
                            <Card className="h-full flex items-center justify-center text-gray-500">
                                Select a template to edit.
                            </Card>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'broadcasts' && (
                <div className="h-[calc(100vh-250px)]">
                    <BroadcastManager />
                </div>
            )}
        </AdminLayout>
    );
};