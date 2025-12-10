import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { PageHeader, Button, Card } from '../../components/ui';
import { api } from '../../lib/api';
import { FormDefinition, LeadSubmission } from '../../types';
import { LeadsTable } from '../../components/LeadsTable';
import { FormEditor } from '../../components/FormEditor';
import { Inbox, FileText, Plus, Edit, Code, Copy, Trash2 } from 'lucide-react';

export const Leads = () => {
    const [activeTab, setActiveTab] = useState<'inbox' | 'forms'>('inbox');
    const [forms, setForms] = useState<FormDefinition[]>([]);
    const [leads, setLeads] = useState<LeadSubmission[]>([]);
    const [editingForm, setEditingForm] = useState<FormDefinition | undefined>(undefined);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [f, l] = await Promise.all([api.forms.list(), api.leads.list()]);
        setForms(f);
        setLeads(l);
    };

    const handleCreateForm = () => {
        setEditingForm(undefined);
        setIsEditing(true);
    };

    const handleEditForm = (form: FormDefinition) => {
        setEditingForm(form);
        setIsEditing(true);
    };

    const handleSaveForm = async (form: FormDefinition) => {
        await api.forms.update(form);
        setIsEditing(false);
        loadData();
    };

    const handleDeleteForm = async (id: string) => {
        if(confirm('Delete this form? Existing leads will remain but the form will disappear from the frontend.')) {
            await api.forms.delete(id);
            loadData();
        }
    };

    const copyEmbedCode = (id: string) => {
        const code = `<PublicFormRenderer form={forms.find(f => f.id === '${id}')} />`;
        navigator.clipboard.writeText(code);
        alert('React Component Snippet copied to clipboard!');
    };

    if (isEditing) {
        return (
            <AdminLayout>
                <PageHeader title={editingForm ? 'Edit Form' : 'Create Form'} subtitle="Design your data collection form." />
                <FormEditor 
                    initialForm={editingForm} 
                    onSave={handleSaveForm} 
                    onCancel={() => setIsEditing(false)} 
                />
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <PageHeader title="Forms & Leads" subtitle="Manage inquiries and lead generation forms." />

            <div className="mb-6 flex gap-1 border-b border-charcoal-lighter">
                <button
                    onClick={() => setActiveTab('inbox')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'inbox' ? 'border-gold text-gold' : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                    <Inbox className="w-4 h-4" /> Inbox ({leads.filter(l => l.status === 'new').length})
                </button>
                <button
                    onClick={() => setActiveTab('forms')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'forms' ? 'border-gold text-gold' : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                    <FileText className="w-4 h-4" /> Form Manager
                </button>
            </div>

            {activeTab === 'inbox' && (
                <LeadsTable leads={leads} onRefresh={loadData} />
            )}

            {activeTab === 'forms' && (
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <Button onClick={handleCreateForm}>
                            <Plus className="w-4 h-4 mr-2" /> Create New Form
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {forms.map(form => (
                            <Card key={form.id} className="hover:border-gold/30 transition-colors group flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-white font-medium text-lg">{form.title}</h3>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEditForm(form)} className="p-1 text-gray-400 hover:text-white">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDeleteForm(form.id)} className="p-1 text-gray-400 hover:text-red-500">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-500 mb-4 flex-1">
                                    {form.fields.length} Fields &bull; Button: "{form.submitLabel}"
                                </div>
                                
                                <div className="mt-4 pt-4 border-t border-charcoal-lighter flex justify-between items-center">
                                    <div className="text-xs font-mono text-gray-600 bg-charcoal-light px-2 py-1 rounded truncate max-w-[150px]">
                                        ID: {form.id}
                                    </div>
                                    <button 
                                        onClick={() => copyEmbedCode(form.id)}
                                        className="text-xs text-gold hover:text-white flex items-center gap-1"
                                        title="Copy JSX Snippet"
                                    >
                                        <Code className="w-3 h-3" /> Embed
                                    </button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};