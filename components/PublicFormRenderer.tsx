import React, { useState, useEffect } from 'react';
import { FormDefinition } from '../types';
import { api } from '../lib/api';
import { Button, Input, Label, Card } from './ui';
import { CheckCircle, Upload, Calendar } from 'lucide-react';
import { getCookie, setCookie } from '../lib/utils';
import { v4 as uuidv4 } from 'uuid';

interface PublicFormRendererProps {
    form: FormDefinition;
    className?: string;
}

export const PublicFormRenderer: React.FC<PublicFormRendererProps> = ({ form, className }) => {
    const [values, setValues] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [trackerId, setTrackerId] = useState<string>('');

    // Initialize Lead Tracker Cookie
    useEffect(() => {
        let tid = getCookie('lead_tracker');
        if (!tid) {
            tid = uuidv4();
            setCookie('lead_tracker', tid, 365);
        }
        setTrackerId(tid);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Anti-spam / Duplicate Check (5 minute cooldown per form)
        const historyKey = `aureus_form_last_sub_${form.id}`;
        const lastSub = localStorage.getItem(historyKey);
        const now = Date.now();
        const COOLDOWN = 5 * 60 * 1000; 

        if (lastSub && (now - parseInt(lastSub)) < COOLDOWN) {
            alert("You have already submitted this form recently. Please wait a few minutes before sending another request.");
            return;
        }

        setSubmitting(true);
        try {
            await api.leads.submit(form.id, values, trackerId);
            localStorage.setItem(historyKey, now.toString());
            setSuccess(true);
            setValues({});
        } catch (err) {
            alert('Failed to submit form. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (id: string, value: string) => {
        setValues(prev => ({ ...prev, [id]: value }));
    };

    const handleFileChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Simulate upload by storing filename. In real app, upload to storage and get URL.
            setValues(prev => ({ ...prev, [id]: `[File: ${file.name}]` }));
        }
    };

    if (success) {
        return (
            <Card className={`text-center py-12 border-green-900/50 bg-green-900/10 ${className}`}>
                <div className="flex flex-col items-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                    <h3 className="text-xl font-serif text-white mb-2">Received</h3>
                    <p className="text-gray-300">{form.successMessage}</p>
                    <Button variant="outline" className="mt-6" onClick={() => setSuccess(false)}>
                        Send Another
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
            <div className="mb-6">
                <h3 className="text-xl font-serif text-white">{form.title}</h3>
                {trackerId && <div className="text-[10px] text-gray-600 mt-1 font-mono">Ref: {trackerId.slice(0, 8)}</div>}
            </div>
            
            {form.fields.map(field => (
                <div key={field.id} className="space-y-2">
                    <Label className={field.required ? 'after:content-["*"] after:ml-0.5 after:text-red-400' : ''}>
                        {field.label}
                    </Label>
                    
                    {field.type === 'textarea' ? (
                        <textarea 
                            required={field.required}
                            placeholder={field.placeholder}
                            className="w-full h-32 bg-charcoal-lighter border border-charcoal-light rounded p-3 text-sm text-gray-200 focus:border-gold outline-none resize-none"
                            value={values[field.id] || ''}
                            onChange={e => handleChange(field.id, e.target.value)}
                        />
                    ) : field.type === 'select' ? (
                        <select
                            required={field.required}
                            className="w-full h-10 rounded-md border border-charcoal-lighter bg-charcoal-light px-3 text-sm text-gray-100 focus:ring-2 focus:ring-gold outline-none"
                            value={values[field.id] || ''}
                            onChange={e => handleChange(field.id, e.target.value)}
                        >
                            <option value="">Select an option...</option>
                            {field.options?.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    ) : field.type === 'radio' ? (
                        <div className="space-y-2">
                            {field.options?.map(opt => (
                                <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${values[field.id] === opt ? 'border-gold' : 'border-gray-600 group-hover:border-gray-400'}`}>
                                        {values[field.id] === opt && <div className="w-2 h-2 rounded-full bg-gold"></div>}
                                    </div>
                                    <input 
                                        type="radio"
                                        name={field.id}
                                        required={field.required}
                                        value={opt}
                                        className="hidden"
                                        checked={values[field.id] === opt}
                                        onChange={e => handleChange(field.id, e.target.value)}
                                    />
                                    <span className="text-sm text-gray-300">{opt}</span>
                                </label>
                            ))}
                        </div>
                    ) : field.type === 'checkbox' ? (
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${values[field.id] === 'true' ? 'bg-gold border-gold' : 'border-gray-600 group-hover:border-gray-400'}`}>
                                {values[field.id] === 'true' && <CheckCircle className="w-3 h-3 text-charcoal" />}
                            </div>
                            <input 
                                type="checkbox"
                                required={field.required}
                                className="hidden"
                                checked={values[field.id] === 'true'}
                                onChange={e => handleChange(field.id, e.target.checked ? 'true' : 'false')}
                            />
                            <span className="text-sm text-gray-300">{field.placeholder || 'Yes'}</span>
                        </label>
                    ) : field.type === 'file' ? (
                        <div className="relative group">
                            <input 
                                type="file"
                                required={field.required}
                                id={field.id}
                                className="hidden"
                                onChange={e => handleFileChange(field.id, e)}
                            />
                            <label htmlFor={field.id} className="flex items-center justify-center w-full p-4 border-2 border-dashed border-charcoal-lighter rounded-lg cursor-pointer hover:border-gold transition-colors gap-2 text-gray-400 hover:text-white bg-charcoal-light">
                                <Upload className="w-5 h-5" />
                                <span className="text-sm truncate max-w-[200px]">
                                    {values[field.id] ? values[field.id].replace('[File: ', '').replace(']', '') : (field.placeholder || 'Click to Upload')}
                                </span>
                            </label>
                        </div>
                    ) : (
                        <div className="relative">
                            <Input 
                                type={field.type}
                                required={field.required}
                                placeholder={field.placeholder}
                                value={values[field.id] || ''}
                                onChange={e => handleChange(field.id, e.target.value)}
                                className={field.type === 'date' ? 'pl-3' : ''}
                            />
                            {field.type === 'date' && !values[field.id] && (
                                <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-gray-500 pointer-events-none" />
                            )}
                        </div>
                    )}
                </div>
            ))}

            <Button type="submit" className="w-full" isLoading={submitting}>
                {form.submitLabel}
            </Button>
        </form>
    );
};