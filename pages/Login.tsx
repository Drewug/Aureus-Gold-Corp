import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/auth';
import { Button, Input, Card, Label } from '../components/ui';
import { Lock, Gem, AlertTriangle } from 'lucide-react';

export const Login = () => {
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const success = await auth.login(password, remember);
            if (success) {
                navigate('/admin');
            } else {
                setError('Invalid credentials.');
            }
        } catch (err) {
            setError('Login failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-charcoal flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-gold to-gold-dark rounded-lg shadow-[0_0_30px_rgba(212,175,55,0.2)] mb-4">
                        <Gem className="w-8 h-8 text-charcoal" />
                    </div>
                    <h1 className="text-2xl font-serif text-white tracking-wide">Aureus Gold Corp</h1>
                    <p className="text-sm text-gold-dim uppercase tracking-widest mt-1">Admin Console</p>
                </div>

                <Card className="border-gold/20 bg-charcoal-light/50 backdrop-blur">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="text-center border-b border-charcoal-lighter pb-4 mb-4">
                            <h2 className="text-white font-medium flex items-center justify-center gap-2">
                                <Lock className="w-4 h-4 text-gold" /> Secure Access
                            </h2>
                        </div>

                        {error && (
                            <div className="bg-red-900/20 border border-red-900/50 p-3 rounded text-red-400 text-sm flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> {error}
                            </div>
                        )}

                        <div>
                            <Label>Access Key</Label>
                            <Input 
                                type="password" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                placeholder="Enter password..."
                                className="bg-charcoal text-white border-charcoal-lighter focus:border-gold"
                                autoFocus
                            />
                            <p className="text-xs text-gray-600 mt-2">Hint: The key is "Ddambaian123@"</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <input 
                                type="checkbox" 
                                id="remember"
                                className="accent-gold w-4 h-4 rounded border-charcoal-lighter bg-charcoal"
                                checked={remember}
                                onChange={e => setRemember(e.target.checked)}
                            />
                            <Label htmlFor="remember" className="mb-0 text-gray-400 font-normal cursor-pointer">Remember device for 30 days</Label>
                        </div>

                        <Button type="submit" className="w-full" isLoading={loading}>
                            Authenticate
                        </Button>
                    </form>
                </Card>
                
                <div className="text-center mt-8 text-xs text-gray-600">
                    <p>Restricted System. All activities are logged and monitored.</p>
                    <p>Session ID: {Date.now().toString(36).toUpperCase()}</p>
                </div>
            </div>
        </div>
    );
};