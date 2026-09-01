import React from 'react';
import { Stack } from 'expo-router';
import { Colors } from '../../src/constants/theme';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="step1-personal" />
      <Stack.Screen name="step2-goals" />
      <Stack.Screen name="step3-diet" />
      <Stack.Screen name="step4-lifestyle" />
      <Stack.Screen name="summary" />
    </Stack>
  );
}
