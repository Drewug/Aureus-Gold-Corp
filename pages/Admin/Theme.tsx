import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { PageHeader, Button } from '../../components/ui';
import { ThemeEditor } from '../../components/ThemeEditor';
import { ThemeSettings } from '../../types';
import { getTheme, saveTheme, applyTheme, DEFAULT_THEME } from '../../lib/theme';
import { Download, Save } from 'lucide-react';

export const Theme = () => {
    const [theme, setTheme] = useState<ThemeSettings>(DEFAULT_THEME);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        const stored = getTheme();
        setTheme(stored);
        applyTheme(stored); // Ensure consistent state on load
    }, []);

    const handleChange = (newTheme: ThemeSettings) => {
        setTheme(newTheme);
        applyTheme(newTheme); // Live preview
        setHasChanges(true);
    };

    const handleSave = () => {
        saveTheme(theme);
        setHasChanges(false);
        alert('Theme settings saved and applied.');
    };

    const handleReset = () => {
        if(confirm("Reset all theme settings to default?")) {
            handleChange(DEFAULT_THEME);
        }
    };

    const handleExport = () => {
        const blob = new Blob([JSON.stringify(theme, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'aureus_theme.json';
        a.click();
    };

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                 <PageHeader title="Theme Editor" subtitle="Customize the global look and feel." />
                 <div className="flex gap-2">
                     <Button variant="secondary" onClick={handleExport}>
                        <Download className="w-4 h-4 mr-2" /> Export
                    </Button>
                    <Button onClick={handleSave} disabled={!hasChanges}>
                        <Save className="w-4 h-4 mr-2" /> Save Theme
                    </Button>
                 </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <ThemeEditor 
                        theme={theme} 
                        onChange={handleChange} 
                        onReset={handleReset}
                    />
                </div>
                <div className="space-y-6">
                     <div className="bg-charcoal-lighter p-4 rounded border border-charcoal-light sticky top-8">
                        <h4 className="text-white font-medium mb-2">Live Preview Note</h4>
                        <p className="text-sm text-gray-400">
                            Changes are applied immediately to the entire application to help you visualize the impact. 
                            However, they are only persisted to storage when you click "Save Theme".
                        </p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};
