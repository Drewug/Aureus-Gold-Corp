import React, { useState, useEffect } from 'react';
import { LogEntry } from '../types';
import { Badge, Card, Input, Button } from './ui';
import { formatDate } from '../lib/utils';
import { Search, Filter, RefreshCcw, Download, Play, Pause, ChevronRight, ChevronDown, Activity } from 'lucide-react';

interface LogsViewerProps {
    logs: LogEntry[];
    onRefresh: () => void;
    limit?: number;
}

export const LogsViewer: React.FC<LogsViewerProps> = ({ logs, onRefresh, limit }) => {
    const [filterType, setFilterType] = useState<string>('all');
    const [search, setSearch] = useState('');
    const [authorFilter, setAuthorFilter] = useState('');
    const [isLive, setIsLive] = useState(false);
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

    // Live Mode Effect
    useEffect(() => {
        let interval: any;
        if (isLive) {
            interval = setInterval(() => {
                onRefresh();
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isLive, onRefresh]);

    const getTypeColor = (type: LogEntry['type']) => {
        switch(type) {
            case 'cron': return 'default';
            case 'order': return 'success';
            case 'ingest': return 'warning';
            case 'product': return 'default'; // blue-ish usually handled by UI theme for default
            case 'webhook': return 'warning';
            case 'notification': return 'default';
            default: return 'default';
        }
    };

    const filtered = logs.filter(log => {
        const matchesType = filterType === 'all' || log.type === filterType;
        const matchesSearch = log.message.toLowerCase().includes(search.toLowerCase()) || 
                              (log.resourceId && log.resourceId.toLowerCase().includes(search.toLowerCase())) ||
                              (log.action && log.action.toLowerCase().includes(search.toLowerCase()));
        const matchesAuthor = !authorFilter || log.author.toLowerCase().includes(authorFilter.toLowerCase());
        
        return matchesType && matchesSearch && matchesAuthor;
    });

    const displayLogs = limit ? filtered.slice(0, limit) : filtered;

    const handleExport = () => {
        const headers = ['Timestamp', 'Type', 'Action', 'Author', 'Resource', 'Message', 'Details'];
        const rows = filtered.map(log => [
            log.timestamp,
            log.type,
            log.action,
            log.author,
            `${log.resourceType || ''}:${log.resourceId || ''}`,
            `"${log.message.replace(/"/g, '""')}"`,
            `"${JSON.stringify(log.details || {}).replace(/"/g, '""')}"`
        ]);
        
        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_logs_${new Date().toISOString()}.csv`;
        a.click();
    };

    const authors = Array.from(new Set(logs.map(l => l.author)));

    return (
        <div className="space-y-4">
            <div className="flex flex-col xl:flex-row gap-4 justify-between bg-charcoal-light p-4 rounded border border-charcoal-lighter">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        <Input 
                            className="pl-9" 
                            placeholder="Search message, ID, action..." 
                            value={search} 
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    
                    <select 
                        className="h-10 rounded-md border border-charcoal-lighter bg-charcoal px-3 text-sm text-gray-100 focus:ring-2 focus:ring-gold outline-none"
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                    >
                        <option value="all">All Types</option>
                        <option value="system">System</option>
                        <option value="order">Order</option>
                        <option value="product">Product</option>
                        <option value="cms">CMS</option>
                        <option value="ingest">Ingest</option>
                        <option value="cron">Cron</option>
                        <option value="webhook">Webhook</option>
                    </select>

                    <select 
                        className="h-10 rounded-md border border-charcoal-lighter bg-charcoal px-3 text-sm text-gray-100 focus:ring-2 focus:ring-gold outline-none"
                        value={authorFilter}
                        onChange={e => setAuthorFilter(e.target.value)}
                    >
                        <option value="">All Authors</option>
                        {authors.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>

                {/* Controls */}
                <div className="flex gap-2 justify-end">
                    <Button 
                        variant={isLive ? 'primary' : 'secondary'} 
                        onClick={() => setIsLive(!isLive)}
                        className="w-32"
                    >
                        {isLive ? <><Pause className="w-4 h-4 mr-2" /> Live</> : <><Play className="w-4 h-4 mr-2" /> Stream</>}
                    </Button>
                    <Button variant="secondary" onClick={handleExport} title="Export Filtered CSV">
                        <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="secondary" onClick={onRefresh} title="Refresh">
                        <RefreshCcw className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <Card className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-charcoal-lighter text-gray-400 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3 w-10"></th>
                                <th className="px-4 py-3">Time</th>
                                <th className="px-4 py-3">Author</th>
                                <th className="px-4 py-3">Action</th>
                                <th className="px-4 py-3">Message</th>
                                <th className="px-4 py-3">Resource</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-charcoal-lighter">
                            {displayLogs.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No logs found matching criteria.</td></tr>
                            ) : (
                                displayLogs.map(log => {
                                    const isExpanded = expandedLogId === log.id;
                                    return (
                                        <React.Fragment key={log.id}>
                                            <tr 
                                                className={`hover:bg-charcoal-lighter/30 cursor-pointer transition-colors ${isExpanded ? 'bg-charcoal-lighter/50' : ''}`}
                                                onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                                            >
                                                <td className="px-4 py-3 text-gray-500">
                                                    {isExpanded ? <ChevronDown className="w-4 h-4"/> : <ChevronRight className="w-4 h-4"/>}
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 whitespace-nowrap font-mono text-xs">{formatDate(log.timestamp)}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${log.author === 'System' ? 'bg-blue-400' : log.author === 'Admin' ? 'bg-gold' : 'bg-gray-400'}`}></div>
                                                        {log.author}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variant={getTypeColor(log.type)}>{log.action || log.type}</Badge>
                                                </td>
                                                <td className="px-4 py-3 text-gray-300 max-w-xs truncate" title={log.message}>
                                                    {log.message}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                                                    {log.resourceType && (
                                                        <span className="bg-charcoal-lighter px-1 rounded border border-charcoal-light">
                                                            {log.resourceType}:{log.resourceId?.slice(0,8)}...
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr className="bg-charcoal-lighter/20">
                                                    <td colSpan={6} className="px-4 py-4">
                                                        <div className="bg-charcoal border border-charcoal-lighter rounded p-4 font-mono text-xs">
                                                            <div className="mb-2 text-gold font-bold flex items-center gap-2">
                                                                <Activity className="w-3 h-3" /> Event Details
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div>
                                                                    <span className="text-gray-500 block mb-1">Full Message</span>
                                                                    <div className="text-white bg-charcoal-light p-2 rounded mb-4">{log.message}</div>
                                                                    
                                                                    <span className="text-gray-500 block mb-1">Context</span>
                                                                    <ul className="text-gray-400 space-y-1">
                                                                        <li>ID: {log.id}</li>
                                                                        <li>Type: {log.type}</li>
                                                                        <li>Resource: {log.resourceType || 'N/A'} {log.resourceId ? `(${log.resourceId})` : ''}</li>
                                                                    </ul>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-500 block mb-1">Payload / Diff</span>
                                                                    <div className="bg-black/50 p-2 rounded border border-charcoal-lighter h-40 overflow-auto">
                                                                        {log.details ? (
                                                                            <pre className="text-green-400">{JSON.stringify(log.details, null, 2)}</pre>
                                                                        ) : (
                                                                            <span className="text-gray-600 italic">No additional details recorded.</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};