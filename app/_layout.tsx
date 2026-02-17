import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { Outfit_400Regular, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Theme } from '../src/constants/Theme';

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded, error] = useFonts({
        'Playfair-Bold': PlayfairDisplay_700Bold,
        'Inter-Regular': Inter_400Regular,
        'Inter-Bold': Inter_700Bold,
        'Outfit-Regular': Outfit_400Regular,
        'Outfit-Bold': Outfit_700Bold,
    });

    useEffect(() => {
        if (error) throw error;
    }, [error]);

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return <RootLayoutNav />;
}

import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { SubscriptionProvider } from '../src/context/SubscriptionContext';
import { useRouter } from 'expo-router';

// Handles redirect after OAuth login (Google OAuth does a full-page redirect,
// so we persist the selected therapist and navigate to chat once session is detected)
function OAuthRedirectHandler() {
    const { isLoggedIn, loading, pendingTherapist, pendingTherapistLoaded } = useAuth();
    const router = useRouter();
    const hasRedirected = useRef(false);

    useEffect(() => {
        // Wait for BOTH auth session AND pendingTherapist to be loaded
        // before making any redirect decision.
        if (!loading && pendingTherapistLoaded && isLoggedIn && !hasRedirected.current) {
            hasRedirected.current = true;
            router.replace({
                pathname: '/(main)/paywall',
                params: pendingTherapist?.name ? { name: pendingTherapist.name } : {}
            });
        }
    }, [isLoggedIn, loading, pendingTherapist, pendingTherapistLoaded]);

    return null;
}

function RootLayoutNav() {
    return (
        <AuthProvider>
            <SubscriptionProvider>
                <ThemeProvider value={DarkTheme}>
                    {Platform.OS === 'web' && (
                        <Head>
                            <link rel="apple-touch-icon" sizes="180x180" href="/assets/favicons/apple-touch-icon.png" />
                            <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicons/favicon-32x32.png" />
                            <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicons/favicon-16x16.png" />
                            <link rel="manifest" href="/assets/favicons/site.webmanifest" />
                            <meta name="apple-mobile-web-app-capable" content="yes" />
                            <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                            <meta name="apple-mobile-web-app-title" content="ai.therapy" />
                        </Head>
                    )}
                    <OAuthRedirectHandler />
                    <Stack
                        screenOptions={{
                            headerShown: false,
                            contentStyle: { backgroundColor: Theme.colors.background },
                        }}
                    >
                        <Stack.Screen name="index" options={{ headerShown: false }} />
                        <Stack.Screen name="(main)" options={{ presentation: 'transparentModal', headerShown: false }} />
                    </Stack>
                    <StatusBar style="light" />
                </ThemeProvider>
            </SubscriptionProvider>
        </AuthProvider>
    );
}
