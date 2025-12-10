import React, { createContext, useContext, useEffect, useState } from 'react';
import { CurrencyConfig, MultiCurrencySettings, CurrencyCode } from '../types';
import { localDb } from './localDb';
import { getCookie, setCookie } from './utils';

interface CurrencyContextType {
    settings: MultiCurrencySettings;
    currentCurrency: CurrencyConfig;
    setCurrency: (code: CurrencyCode) => void;
    convertPrice: (usdPrice: number) => { value: number, currency: CurrencyConfig };
    formatPrice: (usdPrice: number, includeTax?: boolean) => string;
    refreshRates: () => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children?: React.ReactNode }) => {
    const [settings, setSettings] = useState<MultiCurrencySettings>(localDb.getCurrencySettings());
    const [currentCode, setCurrentCode] = useState<CurrencyCode>('USD');

    // Load user preference: Cookie -> LocalStorage -> Default
    useEffect(() => {
        const cookiePref = getCookie('currency_preference');
        if (cookiePref) {
            setCurrentCode(cookiePref as CurrencyCode);
        } else {
            const storedPref = localStorage.getItem('aureus_user_currency');
            if (storedPref) {
                setCurrentCode(storedPref as CurrencyCode);
            }
        }
    }, []);

    // Helper to get active config object
    const getCurrentConfig = () => {
        return settings.currencies.find(c => c.code === currentCode) || settings.currencies[0];
    };

    const setCurrency = (code: CurrencyCode) => {
        setCurrentCode(code);
        setCookie('currency_preference', code);
        localStorage.setItem('aureus_user_currency', code);
    };

    const refreshRates = () => {
        setSettings(localDb.getCurrencySettings());
    };

    // Listen for storage events (updates from Admin tab)
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'aureus_currency_v1') {
                refreshRates();
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    // Price Conversion Logic
    const convertPrice = (usdPrice: number) => {
        const config = getCurrentConfig();
        
        // 1. Convert Base Rate
        let val = usdPrice * config.exchangeRate;
        
        // 2. Add Margin
        if (config.marginPercent > 0) {
            val = val * (1 + (config.marginPercent / 100));
        }

        // 3. Rounding
        switch (config.rounding) {
            case 'nearest_1':
                val = Math.ceil(val);
                break;
            case 'nearest_5':
                val = Math.ceil(val / 5) * 5;
                break;
            case 'nearest_100':
                val = Math.ceil(val / 100) * 100;
                break;
            case 'decimals_2':
            default:
                // Do nothing here, handled in formatting
                break;
        }

        return { value: val, currency: config };
    };

    const formatPrice = (usdPrice: number, includeTax = false): string => {
        const { value, currency } = convertPrice(usdPrice);
        let finalValue = value;

        if (includeTax && currency.taxPercent > 0) {
            finalValue = finalValue * (1 + (currency.taxPercent / 100));
        }

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.code,
            minimumFractionDigits: currency.rounding === 'decimals_2' ? 2 : 0,
            maximumFractionDigits: currency.rounding === 'decimals_2' ? 2 : 0,
        }).format(finalValue);
    };

    return (
        <CurrencyContext.Provider value={{ 
            settings, 
            currentCurrency: getCurrentConfig(), 
            setCurrency, 
            convertPrice, 
            formatPrice,
            refreshRates
        }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
    return context;
};