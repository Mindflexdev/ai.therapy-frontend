import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Alert, Animated, Easing } from 'react-native';
import { BlurView } from 'expo-blur';
import { Theme } from '../../src/constants/Theme';
import { ChatBubble } from '../../src/components/ChatBubble';
import { Menu, Phone, Video, Plus, Camera, Mic, ChevronLeft, Square, ArrowUp } from 'lucide-react-native';
import { useNavigation, useLocalSearchParams } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useAuth } from '../../src/context/AuthContext';
import { supabase } from '../../src/lib/supabase';
import LoginScreen from './login';

const INITIAL_MESSAGES = [
    { id: '1', text: 'Hello, I am [Name]. How can I support you today?', isUser: false, time: '14:20' },
];

// Together AI configuration (no n8n needed)
const TOGETHER_API_URL = 'https://api.together.xyz/v1/chat/completions';
const TOGETHER_API_KEY = process.env.EXPO_PUBLIC_TOGETHER_API_KEY || '';
const DEFAULT_MODEL = 'MiniMaxAI/MiniMax-M2.5';

// Remove old n8n references - keeping for backward compatibility if needed
// const N8N_WEBHOOK_URL = 'https://webhook.ai.therapy.free/webhook/b4d0ede8-b771-4c33-aceb-83dcb44b0bf5';


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
                // Send to Together AI and get response
                sendMessageToAI(draftMessage);
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


    // Fetch character system prompt from Supabase
    const fetchCharacterPrompt = async (name: string): Promise<string> => {
        try {
            const { data, error } = await supabase
                .from('characters')
                .select('soul')
                .eq('name', name)
                .single();
            
            if (error || !data) {
                console.error('Error fetching character:', error);
                // Fallback prompts
                const fallbacks: Record<string, string> = {
                    Marcus: 'You are Marcus, a warm and grounded AI mental health companion with a CBT-influenced approach.',
                    Sarah: 'You are Sarah, an empathetic and gentle AI mental health companion with a trauma-informed approach.',
                    Liam: 'You are Liam, an analytical yet warm AI mental health companion with a behavioral approach.',
                    Emily: 'You are Emily, an AI mental health companion with existential and spiritual depth.',
                };
                return fallbacks[name] || fallbacks.Marcus;
            }
            return data.soul;
        } catch (err) {
            console.error('Error:', err);
            return 'You are a helpful AI mental health companion.';
        }
    };

    // Send message to Together AI directly (no n8n)
    const sendMessageToAI = async (message: string) => {
        if (!TOGETHER_API_KEY) {
            const errorMessage = {
                id: `error-${Date.now()}`,
                text: 'AI service not configured. Please check API key.',
                isUser: false,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages(prev => [...prev, errorMessage]);
            return;
        }

        try {
            setIsTyping(true);
            
            // Get character prompt
            const systemPrompt = await fetchCharacterPrompt(therapistName);
            
            // Build messages array
            const messages_for_ai = [
                { role: 'system' as const, content: systemPrompt },
                { role: 'user' as const, content: message },
            ];

            const response = await fetch(TOGETHER_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${TOGETHER_API_KEY}`,
                },
                body: JSON.stringify({
                    model: DEFAULT_MODEL,
                    messages: messages_for_ai,
                    temperature: 0.7,
                    max_tokens: 1024,
                    top_p: 0.9,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Together AI error: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            const text = data.choices?.[0]?.message?.content || 'I apologize, but I was unable to generate a response.';
            
            // Add AI response to messages
            const aiMessage = {
                id: `ai-${Date.now()}`,
                text: text.trim(),
                isUser: false,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            
            setMessages(prev => [...prev, aiMessage]);
        } catch (error: any) {
            console.error('Error sending message to AI:', error);
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
            
            // Send to Together AI and get response
            sendMessageToAI(messageText);
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
