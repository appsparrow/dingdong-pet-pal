import { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Image, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Dog, Heart, Calendar, Users, Shield, Smartphone } from 'lucide-react-native';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabase';
import { colors } from '../theme/colors';

const logo = require('../../assets/logo-pettabl.png');

export default function LandingScreen({ navigation }: any) {
  const isWeb = Platform.OS === 'web';
  const scrollRef = useRef<ScrollView>(null);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const scrollToWaitlist = () => {
    setWaitlistOpen(true);
    setStatus('idle');
    setMessage('');
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }, 100);
  };

  const submitWaitlist = async () => {
    if (!fullName.trim() || !email.trim()) {
      setStatus('error');
      setMessage('Please add both your name and email.');
      return;
    }

    try {
      setStatus('loading');
      setMessage('');

      const { error } = await supabase
        .from('waitlist')
        .insert({
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          source: Platform.OS === 'web' ? 'expo-web' : Platform.OS,
          context: 'Landing page signup',
        });

      if (error) {
        throw error;
      }

      setStatus('success');
      setMessage("Thanks! You're on the list. 🎉");
      setFullName('');
      setEmail('');
    } catch (error: any) {
      console.error('Waitlist error', error);
      setStatus('error');
      setMessage(error.message || 'Something went wrong. Please try again.');
    }
  };

  // SEO metadata - only rendered on web
  const siteUrl = 'https://pettabl.com';
  const siteName = 'Pettabl';
  const pageTitle = 'Pettabl – Smart In-Home Pet Sitting App | Pet Care Scheduling & Coordination';
  const pageDescription = 'Pettabl is the easiest way to coordinate in-home pet sitting. Create schedules, assign trusted caretakers, track visits, and get photo updates for dogs, cats, birds, reptiles, and more. iOS & Android app coming soon.';
  const keywords = 'pet sitting app, pet care scheduling, dog walking, cat sitter, bird care, reptile care, in-home pet sitting, pet coordination app, pet routines, pet updates, multi-pet app, pet parenting, caretaking app, pet management, pet care coordination, pet sitting software, pet care app, pet sitter app, dog care app, cat care app, pet activity tracking, pet schedule app, pet care management, trusted pet sitters, pet sitting coordination';
  const ogImage = `${siteUrl}/logo-pettabl.png`;
  const twitterHandle = '@pettabl';

  // Structured Data (JSON-LD) for better SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Pettabl',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'iOS, Android, Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: pageDescription,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      ratingCount: '1',
    },
    author: {
      '@type': 'Organization',
      name: 'Pettabl',
    },
  };

  return (
    <>
      {isWeb && (
        <Helmet>
          {/* Primary Meta Tags */}
          <title>{pageTitle}</title>
          <meta name="title" content={pageTitle} />
          <meta name="description" content={pageDescription} />
          <meta name="keywords" content={keywords} />
          <meta name="author" content="Pettabl" />
          <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
          <meta name="language" content="English" />
          <meta name="revisit-after" content="7 days" />
          <meta name="theme-color" content="#FFB4A2" />
          <link rel="canonical" href={siteUrl} />

          {/* Open Graph / Facebook */}
          <meta property="og:type" content="website" />
          <meta property="og:url" content={siteUrl} />
          <meta property="og:title" content={pageTitle} />
          <meta property="og:description" content={pageDescription} />
          <meta property="og:image" content={ogImage} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:alt" content="Pettabl - Smart Pet Sitting App" />
          <meta property="og:site_name" content={siteName} />
          <meta property="og:locale" content="en_US" />

          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:url" content={siteUrl} />
          <meta name="twitter:title" content={pageTitle} />
          <meta name="twitter:description" content={pageDescription} />
          <meta name="twitter:image" content={ogImage} />
          <meta name="twitter:image:alt" content="Pettabl - Smart Pet Sitting App" />
          <meta name="twitter:site" content={twitterHandle} />
          <meta name="twitter:creator" content={twitterHandle} />

          {/* Additional Meta Tags */}
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content={siteName} />
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="msapplication-TileColor" content="#FFB4A2" />
          <meta name="msapplication-config" content="/browserconfig.xml" />

          {/* Geo Tags (if applicable) */}
          <meta name="geo.region" content="US" />
          <meta name="geo.placename" content="United States" />

          {/* App Links */}
          <meta property="al:ios:app_name" content={siteName} />
          <meta property="al:android:app_name" content={siteName} />
          <meta property="al:web:url" content={siteUrl} />

          {/* Structured Data */}
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>

          {/* Additional SEO Tags */}
          <meta name="application-name" content={siteName} />
          <meta name="generator" content="Pettabl" />
          <meta name="referrer" content="no-referrer-when-downgrade" />
          <meta name="rating" content="general" />
          <meta name="distribution" content="global" />
          <meta name="coverage" content="worldwide" />
          <meta name="target" content="all" />
          <meta name="audience" content="all" />
        </Helmet>
      )}

      <ScrollView ref={scrollRef} style={styles.container} contentContainerStyle={styles.scrollContent}>
      <LinearGradient
        colors={[colors.primary + '10', colors.background, colors.accent + '10']}
        style={styles.gradient}
      >
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.logoContainer}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
          </View>
          
          {/* Coming Soon Banner - Top */}
          <LinearGradient
            colors={['#FFB4A2', '#D4A5F5', '#B794F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.topComingSoonBanner}
          >
            <Text style={styles.topComingSoonText}>
              Apple iOS and Android app coming soon! ✨
            </Text>
          </LinearGradient>
          
          <Text style={styles.description}>
            Coordinate in-home pet sitting with ease. Assign trusted caretakers, share routines, and keep your furry friends happy while you’re away.
          </Text>
          <Text style={styles.subtitle}>Home Pet Sitting Simplified 🐾</Text>
          <View style={styles.waitlistPrompt}>
            <Text style={styles.waitlistCopy}>Want early access?</Text>
            <TouchableOpacity
              style={styles.heartButton}
              onPress={() => {
                setWaitlistOpen((prev) => !prev);
                setStatus('idle');
                setMessage('');
              }}
              accessibilityLabel="Join Pettabl waitlist"
            >
              <Heart color={isWeb ? '#ff6b6b' : '#fff'} size={24} />
            </TouchableOpacity>
          </View>

          

          {waitlistOpen && (
            <View style={styles.waitlistCard}>
              <Text style={styles.waitlistTitle}>Join the Pettabl waitlist</Text>
              <Text style={styles.waitlistSubtitle}>
                We’ll send invite codes and launch news to your inbox.
              </Text>
              <View style={styles.waitlistField}>
                <Text style={styles.waitlistLabel}>Name</Text>
                <TextInput
                  style={styles.waitlistInput}
                  placeholder="Jane Petlover"
                  value={fullName}
                  onChangeText={setFullName}
                  editable={status !== 'loading'}
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.waitlistField}>
                <Text style={styles.waitlistLabel}>Email</Text>
                <TextInput
                  style={styles.waitlistInput}
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={setEmail}
                  editable={status !== 'loading'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <TouchableOpacity
                style={[styles.waitlistButton, status === 'loading' && styles.waitlistButtonDisabled]}
                onPress={submitWaitlist}
                disabled={status === 'loading'}
              >
                <Text style={styles.waitlistButtonText}>
                  {status === 'loading' ? 'Saving…' : 'Save my spot'}
                </Text>
              </TouchableOpacity>
              {message ? (
                <Text
                  style={[
                    styles.waitlistMessage,
                    status === 'success' ? styles.waitlistSuccess : styles.waitlistError,
                  ]}
                >
                  {message}
                </Text>
              ) : null}
            </View>
          )}

          {/* <View style={styles.buttonGroup}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Auth')}
            >
              <Text style={styles.primaryButtonText}>Get Started Free 🚀</Text>
            </TouchableOpacity>
          </View> */}
        </View>

        {/* Features Section */}
        <View style={styles.features}>
          <Text style={styles.sectionTitle}>Everything Your Pets Need</Text>
          
          <View style={styles.featureGrid}>
            <FeatureCard
              icon={<Calendar size={32} color={colors.primary} />}
              title="Smart Scheduling"
              description="Custom care schedules for feeding, walks, and playtime"
            />
            
            <FeatureCard
              icon={<Users size={32} color={colors.primary} />}
              title="Easy Coordination"
              description="Invite caretakers and track completion in real-time"
            />
            
            <FeatureCard
              icon={<Heart size={32} color={colors.primary} />}
              title="Activity Tracking"
              description="Photo updates, notes, and timestamps for every interaction"
            />
            
            <FeatureCard
              icon={<Shield size={32} color={colors.primary} />}
              title="Secure & Private"
              description="Enterprise-grade security. Only authorized users can access"
            />
            
            <FeatureCard
              icon={<Smartphone size={32} color={colors.primary} />}
              title="Mobile & Web"
              description="Access from any device. Your pet care hub is always with you"
            />
            
            <FeatureCard
              icon={<Dog size={32} color={colors.primary} />}
              title="Multi-Pet Support"
              description="Manage multiple pets with profiles, schedules, and history"
            />
          </View>
        </View>

        {/* CTA Section */}
        <LinearGradient
          colors={['#FFB4A2', '#D4A5F5', '#B794F6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cta}
        >
          <Text style={styles.ctaTitle}>Ready to Simplify Pet Sitting?</Text>
          <Text style={styles.ctaSubtitle}>
            Join pet parents and sitters who trust Pettabl for stress-free, in-home care coordination
          </Text>
          
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={scrollToWaitlist}
          >
            <Text style={styles.ctaButtonText}>Join the Waitlist 🎉</Text>
          </TouchableOpacity>
          
          <Text style={styles.comingSoonText}>
           Apple iOS and Android app coming soon! ✨
          </Text>
        </LinearGradient>

        {/* Footer */}
        <View style={styles.footer}>
          <Image source={logo} style={styles.footerLogo} resizeMode="contain" />
          <Text style={styles.footerText}>© 2025 Pettabl. Made with ❤️ for pets everywhere.</Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={scrollToWaitlist}>
              <Text style={styles.footerLink}>Join Waitlist</Text>
            </TouchableOpacity>
            <Text style={styles.footerDivider}>•</Text>
            <Text style={styles.footerLink}>Contact</Text>
          </View>
        </View>
      </LinearGradient>
    </ScrollView>
    </>
  );
}

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <View style={styles.featureCard}>
    <View style={styles.featureIcon}>{icon}</View>
    <Text style={styles.featureTitle}>{title}</Text>
    <Text style={styles.featureDescription}>{description}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  gradient: {
    flex: 1,
    minHeight: '100%',
  },
  hero: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  logo: {
    width: 280,
    height: 120,
  },
  topComingSoonBanner: {
    width: '100%',
    maxWidth: 600,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 24,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 8px 24px rgba(255, 180, 162, 0.3)' }
      : {
          shadowColor: '#FFB4A2',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 5,
        }),
  },
  topComingSoonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 56,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 24,
    color: colors.textMuted,
    marginBottom: 24,
    textAlign: 'center',
  },
  waitlistPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  waitlistCopy: {
    fontSize: 16,
    color: colors.textMuted,
  },
  heartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Platform.OS === 'web' ? '#ffe6f0' : 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Platform.OS === 'web' ? '#ff6b6b' : 'rgba(255,255,255,0.4)',
  },
  description: {
    fontSize: 18,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 600,
    lineHeight: 28,
  },
  waitlistCard: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.85)',
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
  },
  waitlistTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.text,
  },
  waitlistSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: colors.textMuted,
  },
  waitlistField: {
    gap: 6,
  },
  waitlistLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  waitlistInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
  },
  waitlistButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  waitlistButtonDisabled: {
    opacity: 0.6,
  },
  waitlistButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  waitlistMessage: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: 4,
  },
  waitlistSuccess: {
    color: '#16a34a',
  },
  waitlistError: {
    color: '#ef4444',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 18px 36px rgba(241, 36, 138, 0.25)' }
      : {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
        }),
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  features: {
    paddingVertical: 80,
    paddingHorizontal: 20,
    backgroundColor: `${colors.primary}05`,
  },
  sectionTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 48,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 24,
    maxWidth: 1200,
    alignSelf: 'center',
  },
  featureCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 24,
    padding: 24,
    width: Platform.OS === 'web' ? 350 : '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.border,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 16px 32px rgba(15, 23, 42, 0.12)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }),
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  featureDescription: {
    fontSize: 16,
    color: colors.textMuted,
    lineHeight: 24,
  },
  cta: {
    paddingVertical: 80,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaSubtitle: {
    fontSize: 20,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 600,
  },
  ctaButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 16,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 20px 40px rgba(59, 130, 246, 0.35)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 6,
        }),
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  comingSoonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 24,
    opacity: 0.95,
  },
  footer: {
    paddingVertical: 48,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(226, 232, 240, 0.35)',
  },
  footerLogo: {
    width: 180,
    height: 64,
  },
  footerText: {
    color: colors.textMuted,
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  footerLink: {
    color: colors.textMuted,
    fontSize: 14,
  },
  footerDivider: {
    color: colors.textMuted,
    fontSize: 14,
  },
});

