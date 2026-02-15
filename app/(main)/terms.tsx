import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '../../src/constants/Theme';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

export default function TermsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/')}>
          <ChevronLeft size={28} color={Theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Use</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.updated}>Last updated: [Insert Date]</Text>

        <Text style={styles.heading}>1. Provider</Text>
        <Text style={styles.body}>
          These Terms of Use govern the use of the ai.therapy platform.
          {'\n\n'}
          Provider of the platform is:
          {'\n\n'}
          Mindflex UG (haftungsbeschränkt){'\n'}
          Mariendorfer Damm 85{'\n'}
          12109 Berlin{'\n'}
          Germany
          {'\n\n'}
          Commercial Register: Amtsgericht Berlin-Charlottenburg{'\n'}
          Commercial Register Number: HRB 276989 B{'\n'}
          VAT Identification Number: DE456508601
          {'\n\n'}
          Managing Directors:{'\n'}
          Felix Mai{'\n'}
          Moritz Tiedemann{'\n'}
          Julian Hecht
          {'\n\n'}
          Contact: hello@ai.therapy.free{'\n'}
          Website: https://ai.therapy.free
        </Text>

        <Text style={styles.heading}>2. Scope and Acceptance</Text>
        <Text style={styles.body}>
          By accessing or using ai.therapy, you agree to these Terms of Use.
          {'\n\n'}
          If you do not agree, you must not use the platform.
          {'\n\n'}
          These Terms apply to all users worldwide.
          {'\n\n'}
          Mandatory consumer protection laws of your country of residence remain unaffected.
        </Text>

        <Text style={styles.heading}>3. Description of Service</Text>
        <Text style={styles.body}>
          ai.therapy is a digital platform that provides access to AI-generated conversations designed for mental wellness, reflection, inspiration, and general wellbeing.
          {'\n\n'}
          The platform may include:{'\n'}
          • AI-generated text and voice conversations{'\n'}
          • fictional AI characters{'\n'}
          • wellness-oriented reflection tools{'\n'}
          • subscription-based access to additional features
          {'\n\n'}
          The service is provided as software.
          {'\n\n'}
          No specific outcome is guaranteed.
        </Text>

        <Text style={styles.heading}>4. Important Medical and Professional Disclaimer</Text>
        <Text style={styles.body}>
          ai.therapy is not a medical service, healthcare service, psychotherapy service, or medical device.
          {'\n\n'}
          The platform and its AI-generated characters:{'\n'}
          • are not licensed medical professionals{'\n'}
          • do not provide medical advice, diagnosis, or treatment{'\n'}
          • do not replace licensed healthcare professionals
          {'\n\n'}
          All content is provided for informational, inspirational, and wellness purposes only.
          {'\n\n'}
          You must not rely on ai.therapy for medical, psychological, legal, or emergency decisions.
          {'\n\n'}
          Always seek qualified professionals for medical or mental health concerns.
        </Text>

        <Text style={styles.heading}>5. Crisis and Emergency Disclaimer</Text>
        <Text style={styles.body}>
          ai.therapy is not suitable for emergencies or crisis situations.
          {'\n\n'}
          If you are experiencing:{'\n'}
          • suicidal thoughts{'\n'}
          • severe emotional distress{'\n'}
          • medical emergencies
          {'\n\n'}
          contact immediately:{'\n'}
          Emergency services (EU: 112, US: 911), or{'\n'}
          a licensed healthcare professional.
          {'\n\n'}
          ai.therapy does not provide emergency support.
        </Text>

        <Text style={styles.heading}>6. Eligibility and Account</Text>
        <Text style={styles.body}>
          You must be at least 18 years old to use ai.therapy.
          {'\n\n'}
          If you are under 18, you may use the service only with explicit parental or legal guardian consent.
          {'\n\n'}
          You are responsible for maintaining the confidentiality of your account.
          {'\n\n'}
          You agree to provide accurate information.
          {'\n\n'}
          We reserve the right to suspend or terminate accounts that violate these Terms.
        </Text>

        <Text style={styles.heading}>7. Subscriptions and Payments</Text>
        <Text style={styles.body}>
          Certain features require a paid subscription.
          {'\n\n'}
          Subscription details, including price and billing period, are shown before purchase.
          {'\n\n'}
          Payments are processed by third-party providers such as Stripe or app stores.
          {'\n\n'}
          Subscriptions renew automatically unless cancelled.
          {'\n\n'}
          You may cancel your subscription at any time. Access continues until the end of the billing period.
          {'\n\n'}
          Refunds are provided only where required by law.
        </Text>

        <Text style={styles.heading}>8. Right of Withdrawal (EU Consumers)</Text>
        <Text style={styles.body}>
          If you are a consumer in the European Union, you have the right to withdraw from the contract within 14 days.
          {'\n\n'}
          However, you expressly agree that the service begins immediately after purchase and acknowledge that your right of withdrawal may expire once the digital service has been fully provided.
          {'\n\n'}
          To exercise withdrawal rights, contact: hello@ai.therapy.free
        </Text>

        <Text style={styles.heading}>9. AI-Generated Content and Risks</Text>
        <Text style={styles.body}>
          All responses are generated by artificial intelligence.
          {'\n\n'}
          AI systems may produce incorrect, incomplete, or misleading information.
          {'\n\n'}
          You acknowledge and accept that:{'\n'}
          • AI content may contain errors ("hallucinations"){'\n'}
          • accuracy is not guaranteed{'\n'}
          • content is provided "as is"
          {'\n\n'}
          You use the platform at your own risk.
        </Text>

        <Text style={styles.heading}>10. Acceptable Use</Text>
        <Text style={styles.body}>
          You agree not to use the platform:{'\n'}
          • for unlawful purposes{'\n'}
          • to harm yourself or others{'\n'}
          • to attempt to reverse-engineer the system{'\n'}
          • to interfere with the service{'\n'}
          • to misuse or abuse the platform
          {'\n\n'}
          We reserve the right to suspend accounts violating these rules.
        </Text>

        <Text style={styles.heading}>11. Intellectual Property</Text>
        <Text style={styles.body}>
          All platform content, software, design, and systems are owned by Mindflex UG (haftungsbeschränkt) or licensed to it.
          {'\n\n'}
          You receive a limited, non-exclusive, non-transferable license to use the platform.
          {'\n\n'}
          You may not copy, distribute, or modify the platform without permission.
        </Text>

        <Text style={styles.heading}>12. Availability of Service</Text>
        <Text style={styles.body}>
          We strive to provide uninterrupted service but do not guarantee continuous availability.
          {'\n\n'}
          The platform may be modified, suspended, or discontinued at any time.
        </Text>

        <Text style={styles.heading}>13. Limitation of Liability</Text>
        <Text style={styles.body}>
          Mindflex UG (haftungsbeschränkt) shall be liable without limitation only for:{'\n'}
          • intent and gross negligence{'\n'}
          • injury to life, body, or health{'\n'}
          • liability under mandatory legal provisions
          {'\n\n'}
          In cases of slight negligence, liability shall be limited to foreseeable damages typical for this type of service.
          {'\n\n'}
          Otherwise, liability is excluded to the maximum extent permitted by law.
          {'\n\n'}
          Mindflex UG (haftungsbeschränkt) is not liable for:{'\n'}
          • decisions made based on AI-generated content{'\n'}
          • incorrect AI output{'\n'}
          • indirect damages{'\n'}
          • loss of profits or data
        </Text>

        <Text style={styles.heading}>14. Third-Party Services</Text>
        <Text style={styles.body}>
          The platform uses third-party providers such as:{'\n'}
          • OpenAI{'\n'}
          • Stripe{'\n'}
          • hosting providers{'\n'}
          • analytics providers
          {'\n\n'}
          We are not responsible for third-party services.
        </Text>

        <Text style={styles.heading}>15. Termination</Text>
        <Text style={styles.body}>
          You may terminate your account at any time.
          {'\n\n'}
          We may suspend or terminate accounts for violations of these Terms.
        </Text>

        <Text style={styles.heading}>16. Changes to Terms</Text>
        <Text style={styles.body}>
          We may update these Terms at any time.
          {'\n\n'}
          Updated Terms become effective upon publication.
          {'\n\n'}
          Continued use constitutes acceptance.
        </Text>

        <Text style={styles.heading}>17. Governing Law and Jurisdiction</Text>
        <Text style={styles.body}>
          These Terms are governed by the laws of the Federal Republic of Germany.
          {'\n\n'}
          If the user is a merchant or legal entity, the exclusive place of jurisdiction shall be Berlin, Germany.
          {'\n\n'}
          Mandatory consumer protection laws of the user's country remain unaffected.
        </Text>

        <Text style={styles.heading}>18. Severability</Text>
        <Text style={styles.body}>
          If any provision is invalid, the remaining provisions remain valid.
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
