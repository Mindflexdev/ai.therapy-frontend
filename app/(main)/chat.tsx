import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Alert, Animated, Easing } from 'react-native';
import { BlurView } from 'expo-blur';
import { Theme } from '../../src/constants/Theme';
import { ChatBubble } from '../../src/components/ChatBubble';
import { Menu, Phone, Video, Plus, Camera, Mic, ChevronLeft, Square, ArrowUp } from 'lucide-react-native';
import { useNavigation, useLocalSearchParams } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useAuth } from '../../src/context/AuthContext';
import LoginScreen from './login';
import Constants from 'expo-constants';

const INITIAL_MESSAGES = [
    { id: '1', text: 'Hello, I am [Name]. How can I support you today?', isUser: false, time: '14:20' },
];

// n8n webhook configuration from env vars
// Set in .env: N8N_WEBHOOK_URL, N8N_WEBHOOK_USER, N8N_WEBHOOK_PASS
const extraConfig = Constants.expoConfig?.extra || {};
const N8N_WEBHOOK_URL = extraConfig.N8N_WEBHOOK_URL || 'https://admin.ai.therapy.free/n8n/webhook/b4d0ede8-b771-4c33-aceb-83dcb44b0bf5';
const N8N_WEBHOOK_USER = extraConfig.N8N_WEBHOOK_USER || 'moritz';
const N8N_WEBHOOK_PASS = extraConfig.N8N_WEBHOOK_PASS || '123';


import { THERAPIST_IMAGES, THERAPISTS } from '../../src/constants/Therapists';

export default function ChatScreen() {
    const { name } = useLocalSearchParams();
    const therapistName = (name as string) || 'Marcus';
    const therapistImage = THERAPIST_IMAGES[therapistName];

    const [messages, setMessages] = useState<any[]>([]);
    const [isTyping, setIsTyping] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [inputText, setInputText] = useState('');
    const navigation = useNavigation<DrawerNavigationProp<any>>();
    const { showLoginModal, setShowLoginModal, isLoggedIn, user, setPendingTherapist, pendingTherapist, clearPendingTherapist, selectedTherapistId, selectTherapist } = useAuth();

    // Restore draft message from pendingTherapist (saved before OAuth redirect)
    // Only auto-send if the user is actually logged in
    // IMPORTANT: Do NOT clear pendingTherapist when not logged in — the user may be
    // about to log in via OAuth, and we need the data to survive the redirect!
    const hasSentDraft = useRef(false);
    useEffect(() => {
        if (isLoggedIn && pendingTherapist?.pendingMessage && !hasSentDraft.current) {
            hasSentDraft.current = true;
            const draftMessage = pendingTherapist.pendingMessage;
            clearPendingTherapist();
            // Wait for the initial therapist greeting to load, then send the draft
            const timer = setTimeout(() => {
                const userMessage = {
                    id: `draft-${Date.now()}`,
                    text: draftMessage,
                    isUser: true,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };
                setMessages(prev => [...prev, userMessage]);
                // Send to n8n and get AI response
                sendMessageToN8N(draftMessage);
            }, 1800); // Slightly after the 1500ms greeting delay
            return () => clearTimeout(timer);
        }
    }, [isLoggedIn]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsTyping(false);
            setMessages([{
                id: '1',
                text: `Hi, I'm ${therapistName}! \n\nAlthough I'm not a therapist, I was developed by psychologists – as a companion for your mental health who understands you and adapts to your needs. Unlike ChatGPT, I use various psychological approaches to support you more specifically. The first session with me is currently free. This project lives from people like you. If it helps you, I would be happy about your support. Your trust is important to me: Everything you write here remains private & encrypted.\n\nWhat do you want support with?`,
                isUser: false,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }, 2500); // Increased delay by 1s as requested
        return () => clearTimeout(timer);
    }, []);


    // Send message to n8n webhook and get AI response
    const sendMessageToN8N = async (message: string) => {
        try {
            setIsTyping(true);
            
            // Build headers with optional Basic Auth
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            
            if (N8N_WEBHOOK_USER && N8N_WEBHOOK_PASS) {
                const authString = btoa(`${N8N_WEBHOOK_USER}:${N8N_WEBHOOK_PASS}`);
                headers['Authorization'] = `Basic ${authString}`;
            }
            
            const response = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    message: message,
                    characterId: therapistName,  // Use characterId from your workflow
                    sessionId: user?.id || 'anonymous',
                    user: user ? { id: user.id, email: user.email } : null,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Add AI response to messages
            const aiMessage = {
                id: data.id || `ai-${Date.now()}`,
                text: data.text || data.response || 'I apologize, but I was unable to respond.',
                isUser: false,
                time: data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error sending message to n8n:', error);
            // Add a fallback error message
            const errorMessage = {
                id: `error-${Date.now()}`,
                text: 'I apologize, but I am having trouble connecting right now. Please try again in a moment.',
                isUser: false,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSend = () => {
        if (inputText.trim()) {
            // Check if user is logged in before sending
            if (!isLoggedIn) {
                setPendingTherapist({ name: therapistName, pendingMessage: inputText.trim() });
                setShowLoginModal(true);
                return;
            }

            const userMessage = {
                id: Date.now().toString(),
                text: inputText,
                isUser: true,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            
            const messageText = inputText.trim();
            setMessages(prev => [...prev, userMessage]);
            setInputText('');
            
            // Send to n8n and get AI response
            sendMessageToN8N(messageText);
        }
    };

    const showComingSoon = () => {
        Alert.alert('Coming Soon', 'This feature is currently under development.');
    };

    const TypingBubble = () => (
        <View style={{
            alignSelf: 'flex-start',
            backgroundColor: Theme.colors.bubbles.therapist,
            borderRadius: Theme.borderRadius.l,
            borderBottomLeftRadius: 4,
            padding: Theme.spacing.m,
            marginLeft: Theme.spacing.m,
            marginBottom: Theme.spacing.m,
            marginTop: Theme.spacing.m,
        }}>
            <Text style={{ color: Theme.colors.text.secondary, fontSize: 12 }}>typing...</Text>
        </View>
    );

    const VoiceWaveform = () => {
        const bars = useRef([...Array(25)].map(() => new Animated.Value(2))).current;

        useEffect(() => {
            const animations = bars.map((bar, i) => {
                return Animated.loop(
                    Animated.sequence([
                        Animated.timing(bar, {
                            toValue: Math.random() * 20 + 5,
                            duration: 200 + Math.random() * 300,
                            useNativeDriver: false,
                            easing: Easing.bezier(0.4, 0, 0.2, 1)
                        }),
                        Animated.timing(bar, {
                            toValue: 2,
                            duration: 200 + Math.random() * 300,
                            useNativeDriver: false,
                            easing: Easing.bezier(0.4, 0, 0.2, 1)
                        })
                    ])
                );
            });

            if (isRecording) {
                Animated.parallel(animations).start();
            } else {
                animations.forEach(a => a.stop());
            }

            return () => animations.forEach(a => a.stop());
        }, [isRecording]);

        return (
            <View style={styles.waveformContainer}>
                {bars.map((bar, i) => (
                    <Animated.View
                        key={i}
                        style={[
                            styles.waveformBar,
                            { height: bar }
                        ]}
                    />
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.iconButton}>
                        <Menu size={24} color={Theme.colors.text.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.profileInfo} onPress={() => navigation.navigate('profile', { name: therapistName, image: therapistImage })}>
                        <View style={styles.avatarWrapper}>
                            <Image
                                source={therapistImage}
                                style={styles.avatar}
                                defaultSource={require('../../assets/adaptive-icon.png')}
                            />
                        </View>
                        <View>
                            <Text style={styles.name}>{therapistName}</Text>
                            <Text style={styles.status}>online</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.headerRight}>
                        <TouchableOpacity onPress={() => navigation.navigate('call', { name: therapistName, image: therapistImage })} style={styles.iconButton}>
                            <Phone size={22} color={Theme.colors.text.primary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Chat Area */}
                <View style={styles.chatArea}>
                    <FlatList
                        data={messages}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => <ChatBubble message={item} />}
                        contentContainerStyle={styles.messageList}
                        ListFooterComponent={isTyping ? <TypingBubble /> : null}
                    />
                </View>

                {/* Input Bar */}
                <View style={styles.inputBar}>
                    {isRecording ? (
                        <View style={styles.recordingRow}>
                            <TouchableOpacity onPress={() => setIsRecording(false)} style={styles.stopButton}>
                                <Square size={16} color={Theme.colors.text.primary} fill={Theme.colors.text.primary} />
                            </TouchableOpacity>

                            <View style={styles.recordingWaveformWrapper}>
                                <VoiceWaveform />
                            </View>

                            <TouchableOpacity
                                onPress={() => {
                                    setIsRecording(false);
                                    // Simulated transcription
                                    setInputText("Transcribed voice message...");
                                }}
                                style={styles.recordingSendButton}
                            >
                                <ArrowUp size={20} color={Theme.colors.background} strokeWidth={3} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <TouchableOpacity onPress={showComingSoon} style={styles.inputExtrasButton}>
                                <Plus size={24} color={Theme.colors.text.primary} />
                            </TouchableOpacity>

                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Message..."
                                    placeholderTextColor={Theme.colors.text.muted}
                                    value={inputText}
                                    onChangeText={setInputText}
                                    multiline
                                />
                            </View>

                            <View style={styles.rightIconsContainer}>
                                {!inputText.trim() && (
                                    <TouchableOpacity onPress={showComingSoon} style={styles.inputExtrasButton}>
                                        <Camera size={24} color={Theme.colors.text.primary} />
                                    </TouchableOpacity>
                                )}

                                <TouchableOpacity
                                    onPress={inputText.trim() ? handleSend : () => setIsRecording(true)}
                                    style={[styles.micButton, inputText.trim() && styles.recordingSendButton]}
                                >
                                    {inputText.trim() ? (
                                        <ArrowUp size={20} color={Theme.colors.background} strokeWidth={3} />
                                    ) : (
                                        <Mic size={24} color={Theme.colors.text.primary} />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </KeyboardAvoidingView>

            {/* Login Modal */}
            {showLoginModal && <LoginScreen />}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Theme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.border,
    },
    iconButton: {
        padding: Theme.spacing.s,
    },
    profileInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: Theme.spacing.s,
    },
    avatarWrapper: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#333',
        marginRight: Theme.spacing.m,
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    name: {
        color: Theme.colors.text.primary,
        fontFamily: 'Inter-Bold',
        fontSize: 16,
    },
    status: {
        color: Theme.colors.success,
        fontSize: 12,
    },
    headerRight: {
        flexDirection: 'row',
    },
    chatArea: {
        flex: 1,
    },
    messageList: {
        paddingVertical: Theme.spacing.m,
    },
    inputBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Theme.spacing.s,
        paddingHorizontal: Theme.spacing.m,
        backgroundColor: Theme.colors.background,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    inputExtrasButton: {
        padding: Theme.spacing.xs,
    },
    rightIconsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 0,
    },
    recordingRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: Theme.spacing.m,
    },
    stopButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordingWaveformWrapper: {
        flex: 1,
        height: 44,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 22,
        justifyContent: 'center',
        paddingHorizontal: Theme.spacing.l,
    },
    recordingSendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    waveformContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 3,
    },
    waveformBar: {
        width: 3,
        backgroundColor: Theme.colors.primary,
        borderRadius: 2,
    },
    inputContainer: {
        flex: 1,
        marginHorizontal: Theme.spacing.s,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 22,
        paddingHorizontal: Theme.spacing.m,
        paddingVertical: 6,
        minHeight: 40,
        maxHeight: 100,
        justifyContent: 'center',
    },
    input: {
        color: Theme.colors.text.primary,
        fontSize: 16,
        fontFamily: 'Inter-Regular',
        maxHeight: 80,
        padding: 0,
        margin: 0,
    },
    micButton: {
        padding: Theme.spacing.s,
        minWidth: 40,
        alignItems: 'center',
    },
    sendText: {
        color: Theme.colors.primary,
        fontFamily: 'Inter-Bold',
        fontSize: 16,
    }
});
