import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PENDING_THERAPIST_KEY = 'pendingTherapist';

type PendingTherapist = { name: string; pendingMessage?: string; timestamp?: number } | null;

type AuthContextType = {
    isLoggedIn: boolean;
    user: User | null;
    session: Session | null;
    selectedTherapistId: string | null;
    showLoginModal: boolean;
    loading: boolean;
    pendingTherapist: PendingTherapist;
    pendingTherapistLoaded: boolean;
    loginWithOtp: (email: string) => Promise<{ error: any }>;
    loginWithGoogle: (therapistName?: string) => Promise<void>;
    loginWithApple: (therapistName?: string) => Promise<void>;
    logout: () => Promise<void>;
    selectTherapist: (id: string) => void;
    setShowLoginModal: (show: boolean) => void;
    setPendingTherapist: (therapist: PendingTherapist) => Promise<void>;
    clearPendingTherapist: () => void;
};

const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    user: null,
    session: null,
    selectedTherapistId: null,
    showLoginModal: false,
    loading: true,
    pendingTherapist: null,
    pendingTherapistLoaded: false,
    loginWithOtp: async () => ({ error: null }),
    loginWithGoogle: async () => {},
    loginWithApple: async () => {},
    logout: async () => {},
    selectTherapist: () => {},
    setShowLoginModal: () => {},
    setPendingTherapist: async () => {},
    clearPendingTherapist: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTherapistId, setSelectedTherapistId] = useState<string | null>(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [pendingTherapist, setPendingTherapistState] = useState<PendingTherapist>(null);
    const [pendingTherapistLoaded, setPendingTherapistLoaded] = useState(false);

    const setPendingTherapist = async (therapist: PendingTherapist) => {
        if (therapist) {
            const withTimestamp = { ...therapist, timestamp: Date.now() };
            console.log('[Auth] setPendingTherapist:', withTimestamp.name, 'timestamp:', withTimestamp.timestamp);
            setPendingTherapistState(withTimestamp);
            await AsyncStorage.setItem(PENDING_THERAPIST_KEY, JSON.stringify(withTimestamp));
            console.log('[Auth] setPendingTherapist: AsyncStorage write complete');
        } else {
            console.log('[Auth] setPendingTherapist: clearing');
            setPendingTherapistState(null);
            await AsyncStorage.removeItem(PENDING_THERAPIST_KEY);
        }
    };

    const clearPendingTherapist = () => {
        setPendingTherapistState(null);
        AsyncStorage.removeItem(PENDING_THERAPIST_KEY);
    };

    useEffect(() => {
        // On app load, check for pending therapist from before OAuth redirect
        // Expire entries older than 10 minutes (stale from previous sessions)
        AsyncStorage.getItem(PENDING_THERAPIST_KEY).then((value) => {
            console.log('[Auth] pendingTherapist from storage:', value);
            if (value) {
                const parsed = JSON.parse(value);
                const TEN_MINUTES = 10 * 60 * 1000;
                if (parsed.timestamp && (Date.now() - parsed.timestamp) < TEN_MINUTES) {
                    setPendingTherapistState(parsed);
                    console.log('[Auth] pendingTherapist restored:', parsed.name);
                } else {
                    // Stale data — remove it
                    console.log('[Auth] pendingTherapist expired, removing');
                    AsyncStorage.removeItem(PENDING_THERAPIST_KEY);
                }
            }
            setPendingTherapistLoaded(true);
        });

        supabase.auth.getSession().then(({ data: { session } }) => {
            console.log('[Auth] getSession result:', session ? `logged in as ${session.user?.email}` : 'no session');
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                console.log('[Auth] onAuthStateChange:', _event, session ? `logged in as ${session.user?.email}` : 'no session');
                setSession(session);
                setUser(session?.user ?? null);
                if (session) {
                    setShowLoginModal(false);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const loginWithOtp = async (email: string) => {
        const redirectTo = Platform.OS === 'web'
            ? window.location.origin
            : 'ai-therapy://';
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: redirectTo },
        });
        return { error };
    };

    const loginWithGoogle = async (therapistName?: string) => {
        // Save pending therapist before OAuth redirect (page will fully reload)
        // Preserve any existing pendingMessage (draft from chat input)
        // MUST await to ensure data is written to AsyncStorage before browser redirects
        if (therapistName) {
            await setPendingTherapist({
                name: therapistName,
                pendingMessage: pendingTherapist?.pendingMessage,
            });
        }
        const redirectTo = Platform.OS === 'web'
            ? window.location.origin
            : 'ai-therapy://';
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo },
        });
        if (error) {
            console.error('Google login error:', error.message);
        }
    };

    const loginWithApple = async (therapistName?: string) => {
        // Save pending therapist before OAuth redirect (page will fully reload)
        // Preserve any existing pendingMessage (draft from chat input)
        // MUST await to ensure data is written to AsyncStorage before browser redirects
        if (therapistName) {
            await setPendingTherapist({
                name: therapistName,
                pendingMessage: pendingTherapist?.pendingMessage,
            });
        }
        const redirectTo = Platform.OS === 'web'
            ? window.location.origin
            : 'ai-therapy://';
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'apple',
            options: { redirectTo },
        });
        if (error) {
            console.error('Apple login error:', error.message);
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setSelectedTherapistId(null);
    };

    const selectTherapist = (id: string) => setSelectedTherapistId(id);

    return (
        <AuthContext.Provider value={{
            isLoggedIn: !!session,
            user,
            session,
            selectedTherapistId,
            showLoginModal,
            loading,
            pendingTherapist,
            pendingTherapistLoaded,
            loginWithOtp,
            loginWithGoogle,
            loginWithApple,
            logout,
            selectTherapist,
            setShowLoginModal,
            setPendingTherapist,
            clearPendingTherapist,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
