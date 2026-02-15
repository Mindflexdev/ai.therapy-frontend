import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '../../src/constants/Theme';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/')}>
          <ChevronLeft size={28} color={Theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.updated}>Last updated: [Insert Date]</Text>

        <Text style={styles.heading}>1. Controller</Text>
        <Text style={styles.body}>
          The controller responsible for data processing is:
          {'\n\n'}
          Mindflex UG (haftungsbeschränkt){'\n'}
          Mariendorfer Damm 85{'\n'}
          12109 Berlin{'\n'}
          Germany
          {'\n\n'}
          Commercial Register: Amtsgericht Berlin-Charlottenburg{'\n'}
          HRB 276989 B{'\n'}
          VAT ID: DE456508601
          {'\n\n'}
          Email: hello@ai.therapy.free{'\n'}
          Website: https://ai.therapy.free
          {'\n\n'}
          Managing Directors:{'\n'}
          Felix Mai{'\n'}
          Moritz Tiedemann{'\n'}
          Julian Hecht
        </Text>

        <Text style={styles.heading}>2. Data Protection Officer</Text>
        <Text style={styles.body}>
          We have appointed a Data Protection Officer:
          {'\n\n'}
          heyData GmbH{'\n'}
          Schützenstraße 5{'\n'}
          10117 Berlin{'\n'}
          Germany
          {'\n\n'}
          Email: datenschutz@heydata.eu
        </Text>

        <Text style={styles.heading}>3. Overview of Data Processing</Text>
        <Text style={styles.body}>
          We process personal data when you:{'\n'}
          • visit our website{'\n'}
          • create an account{'\n'}
          • use the AI chat service{'\n'}
          • subscribe to paid services{'\n'}
          • contact us{'\n'}
          • interact with platform features
          {'\n\n'}
          Personal data means any information that identifies you.
        </Text>

        <Text style={styles.heading}>4. Legal Basis for Processing (GDPR)</Text>
        <Text style={styles.body}>
          We process personal data based on the following legal grounds:
          {'\n\n'}
          Art. 6(1)(b) GDPR – Contract performance{'\n'}
          To provide and operate the platform.
          {'\n\n'}
          Art. 6(1)(f) GDPR – Legitimate interest{'\n'}
          To improve, secure, and maintain the service.
          {'\n\n'}
          Art. 6(1)(a) GDPR – Consent{'\n'}
          Where required, such as analytics or optional features.
          {'\n\n'}
          Art. 6(1)(c) GDPR – Legal obligation{'\n'}
          To comply with legal requirements.
        </Text>

        <Text style={styles.heading}>5. Account and Registration Data</Text>
        <Text style={styles.body}>
          When you create an account, we may process:{'\n'}
          • email address{'\n'}
          • name{'\n'}
          • profile picture (if provided){'\n'}
          • authentication provider ID{'\n'}
          • account creation timestamp
          {'\n\n'}
          Passwords are not stored when using third-party login providers.
          {'\n\n'}
          Purpose: Providing account access and service functionality.
          {'\n\n'}
          Legal basis: Art. 6(1)(b) GDPR.
        </Text>

        <Text style={styles.heading}>6. AI Chat and Communication Data</Text>
        <Text style={styles.body}>
          When using the AI chat, we process:{'\n'}
          • messages you send{'\n'}
          • AI-generated responses{'\n'}
          • timestamps{'\n'}
          • technical identifiers
          {'\n\n'}
          Purpose:{'\n'}
          • provide AI responses{'\n'}
          • operate the service{'\n'}
          • improve reliability and safety
          {'\n\n'}
          Legal basis: Art. 6(1)(b) GDPR.
          {'\n\n'}
          Important: Your data is not used to train OpenAI models.
        </Text>

        <Text style={styles.heading}>7. AI Processing via OpenAI</Text>
        <Text style={styles.body}>
          We use OpenAI, L.L.C., USA.
          {'\n\n'}
          OpenAI processes data to generate AI responses.
          {'\n\n'}
          OpenAI acts as a data processor under contractual safeguards.
          {'\n\n'}
          OpenAI does not use submitted data to train models when using their API.
          {'\n\n'}
          Legal basis: Art. 6(1)(b) GDPR.
          {'\n\n'}
          More information: https://openai.com/privacy
        </Text>

        <Text style={styles.heading}>8. Hosting and Infrastructure</Text>
        <Text style={styles.body}>
          We use hosting and infrastructure providers to operate the platform.
          {'\n\n'}
          These providers may process technical data such as:{'\n'}
          • IP address{'\n'}
          • request metadata{'\n'}
          • device information
          {'\n\n'}
          Providers include:{'\n'}
          • hosting providers (e.g., Hetzner Online GmbH or equivalent){'\n'}
          • Supabase Inc., USA (database infrastructure)
          {'\n\n'}
          Legal basis: Art. 6(1)(b) GDPR, Art. 6(1)(f) GDPR
        </Text>

        <Text style={styles.heading}>9. Payments and Subscriptions</Text>
        <Text style={styles.body}>
          Payments are processed by third-party payment providers such as:
          {'\n\n'}
          Stripe Payments Europe Ltd.{'\n'}
          Ireland
          {'\n\n'}
          Stripe may process:{'\n'}
          • name{'\n'}
          • email{'\n'}
          • payment information{'\n'}
          • transaction data
          {'\n\n'}
          We do not store full payment details.
          {'\n\n'}
          Legal basis: Art. 6(1)(b) GDPR.
          {'\n\n'}
          Stripe Privacy Policy: https://stripe.com/privacy
        </Text>

        <Text style={styles.heading}>10. Analytics and Technical Monitoring</Text>
        <Text style={styles.body}>
          We may use analytics tools to understand platform performance.
          {'\n\n'}
          These tools may process:{'\n'}
          • IP address{'\n'}
          • browser information{'\n'}
          • usage information
          {'\n\n'}
          Purpose:{'\n'}
          • improve service performance{'\n'}
          • ensure system stability
          {'\n\n'}
          Legal basis: Art. 6(1)(f) GDPR.
        </Text>

        <Text style={styles.heading}>11. Advertising (Free Version)</Text>
        <Text style={styles.body}>
          If the free version includes advertising, third-party providers may process:{'\n'}
          • IP address{'\n'}
          • device identifiers{'\n'}
          • technical usage data
          {'\n\n'}
          Legal basis: Art. 6(1)(f) GDPR or consent where required.
        </Text>

        <Text style={styles.heading}>12. Data Retention</Text>
        <Text style={styles.body}>
          We retain personal data only as long as necessary.
          {'\n\n'}
          Account data: Stored while your account exists.
          {'\n\n'}
          Chat data: Stored while your account exists or until deletion is requested.
          {'\n\n'}
          Payment data: Stored according to legal requirements.
          {'\n\n'}
          You may request deletion at any time.
        </Text>

        <Text style={styles.heading}>13. International Data Transfers</Text>
        <Text style={styles.body}>
          Your data may be transferred to countries outside the European Union, including the United States.
          {'\n\n'}
          These transfers are protected using appropriate safeguards such as:{'\n'}
          • Standard Contractual Clauses (Art. 46 GDPR)
          {'\n\n'}
          These ensure adequate protection.
        </Text>

        <Text style={styles.heading}>14. Your Rights Under GDPR</Text>
        <Text style={styles.body}>
          You have the right to:{'\n'}
          • access your data (Art. 15 GDPR){'\n'}
          • correct inaccurate data (Art. 16 GDPR){'\n'}
          • delete your data (Art. 17 GDPR){'\n'}
          • restrict processing (Art. 18 GDPR){'\n'}
          • data portability (Art. 20 GDPR){'\n'}
          • object to processing (Art. 21 GDPR){'\n'}
          • withdraw consent (Art. 7 GDPR)
          {'\n\n'}
          To exercise your rights, contact: hello@ai.therapy.free
          {'\n\n'}
          You also have the right to complain to a supervisory authority.
          {'\n\n'}
          German supervisory authority example:{'\n'}
          Berliner Beauftragte für Datenschutz und Informationsfreiheit{'\n'}
          https://www.datenschutz-berlin.de
        </Text>

        <Text style={styles.heading}>15. California Privacy Rights (CCPA/CPRA)</Text>
        <Text style={styles.body}>
          If you are a California resident, you have the right to:{'\n'}
          • request access to your personal data{'\n'}
          • request deletion of your personal data{'\n'}
          • request correction of inaccurate data{'\n'}
          • know what data is collected
          {'\n\n'}
          We do not sell personal data.
          {'\n\n'}
          Contact: hello@ai.therapy.free
        </Text>

        <Text style={styles.heading}>16. Data Security</Text>
        <Text style={styles.body}>
          We implement technical and organizational measures to protect your data, including:{'\n'}
          • encryption in transit (HTTPS){'\n'}
          • access controls{'\n'}
          • secure infrastructure{'\n'}
          • authentication safeguards
          {'\n\n'}
          However, no system is completely secure.
        </Text>

        <Text style={styles.heading}>17. Account Deletion</Text>
        <Text style={styles.body}>
          You may delete your account at any time.
          {'\n\n'}
          Upon deletion:{'\n'}
          • personal data will be deleted{'\n'}
          • except where legal retention is required
          {'\n\n'}
          To request deletion, contact: hello@ai.therapy.free
        </Text>

        <Text style={styles.heading}>18. Changes to this Privacy Policy</Text>
        <Text style={styles.body}>
          We may update this Privacy Policy.
          {'\n\n'}
          The current version is always available on our website.
        </Text>

        <Text style={styles.heading}>19. Contact</Text>
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
  body: {
    color: Theme.colors.text.secondary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 24,
    marginBottom: Theme.spacing.m,
  },
});
