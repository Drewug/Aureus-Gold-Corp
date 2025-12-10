import React from 'react';
import { ThemeSettings } from '../types';
import { Card, Label, Input, Button } from './ui';
import { RotateCcw } from 'lucide-react';

interface ThemeEditorProps {
    theme: ThemeSettings;
    onChange: (theme: ThemeSettings) => void;
    onReset: () => void;
}

export const ThemeEditor: React.FC<ThemeEditorProps> = ({ theme, onChange, onReset }) => {
    
    const updateColor = (key: keyof ThemeSettings['colors'], value: string) => {
        onChange({ ...theme, colors: { ...theme.colors, [key]: value } });
    };

    const updateFont = (key: keyof ThemeSettings['fonts'], value: string) => {
        onChange({ ...theme, fonts: { ...theme.fonts, [key]: value } });
    };

    const updateLayout = (key: keyof ThemeSettings['layout'], value: any) => {
        onChange({ ...theme, layout: { ...theme.layout, [key]: value } });
    };

    return (
        <div className="space-y-8">
            <Card>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-serif text-white">Colors</h3>
                    <Button variant="outline" size="sm" onClick={onReset} title="Reset to Defaults">
                        <RotateCcw className="w-4 h-4" />
                    </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label>Primary Background</Label>
                        <div className="flex items-center gap-2 mt-2">
                            <Input type="color" className="w-12 h-10 p-1" value={theme.colors.background} onChange={e => updateColor('background', e.target.value)} />
                            <Input type="text" value={theme.colors.background} onChange={e => updateColor('background', e.target.value)} className="uppercase font-mono" />
                        </div>
                    </div>
                    <div>
                         <Label>Primary Accent (Gold)</Label>
                        <div className="flex items-center gap-2 mt-2">
                            <Input type="color" className="w-12 h-10 p-1" value={theme.colors.primary} onChange={e => updateColor('primary', e.target.value)} />
                            <Input type="text" value={theme.colors.primary} onChange={e => updateColor('primary', e.target.value)} className="uppercase font-mono" />
                        </div>
                    </div>
                     <div>
                        <Label>Secondary Background</Label>
                        <div className="flex items-center gap-2 mt-2">
                            <Input type="color" className="w-12 h-10 p-1" value={theme.colors.backgroundLight} onChange={e => updateColor('backgroundLight', e.target.value)} />
                            <Input type="text" value={theme.colors.backgroundLight} onChange={e => updateColor('backgroundLight', e.target.value)} className="uppercase font-mono" />
                        </div>
                    </div>
                     <div>
                         <Label>Accent Light</Label>
                        <div className="flex items-center gap-2 mt-2">
                            <Input type="color" className="w-12 h-10 p-1" value={theme.colors.primaryLight} onChange={e => updateColor('primaryLight', e.target.value)} />
                            <Input type="text" value={theme.colors.primaryLight} onChange={e => updateColor('primaryLight', e.target.value)} className="uppercase font-mono" />
                        </div>
                    </div>
                    <div>
                         <Label>Accent Dim</Label>
                        <div className="flex items-center gap-2 mt-2">
                            <Input type="color" className="w-12 h-10 p-1" value={theme.colors.primaryDim} onChange={e => updateColor('primaryDim', e.target.value)} />
                            <Input type="text" value={theme.colors.primaryDim} onChange={e => updateColor('primaryDim', e.target.value)} className="uppercase font-mono" />
                        </div>
                    </div>
                    <div>
                         <Label>Text Color</Label>
                        <div className="flex items-center gap-2 mt-2">
                            <Input type="color" className="w-12 h-10 p-1" value={theme.colors.text} onChange={e => updateColor('text', e.target.value)} />
                            <Input type="text" value={theme.colors.text} onChange={e => updateColor('text', e.target.value)} className="uppercase font-mono" />
                        </div>
                    </div>
                </div>
            </Card>

            <Card>
                <h3 className="text-xl font-serif text-white mb-6">Typography</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label>Heading Font</Label>
                        <select 
                            className="w-full h-10 rounded-md border border-charcoal-lighter bg-charcoal-light px-3 py-2 text-sm text-gray-100 mt-2 focus:ring-2 focus:ring-gold outline-none"
                            value={theme.fonts.heading}
                            onChange={e => updateFont('heading', e.target.value)}
                        >
                            <option value='"Bree Serif", serif'>Bree Serif</option>
                            <option value='"Playfair Display", serif'>Playfair Display</option>
                            <option value='Georgia, serif'>Georgia</option>
                            <option value='"Inter", sans-serif'>Inter</option>
                        </select>
                    </div>
                    <div>
                        <Label>Body Font</Label>
                        <select 
                             className="w-full h-10 rounded-md border border-charcoal-lighter bg-charcoal-light px-3 py-2 text-sm text-gray-100 mt-2 focus:ring-2 focus:ring-gold outline-none"
                            value={theme.fonts.body}
                            onChange={e => updateFont('body', e.target.value)}
                        >
                            <option value='"Inter", sans-serif'>Inter</option>
                            <option value='"Lato", sans-serif'>Lato</option>
                            <option value='Arial, sans-serif'>Arial</option>
                        </select>
                    </div>
                </div>
            </Card>

            <Card>
                <h3 className="text-xl font-serif text-white mb-6">Layout & Shape</h3>
                <div className="space-y-6">
                    <div>
                        <Label>Container Width</Label>
                        <div className="flex gap-4 mt-2">
                             <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="layoutMode" 
                                    checked={theme.layout.mode === 'boxed'} 
                                    onChange={() => updateLayout('mode', 'boxed')}
                                    className="text-gold focus:ring-gold"
                                />
                                <span className="text-gray-300">Boxed (Max 1280px)</span>
                             </label>
                             <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="layoutMode" 
                                    checked={theme.layout.mode === 'full'} 
                                    onChange={() => updateLayout('mode', 'full')}
                                    className="text-gold focus:ring-gold"
                                />
                                <span className="text-gray-300">Full Width</span>
                             </label>
                        </div>
                    </div>
                    <div>
                        <Label>Corner Radius ({theme.layout.radius}px)</Label>
                        <div className="flex items-center gap-4 mt-2">
                            <input 
                                type="range" 
                                min="0" 
                                max="20" 
                                step="1" 
                                value={theme.layout.radius}
                                onChange={e => updateLayout('radius', parseInt(e.target.value))}
                                className="w-full accent-gold h-2 bg-charcoal-lighter rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};