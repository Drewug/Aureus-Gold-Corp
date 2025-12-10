import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { api } from '../../lib/api';
import { CMSContent, CMSSection, Product } from '../../types';
import { PageBuilder } from '../../components/PageSections';
import { Button, Card, Input, Label, PageHeader } from '../../components/ui';
import { Save, Undo, Eye, EyeOff, ArrowUp, ArrowDown, GripVertical, Download, Upload, Plus, Globe } from 'lucide-react';
import { SeoEditor } from '../../components/SeoEditor';

export const CMS = () => {
    const [cms, setCms] = useState<CMSContent | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [history, setHistory] = useState<CMSContent[]>([]);
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
    const [editMode, setEditMode] = useState<'global' | 'section'>('global');
    const [showImport, setShowImport] = useState(false);
    const [importJson, setImportJson] = useState('');
    const [showSeo, setShowSeo] = useState(false);

    useEffect(() => {
        const load = async () => {
            const [c, p] = await Promise.all([api.cms.get(), api.products.list()]);
            setCms(c);
            setProducts(p);
        };
        load();
    }, []);

    const updateCms = (newCms: CMSContent) => {
        if (!cms) return;
        setHistory(prev => [...prev.slice(-10), cms]); // Keep last 10 states
        setCms(newCms);
    };

    const handleSave = async () => {
        if (!cms) return;
        await api.cms.update(cms);
        alert('Changes published successfully.');
    };

    const handleUndo = () => {
        if (history.length === 0) return;
        const previous = history[history.length - 1];
        setHistory(prev => prev.slice(0, -1));
        setCms(previous);
    };

    const moveSection = (index: number, direction: 'up' | 'down') => {
        if (!cms) return;
        const newSections = [...cms.sections];
        if (direction === 'up' && index > 0) {
            [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
        } else if (direction === 'down' && index < newSections.length - 1) {
            [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
        }
        updateCms({ ...cms, sections: newSections });
    };

    const toggleVisibility = (id: string) => {
        if (!cms) return;
        const newSections = cms.sections.map(s => s.id === id ? { ...s, isVisible: !s.isVisible } : s);
        updateCms({ ...cms, sections: newSections });
    };

    const updateSectionContent = (id: string, newContent: any) => {
        if (!cms) return;
        const newSections = cms.sections.map(s => s.id === id ? { ...s, content: newContent } : s);
        updateCms({ ...cms, sections: newSections });
    };

    const handleImport = () => {
        try {
            const parsed = JSON.parse(importJson);
            if (!parsed.sections || !parsed.global) throw new Error('Invalid CMS format');
            updateCms(parsed);
            setShowImport(false);
            setImportJson('');
        } catch (e) {
            alert('Invalid JSON');
        }
    };

    if (!cms) return <AdminLayout><div>Loading...</div></AdminLayout>;

    const selectedSection = cms.sections.find(s => s.id === selectedSectionId);

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <PageHeader title="Content Manager" subtitle="Manage layout, content, and styles." />
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleUndo} disabled={history.length === 0} title="Undo last change">
                        <Undo className="w-4 h-4" />
                    </Button>
                    <Button variant="secondary" onClick={() => {
                        const blob = new Blob([JSON.stringify(cms, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'cms_backup.json';
                        a.click();
                    }}>
                        <Download className="w-4 h-4 mr-2" /> Export
                    </Button>
                    <Button variant="secondary" onClick={() => setShowImport(!showImport)}>
                        <Upload className="w-4 h-4 mr-2" /> Import
                    </Button>
                    <Button onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2" /> Publish Changes
                    </Button>
                </div>
            </div>

            {showImport && (
                <Card className="mb-6 border-gold/30">
                    <Label>Paste CMS JSON Configuration</Label>
                    <textarea 
                        className="w-full h-32 bg-charcoal-lighter border border-charcoal-light rounded p-2 text-xs font-mono text-gray-300 mt-2"
                        value={importJson}
                        onChange={e => setImportJson(e.target.value)}
                    />
                    <div className="mt-2 flex justify-end">
                        <Button onClick={handleImport}>Apply JSON</Button>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
                {/* Left: Controls */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                    <Card className="p-4 cursor-pointer hover:border-gold/50 transition-colors" onClick={() => setEditMode('global')}>
                         <h3 className="text-white font-medium">Global Settings</h3>
                         <p className="text-xs text-gray-500">Header, Footer, Meta</p>
                    </Card>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Page Sections</h3>
                        </div>
                        {cms.sections.map((section, idx) => (
                            <div 
                                key={section.id}
                                className={`p-3 rounded border flex items-center gap-2 group transition-all ${selectedSectionId === section.id && editMode === 'section' ? 'bg-gold/10 border-gold' : 'bg-charcoal-light border-charcoal-lighter hover:border-gray-600'}`}
                            >
                                <div className="text-gray-600 cursor-grab"><GripVertical className="w-4 h-4" /></div>
                                <div 
                                    className="flex-1 cursor-pointer"
                                    onClick={() => { setSelectedSectionId(section.id); setEditMode('section'); }}
                                >
                                    <div className="text-white text-sm font-medium">{section.title}</div>
                                    <div className="text-xs text-gray-500 uppercase">{section.type}</div>
                                </div>
                                <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100">
                                    <button onClick={() => toggleVisibility(section.id)} className="p-1 hover:text-white text-gray-500">
                                        {section.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-red-400" />}
                                    </button>
                                    <div className="flex flex-col">
                                        <button onClick={() => moveSection(idx, 'up')} className="hover:text-gold disabled:opacity-30" disabled={idx === 0}>
                                            <ArrowUp className="w-3 h-3" />
                                        </button>
                                        <button onClick={() => moveSection(idx, 'down')} className="hover:text-gold disabled:opacity-30" disabled={idx === cms.sections.length - 1}>
                                            <ArrowDown className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Middle: Editor */}
                <div className="col-span-4 overflow-y-auto px-2 custom-scrollbar">
                    <Card className="min-h-full">
                        {editMode === 'global' ? (
                            <div className="space-y-6">
                                <h3 className="text-xl font-serif text-white border-b border-charcoal-lighter pb-2">Global Settings</h3>
                                <div>
                                    <Label>Header Banner Message</Label>
                                    <Input 
                                        value={cms.global.bannerMessage} 
                                        onChange={e => updateCms({...cms, global: {...cms.global, bannerMessage: e.target.value}})} 
                                    />
                                </div>
                                <div>
                                    <Label>Footer About Text</Label>
                                    <textarea 
                                        className="w-full h-24 bg-charcoal-lighter border border-gray-700 rounded-md p-2 text-sm text-gray-300"
                                        value={cms.global.footerText}
                                        onChange={e => updateCms({...cms, global: {...cms.global, footerText: e.target.value}})}
                                    />
                                </div>
                                <div>
                                    <Label>Footer Links (JSON)</Label>
                                    <textarea 
                                        className="w-full h-24 bg-charcoal-lighter border border-gray-700 rounded-md p-2 text-xs font-mono text-gray-300"
                                        value={JSON.stringify(cms.global.footerLinks, null, 2)}
                                        onChange={e => {
                                            try {
                                                const links = JSON.parse(e.target.value);
                                                updateCms({...cms, global: {...cms.global, footerLinks: links}});
                                            } catch(err) {}
                                        }}
                                    />
                                </div>
                                <div className="pt-4 border-t border-charcoal-lighter">
                                    <Label className="mb-2 block">Global SEO</Label>
                                    <Button variant="secondary" className="w-full" onClick={() => setShowSeo(true)}>
                                        <Globe className="w-4 h-4 mr-2" /> Configure Site Meta
                                    </Button>
                                </div>
                            </div>
                        ) : selectedSection ? (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center border-b border-charcoal-lighter pb-2">
                                    <h3 className="text-xl font-serif text-white">{selectedSection.title}</h3>
                                    <span className="text-xs bg-charcoal-lighter px-2 py-1 rounded text-gray-400">{selectedSection.type}</span>
                                </div>

                                {selectedSection.type === 'hero' && (
                                    <>
                                        <div><Label>Title</Label><Input value={selectedSection.content.title} onChange={e => updateSectionContent(selectedSection.id, {...selectedSection.content, title: e.target.value})} /></div>
                                        <div><Label>Subtitle</Label><textarea className="w-full h-20 bg-charcoal-lighter border border-gray-700 rounded p-2 text-sm text-gray-300" value={selectedSection.content.subtitle} onChange={e => updateSectionContent(selectedSection.id, {...selectedSection.content, subtitle: e.target.value})} /></div>
                                        <div><Label>Image URL</Label><Input value={selectedSection.content.imageUrl} onChange={e => updateSectionContent(selectedSection.id, {...selectedSection.content, imageUrl: e.target.value})} /></div>
                                        <div><Label>Button Text</Label><Input value={selectedSection.content.buttonText} onChange={e => updateSectionContent(selectedSection.id, {...selectedSection.content, buttonText: e.target.value})} /></div>
                                    </>
                                )}

                                {selectedSection.type === 'intro' && (
                                    <>
                                        <div><Label>Heading</Label><Input value={selectedSection.content.heading} onChange={e => updateSectionContent(selectedSection.id, {...selectedSection.content, heading: e.target.value})} /></div>
                                        <div><Label>Text</Label><textarea className="w-full h-32 bg-charcoal-lighter border border-gray-700 rounded p-2 text-sm text-gray-300" value={selectedSection.content.text} onChange={e => updateSectionContent(selectedSection.id, {...selectedSection.content, text: e.target.value})} /></div>
                                    </>
                                )}

                                {selectedSection.type === 'trust' && (
                                    <div>
                                        <Label>Badges (Edit JSON directly)</Label>
                                        <textarea className="w-full h-64 bg-charcoal-lighter border border-gray-700 rounded p-2 text-xs font-mono text-gray-300" value={JSON.stringify(selectedSection.content.badges, null, 2)} onChange={e => {
                                            try { updateSectionContent(selectedSection.id, {...selectedSection.content, badges: JSON.parse(e.target.value)}); } catch(err) {}
                                        }} />
                                    </div>
                                )}

                                {selectedSection.type === 'catalog' && (
                                    <>
                                        <div><Label>Section Heading</Label><Input value={selectedSection.content.heading} onChange={e => updateSectionContent(selectedSection.id, {...selectedSection.content, heading: e.target.value})} /></div>
                                        <div><Label>Product Limit</Label><Input type="number" value={selectedSection.content.limit} onChange={e => updateSectionContent(selectedSection.id, {...selectedSection.content, limit: parseInt(e.target.value)})} /></div>
                                    </>
                                )}

                                {selectedSection.type === 'faq' && (
                                    <>
                                        <div><Label>Section Title</Label><Input value={selectedSection.content.title} onChange={e => updateSectionContent(selectedSection.id, {...selectedSection.content, title: e.target.value})} /></div>
                                        <div><Label>Questions (JSON)</Label><textarea className="w-full h-64 bg-charcoal-lighter border border-gray-700 rounded p-2 text-xs font-mono text-gray-300" value={JSON.stringify(selectedSection.content.items, null, 2)} onChange={e => {
                                            try { updateSectionContent(selectedSection.id, {...selectedSection.content, items: JSON.parse(e.target.value)}); } catch(err) {}
                                        }} /></div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-12">Select a section to edit</div>
                        )}
                    </Card>
                </div>

                {/* Right: Live Preview */}
                <div className="col-span-5 bg-black border border-charcoal-lighter rounded-lg overflow-hidden flex flex-col">
                    <div className="bg-charcoal-lighter p-2 text-xs text-center text-gray-400 border-b border-charcoal-light flex justify-between px-4">
                        <span>Live Preview</span>
                        <div className="flex gap-1">
                             <div className="w-2 h-2 rounded-full bg-red-500"></div>
                             <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                             <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto bg-charcoal relative transform-gpu scale-[0.8] origin-top h-[125%] w-[125%]">
                        {/* Mock wrapper to simulate Layout context for preview */}
                        <div className="min-h-screen text-gray-100 font-sans">
                            <div className="bg-charcoal-light border-b border-charcoal-lighter text-xs py-2 px-4 text-center text-gold-dim">
                                <span>{cms.global.bannerMessage}</span>
                            </div>
                            <PageBuilder content={cms} products={products} />
                            <div className="bg-charcoal-light p-8 text-center border-t border-charcoal-lighter">
                                <p className="text-sm text-gray-500">{cms.global.footerText}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showSeo && cms && (
                <SeoEditor 
                    initialSettings={cms.global.seo}
                    onSave={(settings) => {
                        updateCms({...cms, global: {...cms.global, seo: settings}});
                        setShowSeo(false);
                    }}
                    onCancel={() => setShowSeo(false)}
                    titleOverride="Aureus Gold Corp"
                    descOverride={cms.global.bannerMessage}
                />
            )}
        </AdminLayout>
    );
};
