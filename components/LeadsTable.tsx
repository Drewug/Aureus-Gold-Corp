import React, { useState } from 'react';
import { LeadSubmission, LeadStatus } from '../types';
import { api } from '../lib/api';
import { Button, Card, Badge, Input } from './ui';
import { formatDate } from '../lib/utils';
import { Search, Download, Mail, MessageSquare, Check, X, FileText, ChevronRight } from 'lucide-react';

interface LeadsTableProps {
    leads: LeadSubmission[];
    onRefresh: () => void;
}

export const LeadsTable: React.FC<LeadsTableProps> = ({ leads, onRefresh }) => {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedLead, setSelectedLead] = useState<LeadSubmission | null>(null);
    const [noteInput, setNoteInput] = useState('');

    const filtered = leads.filter(l => {
        const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
        // Search in form title or any value in the data object
        const matchesSearch = l.formTitle.toLowerCase().includes(search.toLowerCase()) ||
                              Object.values(l.data).some((v: string) => String(v).toLowerCase().includes(search.toLowerCase()));
        return matchesStatus && matchesSearch;
    });

    const updateStatus = async (status: LeadStatus) => {
        if (!selectedLead) return;
        await api.leads.updateStatus(selectedLead.id, status);
        setSelectedLead({ ...selectedLead, status });
        onRefresh();
    };

    const saveNote = async () => {
        if (!selectedLead) return;
        await api.leads.updateStatus(selectedLead.id, selectedLead.status, noteInput);
        setSelectedLead({ ...selectedLead, notes: noteInput });
        onRefresh();
    };

    const handleLeadClick = (lead: LeadSubmission) => {
        setSelectedLead(lead);
        setNoteInput(lead.notes || '');
    };

    const handleExport = () => {
        const headers = ['ID', 'Date', 'Form', 'Status', 'Notes', 'Data'];
        const rows = filtered.map(l => [
            l.id,
            l.createdAt,
            l.formTitle,
            l.status,
            `"${(l.notes || '').replace(/"/g, '""')}"`,
            `"${JSON.stringify(l.data).replace(/"/g, '""')}"`
        ]);
        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leads_export_${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-250px)]">
            {/* Table Section */}
            <div className={`${selectedLead ? 'hidden lg:flex' : 'flex'} flex-col flex-1 gap-4 min-w-0`}>
                <div className="flex flex-col sm:flex-row gap-4 mb-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        <Input 
                            className="pl-9" 
                            placeholder="Search leads..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
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
                        <Button variant="secondary" onClick={handleExport} title="Export CSV">
                            <Download className="w-4 h-4" />
                        </Button>
                    </div>
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
                                    <th className="px-4 py-3 w-8"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-charcoal-lighter">
                                {filtered.map(lead => (
                                    <tr 
                                        key={lead.id} 
                                        className={`hover:bg-charcoal-lighter/50 cursor-pointer transition-colors ${selectedLead?.id === lead.id ? 'bg-gold/10 border-l-2 border-gold' : ''}`} 
                                        onClick={() => handleLeadClick(lead)}
                                    >
                                        <td className="px-4 py-4 text-gray-400 whitespace-nowrap">{formatDate(lead.createdAt)}</td>
                                        <td className="px-4 py-4 text-white font-medium">{lead.formTitle}</td>
                                        <td className="px-4 py-4 text-gray-400 truncate max-w-xs">
                                            {Object.values(lead.data).join(', ')}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <Badge variant={
                                                lead.status === 'new' ? 'success' : 
                                                lead.status === 'lost' ? 'error' : 
                                                'default'
                                            }>
                                                {lead.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4 text-gray-500">
                                            <ChevronRight className="w-4 h-4" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filtered.length === 0 && <div className="p-12 text-center text-gray-500">No leads found matching criteria.</div>}
                    </div>
                </Card>
            </div>

            {/* Detail Panel */}
            {selectedLead && (
                <div className="w-full lg:w-[450px] flex flex-col gap-4 animate-in slide-in-from-right-10 duration-200">
                    <Card className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex justify-between items-start mb-6 pb-4 border-b border-charcoal-lighter">
                            <div>
                                <h3 className="text-white font-medium text-lg">{selectedLead.formTitle}</h3>
                                <p className="text-sm text-gray-500">{formatDate(selectedLead.createdAt)}</p>
                            </div>
                            <button onClick={() => setSelectedLead(null)} className="text-gray-500 hover:text-white lg:hidden">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2">
                            {/* Form Data */}
                            <div className="space-y-4">
                                {Object.entries(selectedLead.data).map(([key, value]) => (
                                    <div key={key}>
                                        <span className="text-xs text-gold-dim uppercase tracking-wider block mb-1 font-semibold">{key}</span>
                                        <div className="text-sm text-gray-200 bg-charcoal p-3 rounded border border-charcoal-lighter whitespace-pre-wrap break-words">
                                            {String(value)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Workflow */}
                            <div className="pt-4 border-t border-charcoal-lighter">
                                <span className="text-xs text-gray-500 uppercase tracking-wider block mb-3 font-semibold">Workflow Status</span>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button 
                                        size="sm" 
                                        variant={selectedLead.status === 'contacted' ? 'primary' : 'secondary'} 
                                        onClick={() => updateStatus('contacted')}
                                    >
                                        <Mail className="w-3 h-3 mr-2" /> Contacted
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        variant={selectedLead.status === 'qualified' ? 'primary' : 'secondary'} 
                                        onClick={() => updateStatus('qualified')}
                                    >
                                        <MessageSquare className="w-3 h-3 mr-2" /> Qualified
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        variant={selectedLead.status === 'converted' ? 'primary' : 'secondary'} 
                                        onClick={() => updateStatus('converted')}
                                        className="col-span-2"
                                    >
                                        <Check className="w-3 h-3 mr-2" /> Mark Converted (Won)
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        variant={selectedLead.status === 'lost' ? 'danger' : 'secondary'} 
                                        onClick={() => updateStatus('lost')}
                                        className="col-span-2 border-red-900/30 text-red-400 hover:bg-red-900/20"
                                    >
                                        <X className="w-3 h-3 mr-2" /> Mark Lost / Spam
                                    </Button>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="pt-4 border-t border-charcoal-lighter">
                                <span className="text-xs text-gray-500 uppercase tracking-wider block mb-2 font-semibold">Internal Notes</span>
                                <textarea 
                                    className="w-full h-24 bg-charcoal border border-charcoal-lighter rounded p-3 text-sm text-gray-200 focus:border-gold outline-none resize-none mb-2"
                                    placeholder="Add notes about this lead..."
                                    value={noteInput}
                                    onChange={e => setNoteInput(e.target.value)}
                                />
                                <Button size="sm" variant="secondary" onClick={saveNote} className="w-full">
                                    <FileText className="w-3 h-3 mr-2" /> Save Notes
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};