"use client";

import { useEffect, useState } from 'react';
import { fetchSettings } from '@/lib/api';

type Currency = 'usd' | 'eur' | 'gbp' | 'inr';

const currencyMap: Record<Currency, string> = {
    usd: 'USD',
    eur: 'EUR',
    gbp: 'GBP',
    inr: 'INR',
};

const localeMap: Record<Currency, string> = {
    usd: 'en-US',
    eur: 'de-DE',
    gbp: 'en-GB',
    inr: 'en-IN',
};

export function useCurrency() {
    const [currency, setCurrency] = useState<Currency>('usd');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadCurrency = async () => {
            try {
                const settings = await fetchSettings('workspace_global');
                if (settings?.currency) {
                    setCurrency(settings.currency as Currency);
                }
            } catch (error) {
                console.error('Failed to load currency settings:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadCurrency();
    }, []);

    const formatCurrency = (value: number, options?: Intl.NumberFormatOptions) => {
        return new Intl.NumberFormat(localeMap[currency], {
            style: 'currency',
            currency: currencyMap[currency],
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
            ...options,
        }).format(value);
    };

    return { currency, formatCurrency, isLoading };
}
