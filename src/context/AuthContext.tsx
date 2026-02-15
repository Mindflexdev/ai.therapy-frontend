import React, { createContext, useState, useContext } from 'react';

type AuthContextType = {
    isLoggedIn: boolean;
    selectedTherapistId: string | null;
    showLoginModal: boolean;
    login: () => void;
    logout: () => void;
    selectTherapist: (id: string) => void;
    setShowLoginModal: (show: boolean) => void;
};

const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    selectedTherapistId: null,
    showLoginModal: false,
    login: () => { },
    logout: () => { },
    selectTherapist: () => { },
    setShowLoginModal: () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [selectedTherapistId, setSelectedTherapistId] = useState<string | null>(null);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const login = () => setIsLoggedIn(true);
    const logout = () => {
        setIsLoggedIn(false);
        setSelectedTherapistId(null);
    };
    const selectTherapist = (id: string) => setSelectedTherapistId(id);

    return (
        <AuthContext.Provider value={{
            isLoggedIn,
            selectedTherapistId,
            showLoginModal,
            login,
            logout,
            selectTherapist,
            setShowLoginModal
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
