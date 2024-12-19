import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [season, setSeason] = useState('2425');
    const [stage, setStage] = useState('E0');

    return (
        <AppContext.Provider value={{ season, setSeason, stage, setStage }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
