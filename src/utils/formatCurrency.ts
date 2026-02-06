// Currency symbols
export const CURRENCY_SYMBOLS: Record<string, string> = {
    IDR: 'Rp',
    USD: '$',
    EUR: '€',
    JPY: '¥',
    GBP: '£',
    CNY: '¥',
    KRW: '₩',
    SGD: 'S$',
    MYR: 'RM',
    THB: '฿',
    PHP: '₱',
    VND: '₫',
    INR: '₹',
    AUD: 'A$',
    CAD: 'C$',
};

// Format number with abbreviation for large values
export const formatSmartNumber = (value: number, currency: string = 'USD'): string => {
    const symbol = CURRENCY_SYMBOLS[currency] || currency + ' ';
    const absValue = Math.abs(value);

    // For IDR and similar currencies with large values, use different thresholds
    const isLargeCurrency = ['IDR', 'VND', 'KRW', 'JPY'].includes(currency);

    let formattedNumber: string;
    let suffix = '';

    if (isLargeCurrency) {
        // For IDR: 1,000,000 = 1Jt (Juta), 1,000,000,000 = 1M (Miliar)
        if (absValue >= 1_000_000_000_000) {
            formattedNumber = (absValue / 1_000_000_000_000).toFixed(1);
            suffix = 'T'; // Triliun
        } else if (absValue >= 1_000_000_000) {
            formattedNumber = (absValue / 1_000_000_000).toFixed(1);
            suffix = 'M'; // Miliar
        } else if (absValue >= 1_000_000) {
            formattedNumber = (absValue / 1_000_000).toFixed(1);
            suffix = 'Jt'; // Juta
        } else if (absValue >= 1_000) {
            formattedNumber = (absValue / 1_000).toFixed(1);
            suffix = 'K'; // Ribu
        } else {
            formattedNumber = absValue.toFixed(0);
        }
    } else {
        // For USD and similar currencies
        if (absValue >= 1_000_000_000_000) {
            formattedNumber = (absValue / 1_000_000_000_000).toFixed(1);
            suffix = 'T';
        } else if (absValue >= 1_000_000_000) {
            formattedNumber = (absValue / 1_000_000_000).toFixed(1);
            suffix = 'B';
        } else if (absValue >= 1_000_000) {
            formattedNumber = (absValue / 1_000_000).toFixed(1);
            suffix = 'M';
        } else if (absValue >= 10_000) {
            formattedNumber = (absValue / 1_000).toFixed(1);
            suffix = 'K';
        } else {
            formattedNumber = absValue.toLocaleString('en-US', {
                minimumFractionDigits: absValue < 100 ? 2 : 0,
                maximumFractionDigits: 2
            });
        }
    }

    // Remove trailing .0
    if (formattedNumber.endsWith('.0')) {
        formattedNumber = formattedNumber.slice(0, -2);
    }

    const sign = value < 0 ? '-' : '';
    return `${sign}${symbol}${formattedNumber}${suffix}`;
};

// Format full number (no abbreviation) with proper currency
export const formatFullNumber = (value: number, currency: string = 'USD'): string => {
    const symbol = CURRENCY_SYMBOLS[currency] || currency + ' ';
    const absValue = Math.abs(value);

    const isLargeCurrency = ['IDR', 'VND', 'KRW', 'JPY'].includes(currency);

    const formatted = absValue.toLocaleString('en-US', {
        minimumFractionDigits: isLargeCurrency ? 0 : 2,
        maximumFractionDigits: isLargeCurrency ? 0 : 2,
    });

    const sign = value < 0 ? '-' : '';
    return `${sign}${symbol}${formatted}`;
};

// Get responsive font size based on text length
export const getResponsiveFontSize = (
    text: string,
    baseFontSize: number,
    maxWidth: number = 150
): number => {
    // Approximate character width ratio
    const charWidth = baseFontSize * 0.6;
    const textWidth = text.length * charWidth;

    if (textWidth <= maxWidth) {
        return baseFontSize;
    }

    // Calculate scale factor
    const scale = maxWidth / textWidth;
    const newSize = Math.max(baseFontSize * scale, 10); // Minimum 10px

    return Math.floor(newSize);
};

// Smart format that automatically shortens based on available space
export const formatAdaptive = (
    value: number,
    currency: string = 'USD',
    maxChars: number = 12
): string => {
    // Try full format first
    const full = formatFullNumber(value, currency);
    if (full.length <= maxChars) {
        return full;
    }

    // Use abbreviated format
    return formatSmartNumber(value, currency);
};
