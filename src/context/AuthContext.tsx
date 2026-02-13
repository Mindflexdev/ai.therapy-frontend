import React, { createContext, useState, useContext } from 'react';

type AuthContextType = {
    isLoggedIn: boolean;
    selectedTherapistId: string | null;
    login: () => void;
    logout: () => void;
    selectTherapist: (id: string) => void;
};

const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    selectedTherapistId: null,
    login: () => { },
    logout: () => { },
    selectTherapist: () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [selectedTherapistId, setSelectedTherapistId] = useState<string | null>(null);

    const login = () => setIsLoggedIn(true);
    const logout = () => {
        setIsLoggedIn(false);
        setSelectedTherapistId(null);
    };
    const selectTherapist = (id: string) => setSelectedTherapistId(id);

    return (
        <AuthContext.Provider value={{ isLoggedIn, selectedTherapistId, login, logout, selectTherapist }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
