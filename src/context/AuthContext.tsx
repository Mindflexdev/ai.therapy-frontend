import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PENDING_THERAPIST_KEY = 'pendingTherapist';

type PendingTherapist = { name: string; pendingMessage?: string; timestamp?: number } | null;

type AuthContextType = {
    isLoggedIn: boolean;
    isPro: boolean;
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
    selectTherapist: (id: string, force?: boolean) => void;
    setShowLoginModal: (show: boolean) => void;
    setPendingTherapist: (therapist: PendingTherapist) => Promise<void>;
    clearPendingTherapist: () => void;
};

const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    isPro: false,
    user: null,
    session: null,
    selectedTherapistId: null,
    showLoginModal: false,
    loading: true,
    pendingTherapist: null,
    pendingTherapistLoaded: false,
    loginWithOtp: async () => ({ error: null }),
    loginWithGoogle: async () => { },
    loginWithApple: async () => { },
    logout: async () => { },
    selectTherapist: () => { },
    setShowLoginModal: () => { },
    setPendingTherapist: async () => { },
    clearPendingTherapist: () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isPro, setIsPro] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedTherapistId, setSelectedTherapistId] = useState<string | null>(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [pendingTherapist, setPendingTherapistState] = useState<PendingTherapist>(null);
    const [pendingTherapistLoaded, setPendingTherapistLoaded] = useState(false);

    // Use localStorage directly on web for SYNCHRONOUS writes.
    // AsyncStorage on web wraps localStorage in a Promise, which means the write
    // may not complete before signInWithOAuth redirects the browser away.
    const setPendingTherapist = async (therapist: PendingTherapist) => {
        if (therapist) {
            const withTimestamp = { ...therapist, timestamp: Date.now() };
            setPendingTherapistState(withTimestamp);
            if (Platform.OS === 'web' && typeof window !== 'undefined') {
                window.localStorage.setItem(PENDING_THERAPIST_KEY, JSON.stringify(withTimestamp));
            } else {
                await AsyncStorage.setItem(PENDING_THERAPIST_KEY, JSON.stringify(withTimestamp));
            }
        } else {
            setPendingTherapistState(null);
            if (Platform.OS === 'web' && typeof window !== 'undefined') {
                window.localStorage.removeItem(PENDING_THERAPIST_KEY);
            } else {
                await AsyncStorage.removeItem(PENDING_THERAPIST_KEY);
            }
        }
    };

    const clearPendingTherapist = () => {
        setPendingTherapistState(null);
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
            window.localStorage.removeItem(PENDING_THERAPIST_KEY);
        } else {
            AsyncStorage.removeItem(PENDING_THERAPIST_KEY);
        }
    };

    useEffect(() => {
        // On app load, check for pending therapist from before OAuth redirect.
        // Check sources in order of reliability:
        // 1. URL search params (most reliable — data travels with the redirect URL)
        // 2. localStorage (fallback — can fail if cross-origin redirect happens)
        const loadPendingTherapist = () => {
            // PRIMARY: Check URL search params (survives cross-origin OAuth redirects)
            if (Platform.OS === 'web' && typeof window !== 'undefined') {
                const urlParams = new URLSearchParams(window.location.search);
                const urlTherapist = urlParams.get('pendingTherapist');
                const urlMessage = urlParams.get('pendingMessage');
                if (urlTherapist) {
                    const data: PendingTherapist = {
                        name: urlTherapist,
                        pendingMessage: urlMessage || undefined,
                        timestamp: Date.now(),
                    };
                    setPendingTherapistState(data);
                    // Also save to localStorage so chat.tsx can access it
                    window.localStorage.setItem(PENDING_THERAPIST_KEY, JSON.stringify(data));
                    // Clean URL cosmetically (remove query params without page reload)
                    const cleanUrl = new URL(window.location.href);
                    cleanUrl.searchParams.delete('pendingTherapist');
                    cleanUrl.searchParams.delete('pendingMessage');
                    window.history.replaceState({}, '', cleanUrl.toString());
                    setPendingTherapistLoaded(true);
                    return;
                }
            }

            // FALLBACK: Check localStorage
            let value: string | null = null;
            if (Platform.OS === 'web' && typeof window !== 'undefined') {
                value = window.localStorage.getItem(PENDING_THERAPIST_KEY);
            }
            if (value) {
                const parsed = JSON.parse(value);
                const TEN_MINUTES = 10 * 60 * 1000;
                if (parsed.timestamp && (Date.now() - parsed.timestamp) < TEN_MINUTES) {
                    setPendingTherapistState(parsed);
                } else {
                    if (Platform.OS === 'web' && typeof window !== 'undefined') {
                        window.localStorage.removeItem(PENDING_THERAPIST_KEY);
                    } else {
                        AsyncStorage.removeItem(PENDING_THERAPIST_KEY);
                    }
                }
            }
            setPendingTherapistLoaded(true);
        };

        if (Platform.OS === 'web') {
            // Synchronous on web — no delay
            loadPendingTherapist();
        } else {
            // Async on native
            AsyncStorage.getItem(PENDING_THERAPIST_KEY).then((value) => {
                if (value) {
                    const parsed = JSON.parse(value);
                    const TEN_MINUTES = 10 * 60 * 1000;
                    if (parsed.timestamp && (Date.now() - parsed.timestamp) < TEN_MINUTES) {
                        setPendingTherapistState(parsed);
                    } else {
                        AsyncStorage.removeItem(PENDING_THERAPIST_KEY);
                    }
                }
                setPendingTherapistLoaded(true);
            });
        }

        // Load selected therapist ID
        if (Platform.OS === 'web') {
            const savedId = window.localStorage.getItem('selectedTherapistId');
            if (savedId) setSelectedTherapistId(savedId);
        } else {
            AsyncStorage.getItem('selectedTherapistId').then(id => {
                if (id) setSelectedTherapistId(id);
            });
        }

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsPro(false); // Default to false to ensure paywall shows
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                if (session) {
                    setIsPro(false);
                    setShowLoginModal(false);
                } else {
                    setIsPro(false);
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
        // Use therapistName if provided, otherwise fall back to existing pendingTherapist
        // (which was set by chat.tsx handleSend before opening the login modal)
        const nameToSave = therapistName || pendingTherapist?.name;
        const messageToSave = pendingTherapist?.pendingMessage || '';

        const baseUrl = Platform.OS === 'web' ? window.location.origin : 'ai-therapy://';
        let redirectTo = baseUrl;

        // Encode therapist info in the redirect URL (survives cross-origin redirects)
        if (Platform.OS === 'web' && nameToSave) {
            const url = new URL(baseUrl);
            url.searchParams.set('pendingTherapist', nameToSave);
            if (messageToSave) {
                url.searchParams.set('pendingMessage', messageToSave);
            }
            redirectTo = url.toString();
        }

        // Also write to localStorage as fallback
        if (nameToSave) {
            await setPendingTherapist({
                name: nameToSave,
                pendingMessage: messageToSave || undefined,
            });
        }

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
        // Use therapistName if provided, otherwise fall back to existing pendingTherapist
        const nameToSave = therapistName || pendingTherapist?.name;
        const messageToSave = pendingTherapist?.pendingMessage || '';

        const baseUrl = Platform.OS === 'web' ? window.location.origin : 'ai-therapy://';
        let redirectTo = baseUrl;

        // Encode therapist info in the redirect URL (survives cross-origin redirects)
        if (Platform.OS === 'web' && nameToSave) {
            const url = new URL(baseUrl);
            url.searchParams.set('pendingTherapist', nameToSave);
            if (messageToSave) {
                url.searchParams.set('pendingMessage', messageToSave);
            }
            redirectTo = url.toString();
        }

        // Also write to localStorage as fallback
        if (nameToSave) {
            await setPendingTherapist({
                name: nameToSave,
                pendingMessage: messageToSave || undefined,
            });
        }

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

    const selectTherapist = (id: string | null, force: boolean = false) => {
        // Allow setting if forced, if currently null, or if clearing (null)
        if (force || id === null || selectedTherapistId === null) {
            setSelectedTherapistId(id);
            if (id) {
                if (Platform.OS === 'web' && typeof window !== 'undefined') {
                    window.localStorage.setItem('selectedTherapistId', id);
                } else {
                    AsyncStorage.setItem('selectedTherapistId', id);
                }
            } else {
                if (Platform.OS === 'web' && typeof window !== 'undefined') {
                    window.localStorage.removeItem('selectedTherapistId');
                } else {
                    AsyncStorage.removeItem('selectedTherapistId');
                }
            }
        }
    };

    return (
        <AuthContext.Provider value={{
            isLoggedIn: !!session,
            isPro,
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
