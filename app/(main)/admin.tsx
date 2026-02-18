import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Switch,
  StyleSheet, Alert, ActivityIndicator, Modal, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../src/constants/Theme';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/context/AuthContext';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AgentConfig {
  main_prompt: string;
  shared_memory: string;
  updated_at: string;
}

interface Character {
  id: string;
  name: string;
  display_name: string;
  soul: string;
  is_enabled: boolean;
  [key: string]: any;
}

interface Skill {
  id: string;
  name: string;
  description: string;
  prompt_text: string;
  enabled: boolean;
  sort_order: number;
  updated_at: string;
}

type TabKey = 'prompt' | 'characters' | 'skills' | 'memory';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'prompt', label: 'Main Prompt' },
  { key: 'characters', label: 'Characters' },
  { key: 'skills', label: 'Skills' },
  { key: 'memory', label: 'Shared Memory' },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminScreen() {
  const { user } = useAuth();
  const isAdmin = user?.app_metadata?.role === 'admin';

  const [activeTab, setActiveTab] = useState<TabKey>('prompt');
  const [loading, setLoading] = useState(true);

  // Agent config
  const [config, setConfig] = useState<AgentConfig>({ main_prompt: '', shared_memory: '', updated_at: '' });
  const [savingConfig, setSavingConfig] = useState(false);

  // Characters
  const [characters, setCharacters] = useState<Character[]>([]);
  const [editingChar, setEditingChar] = useState<Character | null>(null);
  const [charModalVisible, setCharModalVisible] = useState(false);
  const [savingChar, setSavingChar] = useState(false);

  // Skills
  const [skills, setSkills] = useState<Skill[]>([]);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [skillModalVisible, setSkillModalVisible] = useState(false);
  const [savingSkill, setSavingSkill] = useState(false);

  // ─── Data fetching ──────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchConfig(), fetchCharacters(), fetchSkills()]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin) fetchAll();
    else setLoading(false);
  }, [isAdmin]);

  const fetchConfig = async () => {
    const { data } = await supabase.from('agent_config').select('*').eq('id', 1).single();
    if (data) setConfig(data);
  };

  const fetchCharacters = async () => {
    const { data } = await supabase.from('characters').select('*').order('created_at', { ascending: true });
    if (data) setCharacters(data);
  };

  const fetchSkills = async () => {
    const { data } = await supabase.from('therapeutic_skills').select('*').order('sort_order', { ascending: true });
    if (data) setSkills(data);
  };

  // ─── Config saves ──────────────────────────────────────────────────────────

  const saveMainPrompt = async () => {
    setSavingConfig(true);
    const { error } = await supabase.from('agent_config').update({
      main_prompt: config.main_prompt, updated_at: new Date().toISOString(),
    }).eq('id', 1);
    if (error) Alert.alert('Error', error.message);
    else { Alert.alert('Saved', 'Main prompt updated'); fetchConfig(); }
    setSavingConfig(false);
  };

  const saveSharedMemory = async () => {
    setSavingConfig(true);
    const { error } = await supabase.from('agent_config').update({
      shared_memory: config.shared_memory, updated_at: new Date().toISOString(),
    }).eq('id', 1);
    if (error) Alert.alert('Error', error.message);
    else { Alert.alert('Saved', 'Shared memory updated'); fetchConfig(); }
    setSavingConfig(false);
  };

  // ─── Character CRUD ─────────────────────────────────────────────────────────

  const openCharEditor = (char?: Character) => {
    setEditingChar(char || { id: '', name: '', display_name: '', soul: '', is_enabled: true });
    setCharModalVisible(true);
  };

  const saveCharacter = async () => {
    if (!editingChar) return;
    setSavingChar(true);
    const payload = {
      name: editingChar.name, display_name: editingChar.display_name,
      soul: editingChar.soul, is_enabled: editingChar.is_enabled,
      updated_at: new Date().toISOString(),
    };
    let error;
    if (editingChar.id) {
      ({ error } = await supabase.from('characters').update(payload).eq('id', editingChar.id));
    } else {
      ({ error } = await supabase.from('characters').insert({ ...payload, is_system: true }));
    }
    if (error) Alert.alert('Error', error.message);
    else { setCharModalVisible(false); fetchCharacters(); }
    setSavingChar(false);
  };

  const deleteCharacter = (char: Character) => {
    Alert.alert('Delete Character', `Delete "${char.display_name || char.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await supabase.from('characters').delete().eq('id', char.id);
        fetchCharacters();
      }},
    ]);
  };

  // ─── Skills CRUD ────────────────────────────────────────────────────────────

  const openSkillEditor = (skill?: Skill) => {
    setEditingSkill(skill || { id: '', name: '', description: '', prompt_text: '', enabled: true, sort_order: skills.length, updated_at: '' });
    setSkillModalVisible(true);
  };

  const saveSkill = async () => {
    if (!editingSkill) return;
    setSavingSkill(true);
    const payload = {
      name: editingSkill.name, description: editingSkill.description,
      prompt_text: editingSkill.prompt_text, enabled: editingSkill.enabled,
      sort_order: editingSkill.sort_order, updated_at: new Date().toISOString(),
    };
    let error;
    if (editingSkill.id) {
      ({ error } = await supabase.from('therapeutic_skills').update(payload).eq('id', editingSkill.id));
    } else {
      ({ error } = await supabase.from('therapeutic_skills').insert(payload));
    }
    if (error) Alert.alert('Error', error.message);
    else { setSkillModalVisible(false); fetchSkills(); }
    setSavingSkill(false);
  };

  const deleteSkill = (skill: Skill) => {
    Alert.alert('Delete Skill', `Delete "${skill.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await supabase.from('therapeutic_skills').delete().eq('id', skill.id);
        fetchSkills();
      }},
    ]);
  };

  const toggleSkill = async (skill: Skill) => {
    await supabase.from('therapeutic_skills').update({
      enabled: !skill.enabled, updated_at: new Date().toISOString(),
    }).eq('id', skill.id);
    fetchSkills();
  };

  // ─── Guards ─────────────────────────────────────────────────────────────────

  if (!isAdmin) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.centered}>
          <Text style={s.title}>Access Denied</Text>
          <Text style={s.muted}>You do not have admin privileges.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.centered}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text style={s.muted}>Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Tab content renderers ──────────────────────────────────────────────────

  const renderPromptTab = () => (
    <View style={s.tabContent}>
      <Text style={s.label}>Main System Prompt</Text>
      <Text style={s.hint}>This is the shared base prompt for all characters</Text>
      <TextInput
        style={s.textArea}
        multiline
        value={config.main_prompt}
        onChangeText={(t) => setConfig({ ...config, main_prompt: t })}
        placeholder="Enter the main system prompt…"
        placeholderTextColor={Theme.colors.text.muted}
        textAlignVertical="top"
      />
      {config.updated_at ? (
        <Text style={s.timestamp}>Last updated: {new Date(config.updated_at).toLocaleString()}</Text>
      ) : null}
      <TouchableOpacity style={s.primaryBtn} onPress={saveMainPrompt} disabled={savingConfig}>
        {savingConfig ? <ActivityIndicator color={Theme.colors.background} /> : <Text style={s.primaryBtnText}>Save Main Prompt</Text>}
      </TouchableOpacity>
    </View>
  );

  const renderCharactersTab = () => (
    <View style={s.tabContent}>
      {characters.map((char) => (
        <TouchableOpacity key={char.id} style={s.card} onPress={() => openCharEditor(char)}>
          <View style={s.cardHeader}>
            <Text style={s.cardTitle}>{char.display_name || char.name}</Text>
            <View style={s.cardActions}>
              <View style={[s.dot, { backgroundColor: char.is_enabled ? Theme.colors.success : Theme.colors.danger }]} />
              <TouchableOpacity onPress={() => deleteCharacter(char)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={s.deleteText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={s.cardSub} numberOfLines={2}>{char.soul || 'No soul defined'}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={s.addBtn} onPress={() => openCharEditor()}>
        <Text style={s.addBtnText}>+ Add Character</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSkillsTab = () => (
    <View style={s.tabContent}>
      {skills.map((skill) => (
        <View key={skill.id} style={s.card}>
          <TouchableOpacity onPress={() => openSkillEditor(skill)} style={{ flex: 1 }}>
            <View style={s.cardHeader}>
              <Text style={s.cardTitle}>{skill.name}</Text>
              <View style={s.cardActions}>
                <Text style={s.sortBadge}>#{skill.sort_order}</Text>
                <TouchableOpacity onPress={() => deleteSkill(skill)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={s.deleteText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={s.cardSub} numberOfLines={2}>{skill.description || 'No description'}</Text>
          </TouchableOpacity>
          <View style={s.skillToggleRow}>
            <Text style={s.hint}>{skill.enabled ? 'Enabled' : 'Disabled'}</Text>
            <Switch
              value={skill.enabled}
              onValueChange={() => toggleSkill(skill)}
              trackColor={{ false: Theme.colors.border, true: Theme.colors.primary }}
            />
          </View>
        </View>
      ))}
      <TouchableOpacity style={s.addBtn} onPress={() => openSkillEditor()}>
        <Text style={s.addBtnText}>+ Add Skill</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMemoryTab = () => (
    <View style={s.tabContent}>
      <Text style={s.label}>Shared Memory</Text>
      <Text style={s.hint}>Persistent context shared across all characters</Text>
      <TextInput
        style={s.textArea}
        multiline
        value={config.shared_memory}
        onChangeText={(t) => setConfig({ ...config, shared_memory: t })}
        placeholder="Enter shared memory / context…"
        placeholderTextColor={Theme.colors.text.muted}
        textAlignVertical="top"
      />
      {config.updated_at ? (
        <Text style={s.timestamp}>Last updated: {new Date(config.updated_at).toLocaleString()}</Text>
      ) : null}
      <TouchableOpacity style={s.primaryBtn} onPress={saveSharedMemory} disabled={savingConfig}>
        {savingConfig ? <ActivityIndicator color={Theme.colors.background} /> : <Text style={s.primaryBtnText}>Save Shared Memory</Text>}
      </TouchableOpacity>
    </View>
  );

  const TAB_RENDERERS: Record<TabKey, () => React.JSX.Element> = {
    prompt: renderPromptTab,
    characters: renderCharactersTab,
    skills: renderSkillsTab,
    memory: renderMemoryTab,
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={s.container}>
      <ScrollView style={s.scroll} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>Admin Dashboard</Text>
        <Text style={s.subtitle}>Manage prompts, characters, skills & shared memory</Text>

        {/* Tab bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabBar} contentContainerStyle={s.tabBarContent}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[s.tab, activeTab === tab.key && s.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[s.tabText, activeTab === tab.key && s.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {TAB_RENDERERS[activeTab]()}
      </ScrollView>

      {/* ─── Character Modal ─────────────────────────────────────────────── */}
      <Modal visible={charModalVisible} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={s.modalTitle}>{editingChar?.id ? 'Edit Character' : 'New Character'}</Text>

              <Text style={s.label}>Name (internal)</Text>
              <TextInput style={s.input} value={editingChar?.name || ''} onChangeText={(t) => setEditingChar(e => e && ({ ...e, name: t }))} placeholderTextColor={Theme.colors.text.muted} placeholder="e.g. Marcus" />

              <Text style={s.label}>Display Name</Text>
              <TextInput style={s.input} value={editingChar?.display_name || ''} onChangeText={(t) => setEditingChar(e => e && ({ ...e, display_name: t }))} placeholderTextColor={Theme.colors.text.muted} placeholder="e.g. Dr. Marcus" />

              <View style={s.switchRow}>
                <Text style={s.label}>Enabled</Text>
                <Switch value={editingChar?.is_enabled ?? true} onValueChange={(v) => setEditingChar(e => e && ({ ...e, is_enabled: v }))} trackColor={{ false: Theme.colors.border, true: Theme.colors.primary }} />
              </View>

              <Text style={s.label}>Soul (personality prompt)</Text>
              <TextInput style={s.modalTextArea} multiline value={editingChar?.soul || ''} onChangeText={(t) => setEditingChar(e => e && ({ ...e, soul: t }))} placeholderTextColor={Theme.colors.text.muted} placeholder="Define this character's personality and approach…" textAlignVertical="top" />

              <View style={s.modalBtnRow}>
                <TouchableOpacity style={s.cancelBtn} onPress={() => setCharModalVisible(false)}>
                  <Text style={s.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.primaryBtn} onPress={saveCharacter} disabled={savingChar}>
                  {savingChar ? <ActivityIndicator color={Theme.colors.background} /> : <Text style={s.primaryBtnText}>Save</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─── Skill Modal ─────────────────────────────────────────────────── */}
      <Modal visible={skillModalVisible} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={s.modalTitle}>{editingSkill?.id ? 'Edit Skill' : 'New Skill'}</Text>

              <Text style={s.label}>Name</Text>
              <TextInput style={s.input} value={editingSkill?.name || ''} onChangeText={(t) => setEditingSkill(e => e && ({ ...e, name: t }))} placeholderTextColor={Theme.colors.text.muted} placeholder="e.g. CBT Techniques" />

              <Text style={s.label}>Description</Text>
              <TextInput style={s.input} value={editingSkill?.description || ''} onChangeText={(t) => setEditingSkill(e => e && ({ ...e, description: t }))} placeholderTextColor={Theme.colors.text.muted} placeholder="Brief description…" />

              <Text style={s.label}>Sort Order</Text>
              <TextInput style={s.input} value={String(editingSkill?.sort_order ?? 0)} onChangeText={(t) => setEditingSkill(e => e && ({ ...e, sort_order: parseInt(t) || 0 }))} placeholderTextColor={Theme.colors.text.muted} keyboardType="numeric" />

              <View style={s.switchRow}>
                <Text style={s.label}>Enabled</Text>
                <Switch value={editingSkill?.enabled ?? true} onValueChange={(v) => setEditingSkill(e => e && ({ ...e, enabled: v }))} trackColor={{ false: Theme.colors.border, true: Theme.colors.primary }} />
              </View>

              <Text style={s.label}>Prompt Text</Text>
              <TextInput style={s.modalTextArea} multiline value={editingSkill?.prompt_text || ''} onChangeText={(t) => setEditingSkill(e => e && ({ ...e, prompt_text: t }))} placeholderTextColor={Theme.colors.text.muted} placeholder="Full therapeutic prompt module text…" textAlignVertical="top" />

              <View style={s.modalBtnRow}>
                <TouchableOpacity style={s.cancelBtn} onPress={() => setSkillModalVisible(false)}>
                  <Text style={s.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.primaryBtn} onPress={saveSkill} disabled={savingSkill}>
                  {savingSkill ? <ActivityIndicator color={Theme.colors.background} /> : <Text style={s.primaryBtnText}>Save</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1, padding: Theme.spacing.m },
  title: { fontSize: 28, fontFamily: Theme.fonts.serif, color: Theme.colors.text.primary, marginBottom: Theme.spacing.xs },
  subtitle: { fontSize: 14, fontFamily: Theme.fonts.sans, color: Theme.colors.text.secondary, marginBottom: Theme.spacing.l },
  muted: { color: Theme.colors.text.secondary, marginTop: Theme.spacing.m, fontFamily: Theme.fonts.sans },

  // Tabs
  tabBar: { marginBottom: Theme.spacing.l, flexGrow: 0 },
  tabBarContent: { gap: Theme.spacing.s },
  tab: {
    paddingHorizontal: Theme.spacing.m, paddingVertical: Theme.spacing.s,
    borderRadius: Theme.borderRadius.m, backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'transparent',
  },
  tabActive: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.secondary },
  tabText: { fontFamily: Theme.fonts.sans, color: Theme.colors.text.secondary, fontSize: 14 },
  tabTextActive: { fontFamily: Theme.fonts.sansBold, color: Theme.colors.background },

  tabContent: { marginBottom: Theme.spacing.xxl },

  // Form elements
  label: { fontSize: 14, fontFamily: Theme.fonts.sansBold, color: Theme.colors.text.primary, marginBottom: Theme.spacing.xs, marginTop: Theme.spacing.m },
  hint: { fontSize: 12, fontFamily: Theme.fonts.sans, color: Theme.colors.text.muted, marginBottom: Theme.spacing.s },
  timestamp: { fontSize: 12, fontFamily: Theme.fonts.sans, color: Theme.colors.text.muted, marginTop: Theme.spacing.s, marginBottom: Theme.spacing.s },
  textArea: {
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: Theme.borderRadius.m,
    padding: Theme.spacing.m, color: Theme.colors.text.primary, fontFamily: Theme.fonts.sans,
    fontSize: 14, minHeight: 250, textAlignVertical: 'top',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: Theme.borderRadius.m,
    padding: Theme.spacing.m, color: Theme.colors.text.primary, fontFamily: Theme.fonts.sans,
    fontSize: 14, height: 48,
  },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Theme.spacing.m },

  // Buttons
  primaryBtn: {
    backgroundColor: Theme.colors.primary, padding: Theme.spacing.m,
    borderRadius: Theme.borderRadius.m, alignItems: 'center', marginTop: Theme.spacing.m, flex: 1,
  },
  primaryBtnText: { color: Theme.colors.background, fontFamily: Theme.fonts.sansBold, fontSize: 16 },
  cancelBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)', padding: Theme.spacing.m,
    borderRadius: Theme.borderRadius.m, alignItems: 'center', marginTop: Theme.spacing.m, flex: 1, marginRight: Theme.spacing.s,
  },
  cancelBtnText: { color: Theme.colors.text.secondary, fontFamily: Theme.fonts.sansBold, fontSize: 16 },
  addBtn: {
    borderWidth: 1, borderColor: Theme.colors.primary, borderStyle: 'dashed',
    padding: Theme.spacing.m, borderRadius: Theme.borderRadius.m, alignItems: 'center', marginTop: Theme.spacing.m,
  },
  addBtnText: { color: Theme.colors.primary, fontFamily: Theme.fonts.sansBold, fontSize: 14 },

  // Cards
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: Theme.borderRadius.m,
    padding: Theme.spacing.m, marginBottom: Theme.spacing.s,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontFamily: Theme.fonts.sansBold, color: Theme.colors.text.primary },
  cardSub: { fontSize: 13, fontFamily: Theme.fonts.sans, color: Theme.colors.text.muted, marginTop: Theme.spacing.xs },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.s },
  dot: { width: 8, height: 8, borderRadius: 4 },
  deleteText: { color: Theme.colors.danger, fontSize: 16, fontFamily: Theme.fonts.sansBold },
  sortBadge: { fontSize: 12, fontFamily: Theme.fonts.sans, color: Theme.colors.text.muted, backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  skillToggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Theme.spacing.s, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingTop: Theme.spacing.s },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: Theme.spacing.m },
  modalContent: {
    backgroundColor: Theme.colors.background, borderRadius: Theme.borderRadius.l,
    padding: Theme.spacing.l, maxHeight: '90%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: { fontSize: 22, fontFamily: Theme.fonts.serif, color: Theme.colors.text.primary, marginBottom: Theme.spacing.s },
  modalTextArea: {
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: Theme.borderRadius.m,
    padding: Theme.spacing.m, color: Theme.colors.text.primary, fontFamily: Theme.fonts.sans,
    fontSize: 14, minHeight: 180, textAlignVertical: 'top', marginTop: Theme.spacing.xs,
  },
  modalBtnRow: { flexDirection: 'row', marginTop: Theme.spacing.l },
});
