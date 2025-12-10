import React, { useState } from 'react';
import { LeadSubmission, LeadStatus } from '../types';
import { api } from '../lib/api';
import { Button, Card, Badge } from './ui';
import { formatDate } from '../lib/utils';
import { Search, Download, Trash2, Mail, MessageSquare } from 'lucide-react';

interface LeadsListProps {
    leads: LeadSubmission[];
    onRefresh: () => void;
}

export const LeadsList: React.FC<LeadsListProps> = ({ leads, onRefresh }) => {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedLead, setSelectedLead] = useState<LeadSubmission | null>(null);

    const filtered = leads.filter(l => {
        const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
        const matchesSearch = l.formTitle.toLowerCase().includes(search.toLowerCase()) ||
                              Object.values(l.data).some((v: string) => v.toLowerCase().includes(search.toLowerCase()));
        return matchesStatus && matchesSearch;
    });

    const updateStatus = async (status: LeadStatus) => {
        if (!selectedLead) return;
        await api.leads.updateStatus(selectedLead.id, status);
        setSelectedLead({ ...selectedLead, status });
        onRefresh();
    };

    const handleExport = () => {
        const headers = ['Date', 'Form', 'Status', 'Data'];
        const rows = filtered.map(l => [
            l.createdAt,
            l.formTitle,
            l.status,
            JSON.stringify(l.data).replace(/"/g, '""')
        ]);
        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'leads_export.csv';
        a.click();
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-250px)]">
            {/* List */}
            <div className={`${selectedLead ? 'hidden lg:flex' : 'flex'} flex-col flex-1 gap-4`}>
                <div className="flex gap-4 mb-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        <input 
                            className="w-full h-10 rounded-md border border-charcoal-lighter bg-charcoal-light pl-9 pr-3 text-sm text-gray-100 focus:ring-2 focus:ring-gold outline-none"
                            placeholder="Search leads..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <select 
                        className="h-10 rounded-md border border-charcoal-lighter bg-charcoal-light px-3 text-sm text-gray-100 focus:ring-2 focus:ring-gold outline-none"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="converted">Converted</option>
                        <option value="lost">Lost</option>
                    </select>
                    <Button variant="secondary" onClick={handleExport}>
                        <Download className="w-4 h-4" />
                    </Button>
                </div>

                <Card className="flex-1 p-0 overflow-hidden flex flex-col">
                    <div className="overflow-y-auto custom-scrollbar flex-1">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-charcoal-lighter text-gray-400 uppercase text-xs sticky top-0">
                                <tr>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Form</th>
                                    <th className="px-4 py-3">Preview</th>
                                    <th className="px-4 py-3 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-charcoal-lighter">
                                {filtered.map(lead => (
                                    <tr 
                                        key={lead.id} 
                                        className={`hover:bg-charcoal-lighter/50 cursor-pointer ${selectedLead?.id === lead.id ? 'bg-gold/5 border-l-2 border-gold' : ''}`} 
                                        onClick={() => setSelectedLead(lead)}
                                    >
                                        <td className="px-4 py-4 text-gray-400 whitespace-nowrap">{formatDate(lead.createdAt)}</td>
                                        <td className="px-4 py-4 text-white">{lead.formTitle}</td>
                                        <td className="px-4 py-4 text-gray-300 truncate max-w-xs">
                                            {Object.values(lead.data)[0]}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <Badge variant={lead.status === 'new' ? 'success' : 'default'}>
                                                {lead.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filtered.length === 0 && <div className="p-8 text-center text-gray-500">No leads found.</div>}
                    </div>
                </Card>
            </div>

            {/* Details Panel */}
            {selectedLead && (
                <div className="w-full lg:w-[400px] flex flex-col gap-4 animate-in slide-in-from-right-10">
                    <Card className="flex-1 overflow-y-auto">
                        <div className="flex justify-between items-start mb-6 pb-4 border-b border-charcoal-lighter">
                            <div>
                                <h3 className="text-white font-medium text-lg">{selectedLead.formTitle} Submission</h3>
                                <p className="text-sm text-gray-500">{formatDate(selectedLead.createdAt)}</p>
                            </div>
                            <button onClick={() => setSelectedLead(null)} className="text-gray-500 hover:text-white lg:hidden">Close</button>
                        </div>

                        <div className="space-y-4">
                            {Object.entries(selectedLead.data).map(([key, value]) => (
                                <div key={key}>
                                    <span className="text-xs text-gold-dim uppercase tracking-wider block mb-1">{key}</span>
                                    <div className="text-sm text-gray-200 bg-charcoal p-2 rounded border border-charcoal-lighter whitespace-pre-wrap">
                                        {value}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-4 border-t border-charcoal-lighter">
                            <span className="text-xs text-gray-500 uppercase tracking-wider block mb-3">Workflow Actions</span>
                            <div className="grid grid-cols-2 gap-2">
                                <Button 
                                    size="sm" 
                                    variant={selectedLead.status === 'contacted' ? 'primary' : 'secondary'} 
                                    onClick={() => updateStatus('contacted')}
                                >
                                    <Mail className="w-3 h-3 mr-2" /> Mark Contacted
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant={selectedLead.status === 'qualified' ? 'primary' : 'secondary'} 
                                    onClick={() => updateStatus('qualified')}
                                >
                                    <MessageSquare className="w-3 h-3 mr-2" /> Mark Qualified
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant={selectedLead.status === 'converted' ? 'primary' : 'secondary'} 
                                    onClick={() => updateStatus('converted')}
                                    className="col-span-2"
                                >
                                    Mark Converted (Sale)
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="danger" 
                                    onClick={() => updateStatus('lost')}
                                    className="col-span-2"
                                >
                                    Mark Lost / Spam
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};