import React from 'react';
import { useCurrency } from '../lib/currencyContext';
import { CurrencyCode } from '../types';
import { ChevronDown, Globe } from 'lucide-react';

export const CurrencySwitcher = () => {
    const { settings, currentCurrency, setCurrency } = useCurrency();
    const [isOpen, setIsOpen] = React.useState(false);

    // Close on outside click
    React.useEffect(() => {
        const close = () => setIsOpen(false);
        if (isOpen) window.addEventListener('click', close);
        return () => window.removeEventListener('click', close);
    }, [isOpen]);

    const handleSelect = (code: CurrencyCode) => {
        setCurrency(code);
        setIsOpen(false);
    };

    return (
        <div className="relative" onClick={e => e.stopPropagation()}>
            <button 
                className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Globe className="w-4 h-4 text-gold" />
                <span>{currentCurrency.code}</span>
                <ChevronDown className="w-3 h-3" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-charcoal-light border border-charcoal-lighter rounded shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {settings.currencies.filter(c => c.isActive).map(c => (
                        <button
                            key={c.code}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-charcoal-lighter transition-colors flex justify-between ${currentCurrency.code === c.code ? 'text-gold' : 'text-gray-300'}`}
                            onClick={() => handleSelect(c.code)}
                        >
                            <span>{c.code}</span>
                            <span className="text-gray-500">{c.symbol}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};