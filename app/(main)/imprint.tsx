import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '../../src/constants/Theme';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

export default function ImprintScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/')}>
          <ChevronLeft size={28} color={Theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Imprint</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Imprint</Text>
        <Text style={styles.subheading}>Information pursuant to Section 5 of the German Digital Services Act (DDG)</Text>

        <Text style={styles.sectionTitle}>Service Provider</Text>
        <Text style={styles.body}>
          Mindflex UG (haftungsbeschränkt){'\n'}
          Mariendorfer Damm 85{'\n'}
          12109 Berlin{'\n'}
          Germany
        </Text>

        <Text style={styles.sectionTitle}>Commercial Register</Text>
        <Text style={styles.body}>
          Registered in the Commercial Register{'\n'}
          Register Court: Local Court (Amtsgericht) Berlin-Charlottenburg{'\n'}
          Registration Number: HRB 276989 B
        </Text>

        <Text style={styles.sectionTitle}>Represented by the Managing Directors</Text>
        <Text style={styles.body}>
          Felix Mai{'\n'}
          Moritz Tiedemann{'\n'}
          Julian Hecht
        </Text>

        <Text style={styles.sectionTitle}>Contact</Text>
        <Text style={styles.body}>
          Email: hello@ai.therapy.free{'\n'}
          Website: https://ai.therapy.free
        </Text>

        <Text style={styles.sectionTitle}>VAT Identification Number</Text>
        <Text style={styles.body}>
          VAT Identification Number pursuant to Section 27a of the German VAT Act:{'\n'}
          DE456508601
        </Text>

        <Text style={styles.sectionTitle}>Responsible for Content pursuant to Section 18 (2) German State Media Treaty (MStV)</Text>
        <Text style={styles.body}>
          Mindflex UG (haftungsbeschränkt){'\n'}
          Mariendorfer Damm 85{'\n'}
          12109 Berlin{'\n'}
          Germany
          {'\n\n'}
          Represented by the Managing Directors Felix Mai, Moritz Tiedemann, Julian Hecht
        </Text>

        {/* German Version */}
        <View style={styles.separator} />

        <Text style={styles.heading}>Impressum</Text>
        <Text style={styles.subheading}>Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz)</Text>

        <Text style={styles.sectionTitle}>Anbieter</Text>
        <Text style={styles.body}>
          Mindflex UG (haftungsbeschränkt){'\n'}
          Mariendorfer Damm 85{'\n'}
          12109 Berlin{'\n'}
          Deutschland
        </Text>

        <Text style={styles.sectionTitle}>Handelsregister</Text>
        <Text style={styles.body}>
          Eingetragen im Handelsregister{'\n'}
          Registergericht: Amtsgericht Berlin-Charlottenburg{'\n'}
          Registernummer: HRB 276989 B
        </Text>

        <Text style={styles.sectionTitle}>Vertreten durch die Geschäftsführer</Text>
        <Text style={styles.body}>
          Felix Mai{'\n'}
          Moritz Tiedemann{'\n'}
          Julian Hecht
        </Text>

        <Text style={styles.sectionTitle}>Kontakt</Text>
        <Text style={styles.body}>
          E-Mail: hello@ai.therapy.free{'\n'}
          Website: https://ai.therapy.free
        </Text>

        <Text style={styles.sectionTitle}>Umsatzsteuer-Identifikationsnummer</Text>
        <Text style={styles.body}>
          Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:{'\n'}
          DE456508601
        </Text>

        <Text style={styles.sectionTitle}>Verantwortlich für den Inhalt gemäß § 18 Abs. 2 MStV</Text>
        <Text style={styles.body}>
          Mindflex UG (haftungsbeschränkt){'\n'}
          Mariendorfer Damm 85{'\n'}
          12109 Berlin{'\n'}
          Deutschland
          {'\n\n'}
          Vertreten durch die Geschäftsführer Felix Mai, Moritz Tiedemann, Julian Hecht
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
  heading: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: Theme.colors.primary,
    marginTop: Theme.spacing.xl,
    marginBottom: Theme.spacing.m,
  },
  subheading: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Theme.colors.text.muted,
    marginBottom: Theme.spacing.l,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: Theme.colors.text.primary,
    marginTop: Theme.spacing.l,
    marginBottom: Theme.spacing.s,
  },
  body: {
    color: Theme.colors.text.secondary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 24,
    marginBottom: Theme.spacing.m,
  },
  separator: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginVertical: Theme.spacing.xxl,
  },
});
