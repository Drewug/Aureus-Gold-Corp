import React, { useState, useEffect } from 'react';
import { AdminBroadcast } from '../types';
import { api } from '../lib/api';
import { Button, Card, Input, Label, Badge } from './ui';
import { Megaphone, Trash2, Clock, AlertTriangle } from 'lucide-react';
import { formatDate } from '../lib/utils';

export const BroadcastManager = () => {
    const [broadcasts, setBroadcasts] = useState<AdminBroadcast[]>([]);
    const [message, setMessage] = useState('');
    const [priority, setPriority] = useState<'normal' | 'high'>('normal');

    useEffect(() => {
        loadBroadcasts();
    }, []);

    const loadBroadcasts = async () => {
        const b = await api.notifications.getBroadcasts();
        setBroadcasts(b);
    };

    const handleSend = async () => {
        if (!message.trim()) return;
        await api.notifications.createBroadcast(message, priority);
        setMessage('');
        loadBroadcasts();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this broadcast?')) {
            await api.notifications.deleteBroadcast(id);
            loadBroadcasts();
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            <div className="md:col-span-1 space-y-4">
                <Card>
                    <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                        <Megaphone className="w-5 h-5 text-gold" /> New Broadcast
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <Label>Message</Label>
                            <textarea 
                                className="w-full h-32 bg-charcoal-lighter border border-charcoal-light rounded p-3 text-sm text-gray-200 focus:border-gold outline-none resize-none"
                                placeholder="Announcement for all admins..."
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Priority</Label>
                            <div className="flex gap-2 mt-1">
                                <label className="flex items-center gap-2 cursor-pointer bg-charcoal-lighter px-3 py-2 rounded border border-transparent hover:border-gray-600">
                                    <input 
                                        type="radio" 
                                        name="priority" 
                                        className="accent-gold"
                                        checked={priority === 'normal'} 
                                        onChange={() => setPriority('normal')} 
                                    />
                                    <span className="text-sm text-gray-300">Normal</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer bg-red-900/20 px-3 py-2 rounded border border-transparent hover:border-red-900/50">
                                    <input 
                                        type="radio" 
                                        name="priority" 
                                        className="accent-red-500"
                                        checked={priority === 'high'} 
                                        onChange={() => setPriority('high')} 
                                    />
                                    <span className="text-sm text-red-300">High Importance</span>
                                </label>
                            </div>
                        </div>
                        <Button className="w-full" onClick={handleSend} disabled={!message}>
                            Post Announcement
                        </Button>
                    </div>
                </Card>
            </div>

            <div className="md:col-span-2">
                 <Card className="h-full flex flex-col">
                    <h3 className="text-white font-medium mb-4">Broadcast History</h3>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                        {broadcasts.length === 0 ? (
                            <div className="text-center text-gray-500 py-12">No active broadcasts.</div>
                        ) : (
                            broadcasts.map(b => (
                                <div key={b.id} className={`p-4 rounded border flex justify-between gap-4 ${b.priority === 'high' ? 'bg-red-900/10 border-red-900/30' : 'bg-charcoal border-charcoal-lighter'}`}>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            {b.priority === 'high' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                            <span className="text-xs font-bold text-gray-400">{b.author}</span>
                                            <span className="text-xs text-gray-600 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {formatDate(b.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-200 whitespace-pre-wrap">{b.message}</p>
                                    </div>
                                    <button onClick={() => handleDelete(b.id)} className="text-gray-600 hover:text-red-500 self-start">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                 </Card>
            </div>
        </div>
    );
};