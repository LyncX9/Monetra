import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { lightTheme, darkTheme, ThemeType } from '../theme/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeContextType {
    theme: ThemeType;
    isDark: boolean;
    toggleTheme: () => void;
    setDarkMode: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@pocket_expense_theme';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        loadThemePreference();
    }, []);

    const loadThemePreference = async () => {
        try {
            const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (saved !== null) {
                setIsDark(saved === 'dark');
            }
        } catch (e) {
            console.log('Failed to load theme preference');
        }
    };

    const saveThemePreference = async (dark: boolean) => {
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, dark ? 'dark' : 'light');
        } catch (e) {
            console.log('Failed to save theme preference');
        }
    };

    const toggleTheme = () => {
        const newValue = !isDark;
        setIsDark(newValue);
        saveThemePreference(newValue);
    };

    const setDarkMode = (value: boolean) => {
        setIsDark(value);
        saveThemePreference(value);
    };

    const currentTheme = isDark ? darkTheme : lightTheme;

    return (
        <ThemeContext.Provider value={{ theme: currentTheme, isDark, toggleTheme, setDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
