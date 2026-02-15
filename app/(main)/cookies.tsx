import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '../../src/constants/Theme';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

export default function CookiesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/')}>
          <ChevronLeft size={28} color={Theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cookie Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.updated}>Last updated: [Insert Date]</Text>

        <Text style={styles.body}>
          This Cookie Policy explains how Mindflex UG (haftungsbeschränkt) uses cookies and similar technologies when you use the ai.therapy platform at https://ai.therapy.free
        </Text>

        <Text style={styles.heading}>1. What are cookies?</Text>
        <Text style={styles.body}>
          Cookies are small text files that are stored on your device when you visit a website or use an online service.
          {'\n\n'}
          Cookies help ensure the platform functions correctly, securely, and efficiently. They can also help improve user experience and analyze system performance.
          {'\n\n'}
          Some cookies are deleted automatically when you close your browser (session cookies), while others remain on your device for a defined period (persistent cookies).
        </Text>

        <Text style={styles.heading}>2. Controller</Text>
        <Text style={styles.body}>
          The controller responsible for data processing is:
          {'\n\n'}
          Mindflex UG (haftungsbeschränkt){'\n'}
          Mariendorfer Damm 85{'\n'}
          12109 Berlin{'\n'}
          Germany
          {'\n\n'}
          Email: hello@ai.therapy.free{'\n'}
          Website: https://ai.therapy.free
        </Text>

        <Text style={styles.heading}>3. Categories of cookies we use</Text>

        <Text style={styles.subheading}>3.1 Strictly necessary cookies</Text>
        <Text style={styles.body}>
          These cookies are essential for the operation and security of the platform. They enable core functionality such as user authentication, maintaining login sessions, and protecting against unauthorized access.
          {'\n\n'}
          Without these cookies, the platform cannot function properly.
          {'\n\n'}
          These cookies may include authentication tokens, session identifiers, and security-related cookies.
          {'\n\n'}
          These cookies are used for purposes such as:{'\n'}
          • enabling secure login and authentication{'\n'}
          • maintaining your session while using the platform{'\n'}
          • preventing fraud and abuse{'\n'}
          • ensuring platform security
          {'\n\n'}
          Legal basis for processing is Article 6(1)(b) GDPR (performance of a contract) and Article 6(1)(f) GDPR (legitimate interest in secure operation of the platform).
          {'\n\n'}
          These cookies do not require consent.
        </Text>

        <Text style={styles.subheading}>3.2 Functional cookies</Text>
        <Text style={styles.body}>
          Functional cookies help improve the usability and performance of the platform by remembering user preferences and settings.
          {'\n\n'}
          These cookies may store preferences such as login status or user interface settings.
          {'\n\n'}
          Legal basis is Article 6(1)(f) GDPR or Article 6(1)(a) GDPR where consent is required.
        </Text>

        <Text style={styles.subheading}>3.3 Analytics cookies</Text>
        <Text style={styles.body}>
          Analytics cookies help us understand how users interact with the platform and help us improve performance, stability, and user experience.
          {'\n\n'}
          These cookies may collect technical information such as browser type, device type, pages visited, and usage behavior.
          {'\n\n'}
          Analytics cookies are only used if you provide consent.
          {'\n\n'}
          Legal basis is Article 6(1)(a) GDPR (consent).
          {'\n\n'}
          You may withdraw your consent at any time.
        </Text>

        <Text style={styles.subheading}>3.4 Payment and security cookies</Text>
        <Text style={styles.body}>
          Payment providers such as Stripe may use cookies necessary to securely process transactions, prevent fraud, and ensure payment security.
          {'\n\n'}
          These cookies are required for contract performance.
          {'\n\n'}
          Legal basis is Article 6(1)(b) GDPR.
        </Text>

        <Text style={styles.heading}>4. Third-party cookies and services</Text>
        <Text style={styles.body}>
          We may use third-party service providers that set cookies or similar technologies as part of providing their services.
          {'\n\n'}
          These providers may include:{'\n'}
          • authentication and database providers (such as Supabase){'\n'}
          • payment providers (such as Stripe){'\n'}
          • AI infrastructure providers (such as OpenAI){'\n'}
          • hosting providers{'\n'}
          • analytics providers
          {'\n\n'}
          These providers process data in accordance with their own privacy policies and applicable data protection laws.
        </Text>

        <Text style={styles.heading}>5. International data transfers</Text>
        <Text style={styles.body}>
          Some cookies and related data processing may involve transfer of data to countries outside the European Union, including the United States.
          {'\n\n'}
          These transfers are protected using appropriate safeguards such as Standard Contractual Clauses pursuant to Article 46 GDPR.
        </Text>

        <Text style={styles.heading}>6. Cookie duration</Text>
        <Text style={styles.body}>
          Some cookies are deleted automatically when you close your browser, while others remain stored until they expire or are deleted manually.
          {'\n\n'}
          Authentication and security cookies are typically stored only as long as necessary to maintain secure operation of the platform.
        </Text>

        <Text style={styles.heading}>7. Managing cookies</Text>
        <Text style={styles.body}>
          You can control and manage cookies through your browser settings.
          {'\n\n'}
          You may delete cookies or block cookies through your browser configuration.
          {'\n\n'}
          Please note that disabling strictly necessary cookies may prevent the platform from functioning properly.
          {'\n\n'}
          Analytics and optional cookies are only used with your consent and can be disabled at any time.
        </Text>

        <Text style={styles.heading}>8. Changes to this Cookie Policy</Text>
        <Text style={styles.body}>
          We may update this Cookie Policy from time to time.
          {'\n\n'}
          The current version is always available on our website.
        </Text>

        <Text style={styles.heading}>9. Contact</Text>
        <Text style={styles.body}>
          Mindflex UG (haftungsbeschränkt){'\n'}
          Mariendorfer Damm 85{'\n'}
          12109 Berlin{'\n'}
          Germany
          {'\n\n'}
          Email: hello@ai.therapy.free
        </Text>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  headerTitle: {
    color: Theme.colors.text.primary,
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
  scrollContent: {
    padding: Theme.spacing.xl,
  },
  updated: {
    color: Theme.colors.text.muted,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginBottom: Theme.spacing.l,
    fontStyle: 'italic',
  },
  heading: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Theme.colors.primary,
    marginTop: Theme.spacing.l,
    marginBottom: Theme.spacing.m,
  },
  subheading: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: Theme.colors.text.primary,
    marginTop: Theme.spacing.m,
    marginBottom: Theme.spacing.s,
  },
  body: {
    color: Theme.colors.text.secondary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 24,
    marginBottom: Theme.spacing.m,
  },
});
