import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/theme';

const SLIDES = [
  {
    id: 'slide-1',
    image: require('../../assets/splash/splash_1.jpg'),
    tag: '⚡ PULSEFIT REVOLUTION',
    tagColor: '#B5FF14',
    title: 'PUSH YOUR\nLIMITS',
    highlight: 'FORGE AN UNSTOPPABLE BODY',
    description:
      'Master next-gen 3D anatomical workout guides, AI-calibrated macro precision, and daily progress analytics built for peak performance.',
  },
  {
    id: 'slide-2',
    image: require('../../assets/splash/splash_2.jpg'),
    tag: '🎯 PRECISION ATHLETICS',
    tagColor: '#38BDF8',
    title: 'ELEVATE\nYOUR GAME',
    highlight: 'CRUSH EVERY GOAL WITH FORM',
    description:
      'Interactive 3D exercise modules and personalized training programs crafted to maximize strength, power, and metabolic burn.',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    if (index !== currentIndex && index >= 0 && index < SLIDES.length) {
      setCurrentIndex(index);
    }
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({
        x: width * (currentIndex + 1),
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      router.push('/(auth)/register');
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      {/* Horizontal Carousel */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
        style={styles.scrollView}
      >
        {SLIDES.map((slide, index) => (
          <View key={slide.id} style={[styles.slideContainer, { width, height }]}>
            {/* Background Gym Workout Image */}
            <Image
              source={slide.image}
              style={[styles.backgroundImage, { width, height }]}
              resizeMode="cover"
            />

            {/* Cinematic Gradient Vignette Overlay */}
            <Svg style={StyleSheet.absoluteFill}>
              <Defs>
                <SvgLinearGradient id={`grad-${index}`} x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#0B0F19" stopOpacity="0.5" />
                  <Stop offset="25%" stopColor="#0B0F19" stopOpacity="0.1" />
                  <Stop offset="55%" stopColor="#0B0F19" stopOpacity="0.5" />
                  <Stop offset="75%" stopColor="#0B0F19" stopOpacity="0.92" />
                  <Stop offset="100%" stopColor="#0B0F19" stopOpacity="1.0" />
                </SvgLinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill={`url(#grad-${index})`} />
            </Svg>

            {/* Slide Content Box */}
            <View
              style={[
                styles.contentBox,
                {
                  paddingBottom: insets.bottom + 140,
                  paddingHorizontal: 24,
                },
              ]}
            >
              {/* Badge */}
              <View style={[styles.tagBadge, { borderColor: `${slide.tagColor}55` }]}>
                <Text style={[styles.tagText, { color: slide.tagColor }]}>{slide.tag}</Text>
              </View>

              {/* Title */}
              <Text style={styles.titleText}>{slide.title}</Text>

              {/* Sub-headline */}
              <Text style={styles.highlightText}>{slide.highlight}</Text>

              {/* Description */}
              <Text style={styles.descriptionText}>{slide.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Top Header Bar with Brand & Skip Button */}
      <View
        style={[
          styles.topBar,
          {
            top: insets.top + (Platform.OS === 'ios' ? 8 : 16),
            left: 20,
            right: 20,
          },
        ]}
      >
        <View style={styles.brandRow}>
          <View style={styles.brandIconGlow}>
            <Ionicons name="fitness" size={18} color="#B5FF14" />
          </View>
          <Text style={styles.brandName}>PULSE<Text style={{ color: '#B5FF14' }}>FIT</Text></Text>
        </View>

        <TouchableOpacity
          onPress={handleSkip}
          style={styles.skipButton}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Skip</Text>
          <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* Bottom Floating Navigation Container */}
      <View
        style={[
          styles.bottomControls,
          {
            bottom: insets.bottom + 16,
            left: 20,
            right: 20,
          },
        ]}
      >
        {/* Pagination Indicators */}
        <View style={styles.paginationRow}>
          {SLIDES.map((_, i) => (
            <View
              key={`dot-${i}`}
              style={[
                styles.dot,
                currentIndex === i ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {/* Action Buttons based on active screen */}
        {currentIndex === 0 ? (
          <View style={styles.buttonStack}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleNext}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Next Step</Text>
              <View style={styles.buttonIconCircle}>
                <Ionicons name="arrow-forward" size={18} color="#0B0F19" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.textOnlyButton}
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.7}
            >
              <Text style={styles.textOnlyButtonLabel}>
                Already have an account? <Text style={{ color: '#B5FF14', fontWeight: '700' }}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.buttonStack}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/(auth)/register')}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Get Started Now</Text>
              <View style={styles.buttonIconCircle}>
                <Ionicons name="flash" size={16} color="#0B0F19" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.75}
            >
              <Text style={styles.secondaryButtonText}>I Already Have an Account</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  scrollView: {
    flex: 1,
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  contentBox: {
    justifyContent: 'flex-end',
  },
  tagBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(11, 15, 25, 0.75)',
    borderWidth: 1,
    marginBottom: 12,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  titleText: {
    fontSize: 38,
    fontWeight: '900',
    color: '#F8FAFC',
    lineHeight: 44,
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  highlightText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#B5FF14',
    letterSpacing: 1.5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  descriptionText: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 22,
    fontWeight: '400',
  },
  topBar: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(11, 15, 25, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  brandIconGlow: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(181, 255, 20, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  skipText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  bottomControls: {
    position: 'absolute',
    zIndex: 10,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 18,
  },
  dot: {
    height: 5,
    borderRadius: 3,
  },
  activeDot: {
    width: 28,
    backgroundColor: '#B5FF14',
  },
  inactiveDot: {
    width: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  buttonStack: {
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#B5FF14',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 27,
    paddingHorizontal: 20,
    gap: 10,
    shadowColor: '#B5FF14',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0B0F19',
    letterSpacing: 0.5,
  },
  buttonIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(11, 15, 25, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  textOnlyButton: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textOnlyButtonLabel: {
    fontSize: 13,
    color: '#94A3B8',
  },
});
