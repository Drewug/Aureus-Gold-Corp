import React, { useState } from 'react';
import { SeoSettings } from '../types';
import { Button, Input, Label, Card } from './ui';
import { Save, X, Globe, ImageIcon } from 'lucide-react';
import { MediaLibrary } from './MediaLibrary';

interface SeoEditorProps {
    initialSettings?: SeoSettings;
    onSave: (settings: SeoSettings) => void;
    onCancel: () => void;
    titleOverride?: string; // Fallback default title
    descOverride?: string; // Fallback default description
}

export const SeoEditor: React.FC<SeoEditorProps> = ({ initialSettings, onSave, onCancel, titleOverride, descOverride }) => {
    const [settings, setSettings] = useState<SeoSettings>(initialSettings || {});
    const [showMedia, setShowMedia] = useState(false);

    const handleSave = () => {
        onSave(settings);
    };

    const selectImage = (url: string) => {
        setSettings({ ...settings, ogImage: url });
        setShowMedia(false);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-charcoal w-full max-w-2xl rounded-lg border border-charcoal-lighter shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-charcoal-lighter flex justify-between items-center bg-charcoal-light rounded-t-lg">
                    <h3 className="text-white font-serif text-xl flex items-center gap-2">
                        <Globe className="w-5 h-5 text-gold" /> SEO & Metadata
                    </h3>
                    <button onClick={onCancel} className="text-gray-500 hover:text-white"><X/></button>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-6">
                    <div className="bg-blue-900/10 border border-blue-900/30 p-4 rounded text-sm text-blue-200 mb-4">
                        <p>Configure how this page appears in search engines (Google) and social media (Facebook, Twitter, LinkedIn).</p>
                    </div>

                    <div>
                        <Label>Meta Title</Label>
                        <Input 
                            value={settings.metaTitle || ''} 
                            onChange={e => setSettings({...settings, metaTitle: e.target.value})}
                            placeholder={titleOverride || "Page Title"} 
                        />
                        <div className="text-xs text-gray-500 mt-1 flex justify-between">
                            <span>Recommended: 50-60 characters</span>
                            <span className={(settings.metaTitle?.length || 0) > 60 ? 'text-red-400' : 'text-green-400'}>
                                {settings.metaTitle?.length || 0} chars
                            </span>
                        </div>
                    </div>

                    <div>
                        <Label>Meta Description</Label>
                        <textarea 
                            className="w-full h-24 bg-charcoal-lighter border border-charcoal-light rounded p-2 text-sm text-gray-300 focus:border-gold outline-none"
                            value={settings.metaDescription || ''}
                            onChange={e => setSettings({...settings, metaDescription: e.target.value})}
                            placeholder={descOverride || "Summary of the content..."}
                        />
                         <div className="text-xs text-gray-500 mt-1 flex justify-between">
                            <span>Recommended: 150-160 characters</span>
                            <span className={(settings.metaDescription?.length || 0) > 160 ? 'text-red-400' : 'text-green-400'}>
                                {settings.metaDescription?.length || 0} chars
                            </span>
                        </div>
                    </div>

                    <div>
                        <Label>Social Share Image (OG:Image)</Label>
                        <div className="flex gap-4 items-start mt-2">
                            {settings.ogImage ? (
                                <div className="relative group w-32 aspect-video bg-black rounded border border-charcoal-lighter overflow-hidden">
                                    <img src={settings.ogImage} alt="OG Preview" className="w-full h-full object-cover" />
                                    <button 
                                        onClick={() => setSettings({...settings, ogImage: undefined})}
                                        className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <div 
                                    className="w-32 aspect-video bg-charcoal-lighter border border-dashed border-gray-600 rounded flex items-center justify-center text-gray-500 cursor-pointer hover:border-gold hover:text-gold transition-colors"
                                    onClick={() => setShowMedia(true)}
                                >
                                    <ImageIcon className="w-6 h-6" />
                                </div>
                            )}
                            <div className="flex-1">
                                <Input 
                                    value={settings.ogImage || ''} 
                                    onChange={e => setSettings({...settings, ogImage: e.target.value})}
                                    placeholder="https://..." 
                                />
                                <Button size="sm" variant="secondary" className="mt-2" onClick={() => setShowMedia(true)}>
                                    Select from Media Library
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Preview Card */}
                    <Card className="bg-white p-4 max-w-lg mx-auto border-gray-200">
                        <Label className="text-gray-500 mb-2">Google Search Preview</Label>
                        <div className="font-sans">
                            <div className="text-[#1a0dab] text-xl truncate hover:underline cursor-pointer">
                                {settings.metaTitle || titleOverride || "Page Title"} | Aureus Gold Corp
                            </div>
                            <div className="text-[#006621] text-sm">https://aureus.demo/product/example</div>
                            <div className="text-[#545454] text-sm leading-snug line-clamp-2">
                                {settings.metaDescription || descOverride || "No description provided."}
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="p-4 border-t border-charcoal-lighter bg-charcoal-light rounded-b-lg flex justify-end gap-3">
                    <Button variant="secondary" onClick={onCancel}>Cancel</Button>
                    <Button onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2" /> Save SEO Settings
                    </Button>
                </div>
            </div>

             {/* Media Modal */}
            {showMedia && (
                <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-8">
                     <div className="bg-charcoal-light w-full max-w-4xl h-[80vh] rounded-lg border border-charcoal-lighter flex flex-col shadow-2xl relative">
                        <div className="absolute top-4 right-4 z-10">
                            <Button size="sm" variant="secondary" onClick={() => setShowMedia(false)}><X className="w-4 h-4"/></Button>
                        </div>
                        <div className="flex-1 overflow-hidden p-4">
                            <MediaLibrary onSelect={selectImage} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
