import React, { useState } from 'react';
import { api } from '../lib/api';
import { Button, Card, Label } from './ui';
import { Play, Terminal } from 'lucide-react';

const AVAILABLE_FUNCTIONS = [
    { name: 'products.list', fn: api.products.list, defaultArgs: '' },
    { name: 'orders.list', fn: api.orders.list, defaultArgs: '' },
    { name: 'logs.list', fn: api.logs.list, defaultArgs: '' },
    { name: 'products.get', fn: api.products.get, defaultArgs: '"rcm-gold-bar"' },
    { name: 'logs.create', fn: api.logs.create, defaultArgs: '["system", "Test Action", "Test message from playground", { "author": "Tester" }]' },
];

export const ApiPlayground = () => {
    const [selectedFuncIndex, setSelectedFuncIndex] = useState(0);
    const [args, setArgs] = useState(AVAILABLE_FUNCTIONS[0].defaultArgs);
    const [result, setResult] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);

    const handleExecute = async () => {
        setIsExecuting(true);
        setResult('Executing...');
        try {
            const funcDef = AVAILABLE_FUNCTIONS[selectedFuncIndex];
            let parsedArgs: any[] = [];
            if (args.trim()) {
                try {
                     const parsed = JSON.parse(args);
                     // If parsed is array, spread it. If not, treat as single arg unless it was intended as such.
                     // Simple heuristic: if the function expects multiple args (like logs.create), user should provide array.
                     // If user provides single string "foo", wrap in array ["foo"].
                     parsedArgs = Array.isArray(parsed) ? parsed : [parsed];
                } catch (e) {
                     // Fallback for simple strings that might not be quoted json
                     parsedArgs = [args];
                }
            }
            
            // @ts-ignore
            const res = await funcDef.fn(...parsedArgs);
            setResult(JSON.stringify(res, null, 2));
        } catch (e: any) {
            setResult(`Error: ${e.message}`);
        } finally {
            setIsExecuting(false);
        }
    };

    return (
        <Card className="flex flex-col h-[500px]">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-gold" /> API Playground
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full min-h-0">
                <div className="flex flex-col gap-4">
                    <div>
                        <Label>Function</Label>
                        <select 
                            className="w-full h-10 rounded-md border border-charcoal-lighter bg-charcoal-light px-3 text-sm text-gray-100 focus:ring-2 focus:ring-gold outline-none"
                            value={selectedFuncIndex}
                            onChange={(e) => {
                                const idx = parseInt(e.target.value);
                                setSelectedFuncIndex(idx);
                                setArgs(AVAILABLE_FUNCTIONS[idx].defaultArgs);
                            }}
                        >
                            {AVAILABLE_FUNCTIONS.map((f, i) => (
                                <option key={f.name} value={i}>{f.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1 flex flex-col min-h-0">
                        <Label>Arguments (JSON Array)</Label>
                        <textarea 
                            className="flex-1 w-full bg-charcoal-lighter border border-charcoal-light rounded p-2 text-xs font-mono text-gray-300 focus:border-gold outline-none resize-none"
                            value={args}
                            onChange={e => setArgs(e.target.value)}
                            placeholder='["arg1", "arg2"]'
                        />
                        <div className="text-xs text-gray-500 mt-1">
                            Example: <code>["arg1"]</code> or <code>"simple_string"</code>
                        </div>
                    </div>
                    <Button onClick={handleExecute} isLoading={isExecuting}>
                        <Play className="w-4 h-4 mr-2" /> Execute
                    </Button>
                </div>
                <div className="flex flex-col min-h-0">
                     <Label>Result</Label>
                     <div className="flex-1 bg-charcoal border border-charcoal-lighter rounded p-2 overflow-auto custom-scrollbar">
                         <pre className="text-xs font-mono text-green-400 whitespace-pre-wrap break-all">{result}</pre>
                     </div>
                </div>
            </div>
        </Card>
    );
};