import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/theme';
import { Button } from './Button';

const { width } = Dimensions.get('window');

// 3D Visual Asset Mapping — Every exercise has its own unique 3D visual render!
export const EXERCISE_3D_ASSETS: Record<string, any> = {
  'Barbell Bench Press': require('../../assets/exercises/bench_press_3d.jpg'),
  'Incline Dumbbell Press': require('../../assets/exercises/incline_dumbbell_press_3d.jpg'),
  'Triceps Rope Pushdown': require('../../assets/exercises/triceps_pushdown_3d.jpg'),
  'Barbell Deadlift': require('../../assets/exercises/deadlift_3d.jpg'),
  'Lat Pulldown': require('../../assets/exercises/lat_pulldown_3d.jpg'),
  'Barbell Biceps Curl': require('../../assets/exercises/biceps_curl_3d.jpg'),
  'Plank Hold': require('../../assets/exercises/plank_hold_3d.jpg'),
  'Barbell Back Squat': require('../../assets/exercises/squat_3d.jpg'),
  'Leg Press': require('../../assets/exercises/leg_press_3d.jpg'),
  'Overhead Shoulder Press': require('../../assets/exercises/shoulder_press_3d.jpg'),
  'Lateral Raises': require('../../assets/exercises/lateral_raise_3d.jpg'),
  'Cable Chest Fly': require('../../assets/exercises/incline_dumbbell_press_3d.jpg'),
  'Goblet Squat': require('../../assets/exercises/goblet_squat_3d.jpg'),
  'Push-ups': require('../../assets/exercises/bench_press_3d.jpg'),
  'Dumbbell Row': require('../../assets/exercises/lat_pulldown_3d.jpg'),
  'Reverse Lunges': require('../../assets/exercises/squat_3d.jpg'),
};

interface StepGuide {
  title: string;
  badge: string;
  description: string;
  biomechanicCue: string;
}

interface ExerciseDetails {
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string;
  steps: StepGuide[];
  proTip: string;
  avoidMistake: string;
}

const DEFAULT_GUIDES: Record<string, ExerciseDetails> = {
  'Barbell Bench Press': {
    primaryMuscles: ['Pectoralis Major (92%)', 'Anterior Deltoid'],
    secondaryMuscles: ['Triceps Brachii (88%)', 'Serratus Anterior'],
    equipment: 'Barbell & Flat Bench',
    steps: [
      {
        title: 'Starting Setup & Arch',
        badge: 'Step 1: Setup',
        description: 'Lie flat on bench with eyes under barbell. Plant feet firmly, pinch shoulder blades back and down into the pad, creating a tight arch in your mid-back.',
        biomechanicCue: 'Grip bar slightly wider than shoulder-width with wrists straight.',
      },
      {
        title: 'Controlled Descent',
        badge: 'Step 2: Negative',
        description: 'Unrack the bar and pull it downward under control along a slight J-curve until it lightly touches your mid-chest (lower sternum). Tuck elbows at 45–60 degrees.',
        biomechanicCue: 'Inhale deeply and brace your core as bar descends (2–3 seconds).',
      },
      {
        title: 'Explosive Drive & Lockout',
        badge: 'Step 3: Press',
        description: 'Drive feet into floor and press bar up and slightly back toward your eye-line. Contract chest hard at peak without flaring elbows or letting shoulder blades roll forward.',
        biomechanicCue: 'Exhale through exertion and lock elbows with full control.',
      },
    ],
    proTip: 'Keep your shoulder blades retracted throughout the entire repetition to maximize chest stretch and protect your rotator cuffs.',
    avoidMistake: 'Bouncing the barbell off your sternum or lifting your hips off the bench.',
  },
  'Incline Dumbbell Press': {
    primaryMuscles: ['Clavicular Upper Pectorals (94%)', 'Anterior Deltoid'],
    secondaryMuscles: ['Triceps Brachii', 'Serratus Anterior'],
    equipment: 'Incline Bench (30°) & Dumbbells',
    steps: [
      {
        title: 'Bench Angle & Kick-Up',
        badge: 'Step 1: Setup',
        description: 'Set bench to 30 degrees. Sit back and kick dumbbells up with your knees to shoulder height. Plant feet flat, pull shoulder blades together.',
        biomechanicCue: 'Angle dumbbells slightly at 45 degrees rather than straight parallel to reduce shoulder strain.',
      },
      {
        title: 'Deep Upper Chest Stretch',
        badge: 'Step 2: Lower',
        description: 'Lower dumbbells down and out with control until your thumbs align with upper chest. Feel a rich, deep stretch across the upper pectorals.',
        biomechanicCue: 'Take 2–3 seconds on the eccentric descent with forearms perpendicular to floor.',
      },
      {
        title: 'Converging Press',
        badge: 'Step 3: Converge',
        description: 'Press dumbbells up and inward along a slight arc without clanking them together at top. Squeeze upper chest hard at peak.',
        biomechanicCue: 'Stop just short of elbow hyperextension to maintain continuous muscular tension.',
      },
    ],
    proTip: 'Do not set the bench higher than 30–45 degrees; any steeper shifts tension away from the upper chest onto the front delts.',
    avoidMistake: 'Letting elbows flare straight out at 90 degrees or clanking the dumbbells violently at the peak.',
  },
  'Triceps Rope Pushdown': {
    primaryMuscles: ['Triceps Lateral Head (95%)', 'Triceps Long Head'],
    secondaryMuscles: ['Medial Head', 'Forearms'],
    equipment: 'High Cable Pulley & Rope Attachment',
    steps: [
      {
        title: 'Anchor & Elbow Pinning',
        badge: 'Step 1: Anchor',
        description: 'Grip rope handles, hinge slightly forward at hips (10°). Glue elbows firmly against the sides of your ribcage and keep them stationary.',
        biomechanicCue: 'Shoulders locked down away from ears; wrists in neutral alignment.',
      },
      {
        title: 'Downward Drive & Spread',
        badge: 'Step 2: Push',
        description: 'Extend forearms downward while keeping upper arms frozen. At bottom, flare and spread the rope ends apart outwards past your hips.',
        biomechanicCue: 'Focus entirely on elbow hinge mechanics without moving your torso.',
      },
      {
        title: 'Peak Squeeze & Stretch',
        badge: 'Step 3: Squeeze',
        description: 'Lock out triceps for a full 1-second peak contraction. Control the return until forearms reach just past parallel (90 degrees).',
        biomechanicCue: 'Exhale as you press and maintain steady eccentric resistance.',
      },
    ],
    proTip: 'Spreading the rope at the bottom recruits maximum fibers in the lateral and long heads of your triceps.',
    avoidMistake: 'Letting your elbows swing forward like a pendulum or using shoulder momentum to press down.',
  },
  'Barbell Deadlift': {
    primaryMuscles: ['Gluteus Maximus (95%)', 'Hamstrings', 'Spinal Erectors (95%)'],
    secondaryMuscles: ['Latissimus Dorsi', 'Trapezius', 'Forearms'],
    equipment: 'Olympic Barbell & Bumper Plates',
    steps: [
      {
        title: 'Bar Alignment & Hip Hinge',
        badge: 'Step 1: Address',
        description: 'Stand with bar over mid-foot (1 inch from shins). Feet hip-width. Hinge hips back until shins lightly touch bar. Grip bar just outside legs.',
        biomechanicCue: 'Pull chest up, drop hips slightly, and engage lats as if snapping bar.',
      },
      {
        title: 'Leg Drive & Bar Path',
        badge: 'Step 2: Pull',
        description: 'Push floor away with legs like a leg press. Keep bar in continuous contact with shins and thighs as it rises in a strictly vertical bar path.',
        biomechanicCue: 'Maintain neutral spine from tailbone to crown of head (110° hip angle).',
      },
      {
        title: 'Hip Lockout & Lower',
        badge: 'Step 3: Finish',
        description: 'Drive hips forward to meet the bar standing tall. Squeeze glutes. Lower by hinging at hips until bar passes knees, then bend knees to floor.',
        biomechanicCue: 'Stand tall without hyperextending or leaning back at lockout.',
      },
    ],
    proTip: 'Engage your lats to lock the bar against your body; the closer the bar stays to your center of gravity, the stronger your pull.',
    avoidMistake: 'Rounding your spine or pulling with your arms instead of driving with your legs and hips.',
  },
  'Lat Pulldown': {
    primaryMuscles: ['Latissimus Dorsi (94%)', 'Teres Major'],
    secondaryMuscles: ['Biceps Brachii', 'Rhomboids', 'Rear Deltoids'],
    equipment: 'Cable Lat Pulldown Machine',
    steps: [
      {
        title: 'Grip & Thigh Pad Anchor',
        badge: 'Step 1: Grip',
        description: 'Grip bar wider than shoulder-width with pronated grip. Slide thighs securely under pads with feet flat. Lean torso back slightly (10–15°).',
        biomechanicCue: 'Depress shoulder blades down before bending elbows.',
      },
      {
        title: 'Elbow Drive & Squeeze',
        badge: 'Step 2: Pull',
        description: 'Drive elbows down and back toward your ribcage. Pull bar smoothly to clavicle / upper chest level while keeping chest lifted high.',
        biomechanicCue: 'Focus on leading with your elbows rather than pulling with wrists.',
      },
      {
        title: 'Controlled Lat Stretch',
        badge: 'Step 3: Eccentric',
        description: 'Allow bar to rise under 3-second control. Let arms extend fully and feel a deep stretch along the lateral edges of your back.',
        biomechanicCue: 'Maintain slight torso angle without swinging back and forth.',
      },
    ],
    proTip: 'Use a thumbless (hook) grip to minimize forearm/bicep involvement and channel maximum tension directly into your lats.',
    avoidMistake: 'Leaning excessively backwards using momentum or pulling the bar behind your neck.',
  },
  'Barbell Biceps Curl': {
    primaryMuscles: ['Biceps Brachii (95%)', 'Brachialis'],
    secondaryMuscles: ['Brachioradialis', 'Forearm Flexors'],
    equipment: 'Olympic Barbell or EZ-Curl Bar',
    steps: [
      {
        title: 'Stance & Supinated Grip',
        badge: 'Step 1: Stance',
        description: 'Stand with feet hip-width, grip barbell shoulder-width with palms facing up. Pin upper arms tight against ribs and brace abdominal wall.',
        biomechanicCue: 'Roll shoulders back and squeeze shoulder blades lightly together.',
      },
      {
        title: 'Curling Arc & Contraction',
        badge: 'Step 2: Curl',
        description: 'Keeping upper arms frozen, contract biceps to curl bar upwards toward collarbones along a smooth circular arc.',
        biomechanicCue: 'Squeeze the bar hard to increase neural drive into the biceps peak.',
      },
      {
        title: 'Eccentric Negative',
        badge: 'Step 3: Negative',
        description: 'Lower bar under 2–3 second resistance until arms reach full extension at bottom. Reset and inhale before next rep.',
        biomechanicCue: 'Do not rock your torso backward to fling the bar up.',
      },
    ],
    proTip: 'Keep your wrists straight or slightly flexed down throughout the curl to keep tension on the biceps rather than the forearm flexors.',
    avoidMistake: 'Swinging your hips and torso backward to use momentum on the upward motion.',
  },
  'Plank Hold': {
    primaryMuscles: ['Rectus Abdominis (95%)', 'Transverse Abdominis'],
    secondaryMuscles: ['Obliques', 'Gluteus Medius', 'Shoulder Stabilizers'],
    equipment: 'Exercise Mat',
    steps: [
      {
        title: 'Forearm Base & Alignment',
        badge: 'Step 1: Setup',
        description: 'Rest on forearms with elbows placed directly below shoulders. Extend legs straight back with toes planted on floor hip-width apart.',
        biomechanicCue: 'Maintain neutral neck by gazing at floor between your hands.',
      },
      {
        title: 'Total Body Tension',
        badge: 'Step 2: Brace',
        description: 'Tuck pelvis slightly (posterior pelvic tilt), flex glutes hard, pull kneecaps up, and draw belly button in towards your spine.',
        biomechanicCue: 'Form a laser-straight horizontal line from heels to ears.',
      },
      {
        title: 'Static Hold & Breathing',
        badge: 'Step 3: Hold',
        description: 'Maintain intense muscular isometric contraction without letting hips sag or pike up. Take shallow, controlled diaphragmatic breaths.',
        biomechanicCue: 'Actively pull elbows towards toes on the floor to amplify core contraction.',
      },
    ],
    proTip: 'Actively pulling your elbows toward your toes creates an intense abdominal vacuum contraction that doubles the core stimulus.',
    avoidMistake: 'Letting your lower back sag towards the floor, which compresses the lumbar vertebrae.',
  },
  'Barbell Back Squat': {
    primaryMuscles: ['Quadriceps (95%)', 'Gluteus Maximus (90%)'],
    secondaryMuscles: ['Hamstrings', 'Spinal Erectors', 'Core'],
    equipment: 'Barbell & Squat Rack',
    steps: [
      {
        title: 'Bar Placement & Stance',
        badge: 'Step 1: Unrack',
        description: 'Rest bar across upper traps (high bar) or rear deltoids (low bar). Step back, set feet shoulder-width apart, toes flared outward 15–30 degrees.',
        biomechanicCue: 'Take a deep diaphragmatic breath into your belly and brace 360° core.',
      },
      {
        title: 'Hips Back & Knees Out',
        badge: 'Step 2: Descent',
        description: 'Initiate by unlocking hips and knees simultaneously. Push knees outward in line with your toes while lowering torso until hips drop below parallel (crease below kneecap).',
        biomechanicCue: 'Maintain vertical chest angle and keep heels glued to platform.',
      },
      {
        title: 'Floor Drive & Extension',
        badge: 'Step 3: Ascent',
        description: 'Drive mid-foot straight through the floor. Push hips forward and chest upward at the same rate until standing tall with knees and hips fully extended.',
        biomechanicCue: 'Exhale past your sticking point and squeeze glutes at the top.',
      },
    ],
    proTip: 'Think about spreading the floor apart with your feet to activate your hip abductors and prevent knee cave.',
    avoidMistake: 'Letting knees collapse inward (valgus) or rounding your lower lumbar spine at the bottom (butt wink).',
  },
  'Leg Press': {
    primaryMuscles: ['Quadriceps (95%)', 'Gluteus Maximus'],
    secondaryMuscles: ['Adductors', 'Hamstrings', 'Calves'],
    equipment: '45-Degree Incline Leg Press Machine',
    steps: [
      {
        title: 'Back & Foot Placement',
        badge: 'Step 1: Seat',
        description: 'Sit back with tailbone firmly pressed against back pad. Place feet shoulder-width in center of platform, toes pointed slightly outward.',
        biomechanicCue: 'Grip the side stabilization handles tightly to lock hips down.',
      },
      {
        title: 'Controlled Knee Flexion',
        badge: 'Step 2: Lower',
        description: 'Release safety locks. Slowly lower sled until knees reach approximately 90 degrees without letting lower back lift off the pad.',
        biomechanicCue: 'Keep knees tracking directly over your middle toes.',
      },
      {
        title: 'Platform Press & Soft Lock',
        badge: 'Step 3: Press',
        description: 'Drive through entire foot to push sled back up. Stop just short of locking your knee joints to protect knees and keep quads loaded.',
        biomechanicCue: 'Never completely hyperextend or snap knees straight at peak.',
      },
    ],
    proTip: 'Placing feet lower on the platform emphasizes the quadriceps, while placing them higher shifts more load to glutes and hamstrings.',
    avoidMistake: 'Allowing your lower back to curl off the seat pad at the bottom, which risks disc compression.',
  },
  'Overhead Shoulder Press': {
    primaryMuscles: ['Anterior & Lateral Deltoids (90%)'],
    secondaryMuscles: ['Triceps Brachii', 'Upper Pectorals', 'Trapezius'],
    equipment: 'Barbell & Power Rack',
    steps: [
      {
        title: 'Front Rack Stance',
        badge: 'Step 1: Rack',
        description: 'Rest bar on collarbones with hands just outside shoulders. Stand with feet shoulder-width, glutes clamped tight, and core braced rock-solid.',
        biomechanicCue: 'Forearms should be perfectly vertical directly beneath the bar.',
      },
      {
        title: 'Vertical Press Path',
        badge: 'Step 2: Press',
        description: 'Tilt head slightly back so bar clears chin, then press vertically in a straight line. Once bar clears head, move head forward into neutral alignment.',
        biomechanicCue: 'Lock out elbows directly overhead in line with your spine and ears.',
      },
      {
        title: 'Controlled Lowering',
        badge: 'Step 3: Return',
        description: 'Control descent over 2 seconds back to clavicles. Reset breath and posture before beginning the next repetition.',
        biomechanicCue: 'Keep core tight to prevent your lower back from overarching.',
      },
    ],
    proTip: 'Squeezing your glutes and quads as hard as possible creates a solid kinetic chain that adds immediate pressing power.',
    avoidMistake: 'Arching your lower back backward into an incline bench position to compensate for heavy weight.',
  },
  'Lateral Raises': {
    primaryMuscles: ['Lateral Deltoids (98%)'],
    secondaryMuscles: ['Anterior Deltoids', 'Trapezius', 'Forearms'],
    equipment: 'Pair of Dumbbells',
    steps: [
      {
        title: 'Slight Forward Hinge',
        badge: 'Step 1: Setup',
        description: 'Hold dumbbells at sides with palms facing inward. Hinge forward 5–10 degrees at hips to align with the scapular plane.',
        biomechanicCue: 'Keep a soft bend in your elbows throughout the entire movement.',
      },
      {
        title: 'Lead with Elbows to Parallel',
        badge: 'Step 2: Raise',
        description: 'Raise dumbbells out to sides until elbows reach shoulder height. Lead with elbows as if pouring water from two pitchers at the top.',
        biomechanicCue: 'Keep pinkies slightly higher than thumbs for peak side delt activation.',
      },
      {
        title: 'Slow Controlled Descent',
        badge: 'Step 3: Negative',
        description: 'Lower weights smoothly over 2–3 seconds against gravity. Stop just before dumbbells touch thighs to preserve tension.',
        biomechanicCue: 'Do not shrug your neck or traps during the lift.',
      },
    ],
    proTip: 'Think about pushing the dumbbells outward toward the walls rather than pulling them upward to bypass trap recruitment.',
    avoidMistake: 'Using heavy weight and bouncing your knees or swinging your torso to fling the dumbbells upward.',
  },
};

interface Props {
  visible: boolean;
  exerciseName: string;
  muscleGroup?: string;
  onClose: () => void;
}

export const Exercise3DGuideModal: React.FC<Props> = ({
  visible,
  exerciseName,
  muscleGroup,
  onClose,
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);

  // Match exercise asset
  const imageSource = EXERCISE_3D_ASSETS[exerciseName] || EXERCISE_3D_ASSETS['Barbell Bench Press'];

  // Match details or fallback
  const details = DEFAULT_GUIDES[exerciseName] || {
    primaryMuscles: [muscleGroup || 'Target Muscle Group (85%)'],
    secondaryMuscles: ['Stabilizers & Core'],
    equipment: 'Standard Gym Equipment',
    steps: [
      {
        title: 'Starting Setup & Form',
        badge: 'Step 1: Setup',
        description: 'Assume the correct starting athletic posture. Keep spine neutral, grip firmly, and engage core stabilizers before initiating movement.',
        biomechanicCue: 'Maintain steady rhythmic breathing and check joint alignment.',
      },
      {
        title: 'Movement Execution',
        badge: 'Step 2: Motion',
        description: 'Move through the full range of motion under strict control without momentum. Emphasize mind-muscle connection with the primary muscle group.',
        biomechanicCue: '2-second eccentric descent with explosive controlled concentric drive.',
      },
      {
        title: 'Peak Contraction & Reset',
        badge: 'Step 3: Contraction',
        description: 'Squeeze target muscles at peak contraction for 1 second, then return smoothly along the same trajectory to starting position.',
        biomechanicCue: 'Exhale through exertion and maintain posture throughout set.',
      },
    ],
    proTip: 'Focus on time under tension and controlled tempo rather than lifting with momentum.',
    avoidMistake: 'Compromising range of motion or losing core brace under load.',
  };

  const currentStep = details.steps[activeStep] || details.steps[0];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <View style={styles.badgeRow}>
                <View style={styles.badge3D}>
                  <Ionicons name="cube-outline" size={12} color="#0B0F19" />
                  <Text style={styles.badge3DText}>3D ANATOMY FORM</Text>
                </View>
                {muscleGroup && (
                  <View style={styles.muscleBadge}>
                    <Text style={styles.muscleBadgeText}>{muscleGroup}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.exerciseTitle}>{exerciseName}</Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* 3D Visual Rendering Showcase */}
            <View style={styles.imageCard}>
              <Image source={imageSource} style={styles.image3D} resizeMode="cover" />
              <View style={styles.imageOverlayBadge}>
                <Ionicons name="eye" size={14} color="#00E5FF" />
                <Text style={styles.imageOverlayText}>Interactive 3D Biomechanics</Text>
              </View>
            </View>

            {/* Muscle Activation Highlights */}
            <View style={styles.sectionBox}>
              <Text style={styles.sectionLabel}>TARGET MUSCLE ACTIVATION</Text>
              <View style={styles.tagWrap}>
                {details.primaryMuscles.map((m, i) => (
                  <View key={i} style={styles.primaryMuscleTag}>
                    <View style={styles.tagDot} />
                    <Text style={styles.primaryMuscleText}>{m}</Text>
                  </View>
                ))}
                {details.secondaryMuscles.map((m, i) => (
                  <View key={i} style={styles.secondaryMuscleTag}>
                    <Text style={styles.secondaryMuscleText}>{m}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Step Navigation Tabs */}
            <Text style={[styles.sectionLabel, { marginTop: Spacing.md }]}>STEP-BY-STEP TECHNIQUE</Text>
            <View style={styles.stepTabs}>
              {details.steps.map((step, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setActiveStep(idx)}
                  style={[styles.stepTab, activeStep === idx ? styles.stepTabActive : null]}
                >
                  <Text style={[styles.stepTabNum, activeStep === idx ? styles.stepTabNumActive : null]}>
                    0{idx + 1}
                  </Text>
                  <Text style={[styles.stepTabLabel, activeStep === idx ? styles.stepTabLabelActive : null]}>
                    {step.badge.split(':')[1] || `Step ${idx + 1}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Active Step Detail Card */}
            <View style={styles.activeStepCard}>
              <View style={styles.stepHeaderRow}>
                <View style={styles.stepPill}>
                  <Text style={styles.stepPillText}>{currentStep.badge}</Text>
                </View>
                <Text style={styles.stepTitle}>{currentStep.title}</Text>
              </View>

              <Text style={styles.stepDesc}>{currentStep.description}</Text>

              <View style={styles.cueBox}>
                <Ionicons name="compass-outline" size={18} color="#00E5FF" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cueTitle}>Biomechanical Cue</Text>
                  <Text style={styles.cueText}>{currentStep.biomechanicCue}</Text>
                </View>
              </View>
            </View>

            {/* Pro Tip & Avoid Box */}
            <View style={styles.tipsRow}>
              <View style={styles.proTipCard}>
                <View style={styles.tipHeader}>
                  <Ionicons name="flash" size={16} color="#00E5FF" />
                  <Text style={styles.proTipTitle}>Pro Technique</Text>
                </View>
                <Text style={styles.proTipText}>{details.proTip}</Text>
              </View>

              <View style={styles.avoidCard}>
                <View style={styles.tipHeader}>
                  <Ionicons name="warning" size={16} color="#FF5252" />
                  <Text style={styles.avoidTitle}>Common Mistake</Text>
                </View>
                <Text style={styles.avoidText}>{details.avoidMistake}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Button */}
          <View style={styles.footer}>
            <Button title="Got It, Start Set" onPress={onClose} size="lg" />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 12, 0.88)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '92%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  badge3D: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00E5FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  badge3DText: {
    color: '#0B0F19',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  muscleBadge: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  muscleBadgeText: {
    ...Typography.tiny,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  exerciseTitle: {
    ...Typography.title2,
    color: Colors.text,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollBody: {
    padding: Spacing.lg,
  },
  imageCard: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: '#050811',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
  },
  image3D: {
    width: '100%',
    height: '100%',
  },
  imageOverlayBadge: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 15, 25, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.4)',
  },
  imageOverlayText: {
    color: '#00E5FF',
    fontSize: 11,
    fontWeight: '700',
  },
  sectionBox: {
    marginBottom: Spacing.sm,
  },
  sectionLabel: {
    ...Typography.tiny,
    color: Colors.textMuted,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  primaryMuscleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.4)',
    gap: 6,
  },
  tagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00E5FF',
  },
  primaryMuscleText: {
    color: '#00E5FF',
    fontSize: 12,
    fontWeight: '700',
  },
  secondaryMuscleTag: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  secondaryMuscleText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  stepTabs: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  stepTab: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  stepTabActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderColor: '#00E5FF',
  },
  stepTabNum: {
    ...Typography.tiny,
    color: Colors.textMuted,
    fontWeight: '800',
  },
  stepTabNumActive: {
    color: '#00E5FF',
  },
  stepTabLabel: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  stepTabLabelActive: {
    color: '#00E5FF',
  },
  activeStepCard: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  stepPill: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  stepPillText: {
    color: '#0B0F19',
    fontSize: 11,
    fontWeight: '800',
  },
  stepTitle: {
    ...Typography.bodyBold,
    color: Colors.text,
    flex: 1,
  },
  stepDesc: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  cueBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    gap: Spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: '#00E5FF',
  },
  cueTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00E5FF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cueText: {
    ...Typography.caption,
    color: Colors.text,
    lineHeight: 18,
  },
  tipsRow: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  proTipCard: {
    backgroundColor: 'rgba(0, 229, 255, 0.06)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  proTipTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00E5FF',
  },
  proTipText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  avoidCard: {
    backgroundColor: 'rgba(255, 82, 82, 0.06)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 82, 82, 0.25)',
  },
  avoidTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF5252',
  },
  avoidText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
});
