import React, { useState, useEffect } from 'react';
import { NotificationTemplate } from '../types';
import { Button, Card, Input, Label, Badge } from './ui';
import { Save, RefreshCw, Smartphone, Mail, AlertTriangle } from 'lucide-react';

interface EditorProps {
    template: NotificationTemplate;
    onSave: (template: NotificationTemplate) => void;
}

export const NotificationTemplateEditor: React.FC<EditorProps> = ({ template, onSave }) => {
    const [edited, setEdited] = useState<NotificationTemplate>(template);
    const [previewHtml, setPreviewHtml] = useState('');

    useEffect(() => {
        setEdited(template);
    }, [template]);

    // Simple variable replacement simulation for preview
    useEffect(() => {
        let text = edited.body;
        
        // Mock values for preview
        const MOCKS: Record<string, string> = {
            '{{customerName}}': 'John Doe',
            '{{orderId}}': 'ORD-123456',
            '{{totalAmount}}': '$2,450.00',
            '{{trackingNumber}}': '1Z999AA10123456784'
        };

        edited.variables.forEach(v => {
            const regex = new RegExp(v, 'g');
            text = text.replace(regex, MOCKS[v] || v);
        });

        // For email, wrap in simple html structure if not present
        setPreviewHtml(text);
    }, [edited]);

    const handleChange = (field: keyof NotificationTemplate, value: any) => {
        setEdited({ ...edited, [field]: value });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Editor Side */}
            <div className="flex flex-col gap-4 h-full">
                <Card className="flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                             {edited.type === 'email' ? <Mail className="w-5 h-5 text-gold" /> : <Smartphone className="w-5 h-5 text-gold" />}
                             <h3 className="font-serif text-white text-lg">{edited.name}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                             <Label className="mb-0 text-xs mr-1">Active</Label>
                             <input 
                                type="checkbox" 
                                className="accent-gold w-4 h-4"
                                checked={edited.isActive}
                                onChange={e => handleChange('isActive', e.target.checked)}
                             />
                        </div>
                    </div>

                    <div className="space-y-4 flex-1 flex flex-col">
                        {edited.type === 'email' && (
                            <div>
                                <Label>Subject Line</Label>
                                <Input 
                                    value={edited.subject} 
                                    onChange={e => handleChange('subject', e.target.value)} 
                                    className="font-medium"
                                />
                            </div>
                        )}

                        <div className="flex-1 flex flex-col">
                            <div className="flex justify-between items-end mb-1">
                                <Label>Message Body</Label>
                                {edited.type === 'sms' && (
                                    <span className={`text-xs ${edited.body.length > 160 ? 'text-red-400' : 'text-gray-500'}`}>
                                        {edited.body.length} / 160 chars
                                    </span>
                                )}
                            </div>
                            <textarea 
                                className="flex-1 bg-charcoal-lighter border border-charcoal-light rounded p-4 font-mono text-sm text-gray-200 focus:border-gold outline-none resize-none"
                                value={edited.body}
                                onChange={e => handleChange('body', e.target.value)}
                            />
                        </div>

                        <div>
                            <Label>Available Variables</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {edited.variables.map(v => (
                                    <span key={v} onClick={() => handleChange('body', edited.body + v)} className="cursor-pointer">
                                        <Badge className="hover:bg-gold/20">
                                            {v}
                                        </Badge>
                                    </span>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Click a variable to insert it at the end.</p>
                        </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-charcoal-lighter flex justify-end">
                        <Button onClick={() => onSave(edited)}>
                            <Save className="w-4 h-4 mr-2" /> Save Template
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Preview Side */}
            <div className="flex flex-col h-full">
                <Card className="flex-1 flex flex-col bg-charcoal-light/50 border-dashed border-2 border-charcoal-lighter">
                    <h3 className="text-gray-400 font-medium mb-4 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" /> Live Preview
                    </h3>
                    
                    <div className="flex-1 bg-white rounded-lg overflow-hidden text-black shadow-inner flex flex-col">
                        {/* Mock Email Header */}
                        {edited.type === 'email' && (
                            <div className="bg-gray-100 border-b p-3 text-sm">
                                <div className="text-gray-500">To: <span className="text-black">John Doe &lt;john@example.com&gt;</span></div>
                                <div className="text-gray-500 truncate">Subject: <span className="text-black font-medium">{edited.subject?.replace('{{orderId}}', 'ORD-123456')}</span></div>
                            </div>
                        )}
                        
                        {/* Mock SMS Header */}
                        {edited.type === 'sms' && (
                            <div className="bg-gray-100 border-b p-3 text-sm flex justify-center">
                                <span className="font-bold text-gray-700">Messages</span>
                            </div>
                        )}

                        <div className={`p-6 overflow-y-auto ${edited.type === 'sms' ? 'flex items-center justify-center bg-gray-200 flex-1' : ''}`}>
                             {edited.type === 'sms' ? (
                                 <div className="bg-blue-500 text-white p-3 rounded-2xl rounded-br-none max-w-[80%] shadow-sm">
                                     {previewHtml}
                                 </div>
                             ) : (
                                 <div 
                                    className="prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                                 />
                             )}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};