import { localDb } from './localDb';

export const devUtils = {
    exportData: (key: string, filename: string) => {
        const data = localStorage.getItem(key);
        if (!data) {
            alert(`No data found for key: ${key}`);
            return;
        }
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    },
    resetToSeeded: () => {
        localStorage.clear();
        localDb.initialize();
        window.location.reload();
    }
};
