import React, { useState } from 'react';
import { FormDefinition, FormField, FormFieldType } from '../types';
import { Button, Card, Input, Label } from './ui';
import { Plus, Trash2, GripVertical, Save, ArrowLeft, Type, Hash, Calendar, Upload, List, CheckSquare, Mail, AlignLeft, Circle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface FormBuilderProps {
    initialForm?: FormDefinition;
    onSave: (form: FormDefinition) => void;
    onCancel: () => void;
}

const FIELD_TYPES: { type: FormFieldType; label: string; icon: any }[] = [
    { type: 'text', label: 'Text', icon: Type },
    { type: 'email', label: 'Email', icon: Mail },
    { type: 'number', label: 'Number', icon: Hash },
    { type: 'textarea', label: 'Long Text', icon: AlignLeft },
    { type: 'select', label: 'Select', icon: List },
    { type: 'radio', label: 'Radio', icon: Circle },
    { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
    { type: 'date', label: 'Date', icon: Calendar },
    { type: 'file', label: 'File Upload', icon: Upload },
];

export const FormBuilder: React.FC<FormBuilderProps> = ({ initialForm, onSave, onCancel }) => {
    const [form, setForm] = useState<FormDefinition>(initialForm || {
        id: uuidv4(),
        title: 'New Form',
        fields: [],
        submitLabel: 'Submit',
        successMessage: 'Thank you for your submission.',
        createdAt: new Date().toISOString()
    });
    
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const addField = (type: FormFieldType) => {
        const newField: FormField = {
            id: `f_${uuidv4().slice(0,8)}`,
            type,
            label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
            required: false,
            placeholder: '',
            options: (type === 'select' || type === 'radio') ? ['Option 1', 'Option 2'] : undefined
        };
        setForm(prev => ({ ...prev, fields: [...prev.fields, newField] }));
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

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
        // Ghost image handling can be default
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
        
        const newFields = [...form.fields];
        const draggedItem = newFields[draggedIndex];
        newFields.splice(draggedIndex, 1);
        newFields.splice(index, 0, draggedItem);
        
        setForm(prev => ({ ...prev, fields: newFields }));
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-150px)]">
            {/* Left Sidebar: Components */}
            <div className="lg:col-span-1 flex flex-col gap-6">
                <Card>
                    <h3 className="text-white font-medium mb-4">Form Components</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {FIELD_TYPES.map((ft) => (
                            <button
                                key={ft.type}
                                onClick={() => addField(ft.type)}
                                className="flex flex-col items-center justify-center p-3 bg-charcoal border border-charcoal-lighter rounded hover:border-gold hover:text-gold transition-colors text-gray-400 gap-2"
                            >
                                <ft.icon className="w-5 h-5" />
                                <span className="text-xs font-medium">{ft.label}</span>
                            </button>
                        ))}
                    </div>
                </Card>

                <Card>
                    <h3 className="text-white font-medium mb-4">Settings</h3>
                    <div className="space-y-4">
                        <div>
                            <Label>Form Title</Label>
                            <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                        </div>
                        <div>
                            <Label>Submit Button</Label>
                            <Input value={form.submitLabel} onChange={e => setForm({...form, submitLabel: e.target.value})} />
                        </div>
                        <div>
                            <Label>Success Message</Label>
                            <textarea 
                                className="w-full h-20 bg-charcoal-lighter border border-charcoal-light rounded p-2 text-sm text-gray-200 focus:border-gold outline-none"
                                value={form.successMessage}
                                onChange={e => setForm({...form, successMessage: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex flex-col gap-3">
                        <Button onClick={() => onSave(form)}>
                            <Save className="w-4 h-4 mr-2" /> Save Form
                        </Button>
                        <Button variant="secondary" onClick={onCancel}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Cancel
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Right Canvas: Builder */}
            <div className="lg:col-span-3 h-full overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto bg-charcoal-light border border-charcoal-lighter rounded-lg p-8 shadow-inner custom-scrollbar">
                    {form.fields.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-charcoal-lighter rounded-lg">
                            <Plus className="w-12 h-12 mb-4 opacity-20" />
                            <p>Click components on the left to add them to your form.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 max-w-2xl mx-auto">
                            <div className="text-center mb-8 border-b border-charcoal-lighter pb-4">
                                <h1 className="text-3xl font-serif text-white">{form.title}</h1>
                            </div>
                            
                            {form.fields.map((field, idx) => (
                                <div 
                                    key={field.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, idx)}
                                    onDragOver={(e) => handleDragOver(e, idx)}
                                    onDragEnd={handleDragEnd}
                                    className={`relative group bg-charcoal border border-charcoal-lighter rounded p-6 transition-all ${draggedIndex === idx ? 'opacity-50 border-gold border-dashed' : 'hover:border-gray-500'}`}
                                >
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-600 cursor-move hover:text-gold">
                                        <GripVertical className="w-5 h-5" />
                                    </div>
                                    <div className="absolute right-2 top-2">
                                        <button onClick={() => removeField(idx)} className="text-gray-500 hover:text-red-500 p-1">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="pl-8 pr-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div className="md:col-span-2">
                                                <Label>Field Label</Label>
                                                <Input value={field.label} onChange={e => updateField(idx, { label: e.target.value })} />
                                            </div>
                                            
                                            {field.type !== 'checkbox' && field.type !== 'file' && field.type !== 'date' && (
                                                <div className="md:col-span-2">
                                                    <Label>Placeholder</Label>
                                                    <Input value={field.placeholder} onChange={e => updateField(idx, { placeholder: e.target.value })} />
                                                </div>
                                            )}

                                            {(field.type === 'select' || field.type === 'radio') && (
                                                <div className="md:col-span-2">
                                                    <Label>Options (Comma separated)</Label>
                                                    <Input 
                                                        value={Array.isArray(field.options) ? field.options.join(', ') : ''} 
                                                        onChange={e => updateField(idx, { options: e.target.value.split(',').map(s => s.trim()) })}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="checkbox" 
                                                id={`req-${field.id}`}
                                                className="accent-gold w-4 h-4"
                                                checked={field.required}
                                                onChange={e => updateField(idx, { required: e.target.checked })}
                                            />
                                            <label htmlFor={`req-${field.id}`} className="text-sm text-gray-300">Required Field</label>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="pt-6">
                                <Button className="w-full pointer-events-none opacity-50">
                                    {form.submitLabel}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};