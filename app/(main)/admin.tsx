import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../src/constants/Theme';
import { supabase } from '../../src/lib/supabase';
import { chatWithAgent } from '../../src/lib/together';
import { useAuth } from '../../src/context/AuthContext';

interface Character {
  id: string;
  name: string;
  display_name: string;
  gender?: string;
  soul: string;
  avatar_url?: string;
  accent_color?: string;
  is_system: boolean;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Initial greetings for each therapist
const DEFAULT_GREETINGS: Record<string, string> = {
  Marcus: "Hi, I'm Marcus!\n\nAlthough I'm not a therapist, I was developed by psychologists – as a companion for your mental health who understands you and adapts to your needs. Unlike ChatGPT, I use various psychological approaches to support you more specifically. The first session with me is currently free. This project lives from people like you. If it helps you, I would be happy about your support. Your trust is important to me: Everything you write here remains private & encrypted.\n\nWhat do you want support with?",
  Sarah: "Hi, I'm Sarah. I'm honored you're here. Whether you're carrying something heavy, feeling stuck, or just need someone to listen – this is a safe space.\n\nI was developed by psychologists to provide psychologically-informed support, and I'm here to walk alongside you. Everything you share is private and encrypted.\n\nWhat's on your mind?",
  Liam: "Hey, I'm Liam. I work with evidence-based approaches to help you build new patterns and habits that support your wellbeing.\n\nThink of me as a supportive partner in your corner – here to help you identify what's working, what isn't, and how to move forward. Everything here is private and encrypted.\n\nWhat would you like to work on today?",
  Emily: "Hello, I'm Emily. I believe that within each challenge lies an opportunity for deeper understanding – of ourselves, our values, and what truly matters to us.\n\nI'm here to help you explore beneath the surface, using mindfulness and an existential lens. Everything you share is held in confidence.\n\nWhat brings you here today?"
};

export default function AdminScreen() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [testMessage, setTestMessage] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('is_system', true)
      .order('created_at', { ascending: true });
    
    if (error) {
      Alert.alert('Error', 'Failed to load characters: ' + error.message);
    } else {
      setCharacters(data || []);
      if (data && data.length > 0 && !selectedCharacter) {
        setSelectedCharacter(data[0]);
      }
    }
    setLoading(false);
  };

  const updateCharacterField = (field: keyof Character, value: any) => {
    if (!selectedCharacter) return;
    setSelectedCharacter({ ...selectedCharacter, [field]: value });
  };

  const saveCharacter = async () => {
    if (!selectedCharacter || !user) {
      Alert.alert('Error', 'Must be logged in to save');
      return;
    }
    
    setIsSaving(true);
    const { error } = await supabase
      .from('characters')
      .update({
        soul: selectedCharacter.soul,
        display_name: selectedCharacter.display_name,
        is_enabled: selectedCharacter.is_enabled,
        accent_color: selectedCharacter.accent_color,
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedCharacter.id);
    
    if (error) {
      Alert.alert('Error', 'Failed to save: ' + error.message);
    } else {
      Alert.alert('Success', 'Character updated!');
      fetchCharacters();
    }
    setIsSaving(false);
  };

  const testCharacter = async () => {
    if (!selectedCharacter || !testMessage.trim()) return;
    
    setIsTesting(true);
    setTestResponse('');
    
    try {
      const { text } = await chatWithAgent(testMessage, {
        name: selectedCharacter.name,
        systemPrompt: selectedCharacter.soul,
      });
      setTestResponse(text);
    } catch (err: any) {
      setTestResponse('Error: ' + err.message);
    } finally {
      setIsTesting(false);
    }
  };

  const getGreeting = (characterName: string) => {
    return DEFAULT_GREETINGS[characterName] || DEFAULT_GREETINGS.Marcus;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text style={styles.loadingText}>Loading agents...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Agent Management</Text>
        <Text style={styles.subtitle}>Edit character prompts and test responses</Text>
        
        {/* Character Selector */}
        <View style={styles.section}>
          <Text style={styles.label}>Select Agent</Text>
          <View style={styles.characterList}>
            {characters.map(character => (
              <TouchableOpacity
                key={character.id}
                style={[
                  styles.characterButton,
                  selectedCharacter?.id === character.id && styles.characterButtonActive,
                  !character.is_enabled && styles.characterButtonDisabled
                ]}
                onPress={() => setSelectedCharacter(character)}
              >
                <Text style={[
                  styles.characterButtonText,
                  selectedCharacter?.id === character.id && styles.characterButtonTextActive
                ]}>{character.display_name}</Text>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: character.is_enabled ? Theme.colors.success : Theme.colors.danger }
                ]} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {selectedCharacter && (
          <>
            {/* Basic Info */}
            <View style={styles.section}>
              <Text style={styles.label}>Display Name</Text>
              <TextInput
                style={styles.textInput}
                value={selectedCharacter.display_name}
                onChangeText={(t) => updateCharacterField('display_name', t)}
                placeholder="Display name..."
                placeholderTextColor={Theme.colors.text.muted}
              />
            </View>

            {/* System Prompt (Soul) Editor */}
            <View style={styles.section}>
              <View style={styles.headerRow}>
                <Text style={styles.label}>System Prompt (Soul)</Text>
                <Switch
                  value={selectedCharacter.is_enabled}
                  onValueChange={(v) => updateCharacterField('is_enabled', v)}
                  trackColor={{ false: Theme.colors.border, true: Theme.colors.primary }}
                />
              </View>
              <Text style={styles.hint}>This defines how the AI responds to users</Text>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={16}
                value={selectedCharacter.soul}
                onChangeText={(t) => updateCharacterField('soul', t)}
                placeholder="System prompt..."
                placeholderTextColor={Theme.colors.text.muted}
                textAlignVertical="top"
              />
            </View>

            {/* Greeting Preview (Read-only) */}
            <View style={styles.section}>
              <Text style={styles.label}>Greeting Message (Read-only)</Text>
              <Text style={styles.hint}>This is shown in the chat - stored in frontend</Text>
              <View style={styles.greetingBox}>
                <Text style={styles.greetingText}>
                  {getGreeting(selectedCharacter.name)}
                </Text>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={saveCharacter}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color={Theme.colors.background} />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>

            {/* Test Section */}
            <View style={styles.testSection}>
              <Text style={styles.testTitle}>Test Agent</Text>
              <Text style={styles.hint}>Send a test message to see how {selectedCharacter.display_name} responds</Text>
              <TextInput
                style={styles.testInput}
                value={testMessage}
                onChangeText={setTestMessage}
                placeholder="Type a test message..."
                placeholderTextColor={Theme.colors.text.muted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <TouchableOpacity 
                style={styles.testButton}
                onPress={testCharacter}
                disabled={isTesting || !testMessage.trim()}
              >
                {isTesting ? (
                  <ActivityIndicator color={Theme.colors.background} />
                ) : (
                  <Text style={styles.testButtonText}>Send Test →</Text>
                )}
              </TouchableOpacity>
              
              {testResponse && (
                <View style={styles.responseBox}>
                  <Text style={styles.responseTitle}>{selectedCharacter.display_name} responds:</Text>
                  <Text style={styles.responseText}>{testResponse}</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Theme.colors.text.secondary,
    marginTop: Theme.spacing.m,
  },
  scrollView: {
    flex: 1,
    padding: Theme.spacing.m,
  },
  title: {
    fontSize: 28,
    fontFamily: Theme.fonts.serif,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Theme.fonts.sans,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.l,
  },
  section: {
    marginBottom: Theme.spacing.l,
  },
  label: {
    fontSize: 14,
    fontFamily: Theme.fonts.sansBold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.s,
  },
  hint: {
    fontSize: 12,
    fontFamily: Theme.fonts.sans,
    color: Theme.colors.text.muted,
    marginBottom: Theme.spacing.s,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  characterList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.s,
  },
  characterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.s,
    borderRadius: Theme.borderRadius.m,
    gap: Theme.spacing.s,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  characterButtonActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.secondary,
  },
  characterButtonDisabled: {
    opacity: 0.5,
  },
  characterButtonText: {
    color: Theme.colors.text.primary,
    fontFamily: Theme.fonts.sans,
  },
  characterButtonTextActive: {
    color: Theme.colors.background,
    fontFamily: Theme.fonts.sansBold,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  textArea: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: Theme.borderRadius.m,
    padding: Theme.spacing.m,
    color: Theme.colors.text.primary,
    fontFamily: Theme.fonts.sans,
    fontSize: 14,
    minHeight: 250,
    textAlignVertical: 'top',
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: Theme.borderRadius.m,
    padding: Theme.spacing.m,
    color: Theme.colors.text.primary,
    fontFamily: Theme.fonts.sans,
    fontSize: 14,
    height: 50,
  },
  greetingBox: {
    backgroundColor: Theme.colors.bubbles.therapist,
    borderRadius: Theme.borderRadius.l,
    borderBottomLeftRadius: 4,
    padding: Theme.spacing.m,
  },
  greetingText: {
    color: Theme.colors.text.primary,
    fontFamily: Theme.fonts.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: Theme.colors.primary,
    padding: Theme.spacing.m,
    borderRadius: Theme.borderRadius.m,
    alignItems: 'center',
    marginBottom: Theme.spacing.l,
  },
  saveButtonText: {
    color: Theme.colors.background,
    fontFamily: Theme.fonts.sansBold,
    fontSize: 16,
  },
  testSection: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: Theme.spacing.m,
    borderRadius: Theme.borderRadius.m,
    marginBottom: Theme.spacing.xl,
  },
  testTitle: {
    fontSize: 18,
    fontFamily: Theme.fonts.serif,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  testInput: {
    backgroundColor: Theme.colors.bubbles.user,
    borderRadius: Theme.borderRadius.l,
    borderBottomRightRadius: 4,
    padding: Theme.spacing.m,
    color: Theme.colors.text.primary,
    fontFamily: Theme.fonts.sans,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginTop: Theme.spacing.s,
  },
  testButton: {
    backgroundColor: Theme.colors.success,
    padding: Theme.spacing.m,
    borderRadius: Theme.borderRadius.m,
    alignItems: 'center',
    marginTop: Theme.spacing.m,
  },
  testButtonText: {
    color: Theme.colors.background,
    fontFamily: Theme.fonts.sansBold,
    fontSize: 16,
  },
  responseBox: {
    backgroundColor: Theme.colors.bubbles.therapist,
    borderRadius: Theme.borderRadius.l,
    borderBottomLeftRadius: 4,
    padding: Theme.spacing.m,
    marginTop: Theme.spacing.m,
  },
  responseTitle: {
    color: Theme.colors.text.secondary,
    fontSize: 12,
    fontFamily: Theme.fonts.sansBold,
    marginBottom: Theme.spacing.s,
  },
  responseText: {
    color: Theme.colors.text.primary,
    fontFamily: Theme.fonts.sans,
    fontSize: 14,
    lineHeight: 22,
  },
});
