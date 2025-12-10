import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { api } from '../../lib/api';
import { LogEntry } from '../../types';
import { PageHeader, Button } from '../../components/ui';
import { LogsViewer } from '../../components/LogsViewer';
import { Trash2 } from 'lucide-react';

export const Logs = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    
    const loadLogs = () => {
        api.logs.list().then(setLogs);
    }

    useEffect(() => {
        loadLogs();
        // Initial load only, Live mode in Viewer handles interval if enabled
    }, []);

    const handleClear = async () => {
        if (confirm('Clear all system logs? This cannot be undone.')) {
            await api.logs.clear();
            loadLogs();
        }
    }

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <PageHeader title="Audit & Logs" subtitle="Track system activity, user actions, and operational events." />
                <Button variant="danger" onClick={handleClear}>
                    <Trash2 className="w-4 h-4 mr-2" /> Clear History
                </Button>
            </div>
            <LogsViewer logs={logs} onRefresh={loadLogs} />
        </AdminLayout>
    )
}