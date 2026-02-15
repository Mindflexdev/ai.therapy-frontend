import { View, Text, StyleSheet, SafeAreaView, ScrollView, useWindowDimensions } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Theme } from '../src/constants/Theme';
import { TherapistCard } from '../src/components/TherapistCard';

const THERAPISTS = [
  { id: '1', name: 'Marcus', image: require('../assets/characters/marcus.jpg') },
  { id: '2', name: 'Sarah', image: require('../assets/characters/sarah.jpg') },
  { id: '3', name: 'Liam', image: require('../assets/characters/liam.jpg') },
  { id: '4', name: 'Emily', image: require('../assets/characters/emily.jpg') },
];

import { useAuth } from '../src/context/AuthContext';

export default function Onboarding() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const router = useRouter();
  const { selectTherapist, isLoggedIn, setShowLoginModal } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const handleSelect = (therapist: any) => {
    setSelectedId(therapist.id);
    selectTherapist(therapist.id);

    // Short delay for the glow effect to be visible
    setTimeout(() => {
      router.push({
        pathname: '/(main)/chat',
        params: { name: therapist.name, image: therapist.image }
      });
    }, 400);
  };

  return (
    <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={[
          styles.scrollContent,
          isDesktop && styles.scrollContentDesktop
        ]}>
          <View style={[
            styles.header,
            isDesktop && styles.headerDesktop
          ]}>
            <Text style={styles.logo}>
              <Text style={styles.logoWhite}>ai</Text>
              <Text style={styles.logoDot}>.</Text>
              <Text style={styles.logoWhite}>therapy</Text>
            </Text>
            <Text style={styles.slogan}>not real therapy</Text>
            <Text style={styles.tagline}>When you can't talk to humans right now.</Text>
          </View>

          <View style={[
            styles.grid,
            isDesktop && styles.gridDesktop
          ]}>
            {THERAPISTS.map((t) => (
              <TherapistCard
                key={t.id}
                therapist={t}
                isSelected={selectedId === t.id}
                onSelect={() => handleSelect(t)}
              />
            ))}
          </View>
        </ScrollView>

        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimer}>
            By exchanging messages with ChatGPT, an AI chatbot, you agree to our{' '}
            <Text style={styles.link}>Terms of Use</Text> and confirm that you have read our{' '}
            <Text style={styles.link}>Privacy Policy</Text>. See{' '}
            <Text style={styles.link}>Cookie Preferences</Text>.
          </Text>
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    padding: Theme.spacing.s,
    paddingBottom: Theme.spacing.xl,
    alignItems: 'center',
  },
  scrollContentDesktop: {
    padding: Theme.spacing.m,
  },
  header: {
    alignItems: 'center',
    marginTop: Theme.spacing.xs,
    marginBottom: Theme.spacing.m,
  },
  headerDesktop: {
    marginTop: Theme.spacing.l,
    marginBottom: Theme.spacing.xl,
  },
  logo: {
    fontSize: 24,
    fontFamily: 'Playfair-Bold',
  },
  logoWhite: {
    color: Theme.colors.text.primary,
  },
  logoDot: {
    color: Theme.colors.primary,
  },
  tagline: {
    fontSize: 24,
    color: Theme.colors.text.primary,
    fontFamily: 'Playfair-Bold',
    marginTop: Theme.spacing.l,
    textAlign: 'center',
  },
  slogan: {
    fontSize: 12,
    color: Theme.colors.text.secondary,
    fontFamily: 'Inter-Regular',
    marginTop: -4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Theme.spacing.m,
    width: '100%',
    maxWidth: 600,
  },
  gridDesktop: {
    maxWidth: 700,
    gap: Theme.spacing.m,
  },
  disclaimerContainer: {
    padding: Theme.spacing.m,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    backgroundColor: Theme.colors.background,
  },
  disclaimer: {
    fontSize: 11,
    color: Theme.colors.text.muted,
    textAlign: 'center',
    lineHeight: 16,
  },
  link: {
    color: Theme.colors.text.secondary,
    textDecorationLine: 'underline',
  },
});
