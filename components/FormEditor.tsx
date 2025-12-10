import React, { useState, useEffect } from 'react';
import { FormDefinition, FormField } from '../types';
import { Button, Card, Input, Label } from './ui';
import { Plus, Trash2, GripVertical, Save, ArrowLeft } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface FormEditorProps {
    initialForm?: FormDefinition;
    onSave: (form: FormDefinition) => void;
    onCancel: () => void;
}

const DEFAULT_FIELD: FormField = {
    id: '',
    type: 'text',
    label: 'New Field',
    required: false,
    placeholder: ''
};

export const FormEditor: React.FC<FormEditorProps> = ({ initialForm, onSave, onCancel }) => {
    const [form, setForm] = useState<FormDefinition>(initialForm || {
        id: uuidv4(),
        title: 'New Form',
        fields: [],
        submitLabel: 'Submit',
        successMessage: 'Thank you for your submission.',
        createdAt: new Date().toISOString()
    });

    const addField = () => {
        setForm(prev => ({
            ...prev,
            fields: [...prev.fields, { ...DEFAULT_FIELD, id: `f_${uuidv4().slice(0,8)}` }]
        }));
    };

    const updateField = (index: number, updates: Partial<FormField>) => {
        setForm(prev => {
            const newFields = [...prev.fields];
            newFields[index] = { ...newFields[index], ...updates };
            return { ...prev, fields: newFields };
        });
    };

    const removeField = (index: number) => {
        setForm(prev => ({
            ...prev,
            fields: prev.fields.filter((_, i) => i !== index)
        }));
    };

    const moveField = (index: number, direction: 'up' | 'down') => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === form.fields.length - 1)) return;
        setForm(prev => {
            const newFields = [...prev.fields];
            const swapIdx = direction === 'up' ? index - 1 : index + 1;
            [newFields[index], newFields[swapIdx]] = [newFields[swapIdx], newFields[index]];
            return { ...prev, fields: newFields };
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: General Settings */}
            <div className="space-y-6">
                <Card>
                    <h3 className="text-white font-medium mb-4">Form Settings</h3>
                    <div className="space-y-4">
                        <div>
                            <Label>Form Title</Label>
                            <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                        </div>
                        <div>
                            <Label>Submit Button Text</Label>
                            <Input value={form.submitLabel} onChange={e => setForm({...form, submitLabel: e.target.value})} />
                        </div>
                        <div>
                            <Label>Success Message</Label>
                            <textarea 
                                className="w-full h-24 bg-charcoal-lighter border border-charcoal-light rounded p-2 text-sm text-gray-200 focus:border-gold outline-none"
                                value={form.successMessage}
                                onChange={e => setForm({...form, successMessage: e.target.value})}
                            />
                        </div>
                    </div>
                </Card>
                
                <div className="flex flex-col gap-3">
                    <Button onClick={() => onSave(form)}>
                        <Save className="w-4 h-4 mr-2" /> Save Form
                    </Button>
                    <Button variant="secondary" onClick={onCancel}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Cancel
                    </Button>
                </div>
            </div>

            {/* Right: Field Builder */}
            <div className="lg:col-span-2">
                <Card className="min-h-[500px] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-white font-medium">Form Fields</h3>
                        <Button size="sm" variant="secondary" onClick={addField}>
                            <Plus className="w-4 h-4 mr-2" /> Add Field
                        </Button>
                    </div>

                    <div className="space-y-4 flex-1">
                        {form.fields.length === 0 ? (
                            <div className="text-center text-gray-500 py-12 border-2 border-dashed border-charcoal-lighter rounded">
                                No fields added yet. Click "Add Field" to begin.
                            </div>
                        ) : (
                            form.fields.map((field, idx) => (
                                <div key={field.id} className="bg-charcoal border border-charcoal-lighter rounded p-4 flex gap-4 items-start group">
                                    <div className="flex flex-col gap-1 pt-2 text-gray-600">
                                        <button onClick={() => moveField(idx, 'up')} className="hover:text-gold"><GripVertical className="w-4 h-4" /></button>
                                    </div>
                                    
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Label</Label>
                                            <Input value={field.label} onChange={e => updateField(idx, { label: e.target.value })} />
                                        </div>
                                        <div>
                                            <Label>Type</Label>
                                            <select 
                                                className="w-full h-10 rounded-md border border-charcoal-lighter bg-charcoal-light px-3 text-sm text-gray-100 focus:ring-2 focus:ring-gold outline-none"
                                                value={field.type}
                                                onChange={e => updateField(idx, { type: e.target.value as any })}
                                            >
                                                <option value="text">Text Input</option>
                                                <option value="email">Email</option>
                                                <option value="textarea">Text Area</option>
                                                <option value="select">Dropdown Select</option>
                                            </select>
                                        </div>
                                        
                                        <div className="md:col-span-2 flex gap-4 items-center">
                                            <div className="flex-1">
                                                <Label>Placeholder</Label>
                                                <Input value={field.placeholder} onChange={e => updateField(idx, { placeholder: e.target.value })} />
                                            </div>
                                            <div className="flex items-center gap-2 pt-6">
                                                <input 
                                                    type="checkbox" 
                                                    className="accent-gold w-4 h-4"
                                                    checked={field.required}
                                                    onChange={e => updateField(idx, { required: e.target.checked })}
                                                />
                                                <span className="text-sm text-gray-300">Required</span>
                                            </div>
                                        </div>

                                        {field.type === 'select' && (
                                            <div className="md:col-span-2">
                                                <Label>Options (comma separated)</Label>
                                                <Input 
                                                    value={Array.isArray(field.options) ? field.options.join(', ') : ''} 
                                                    onChange={e => updateField(idx, { options: e.target.value.split(',').map(s => s.trim()) })}
                                                    placeholder="Option 1, Option 2, Option 3"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <button onClick={() => removeField(idx)} className="text-gray-500 hover:text-red-500 p-2">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};