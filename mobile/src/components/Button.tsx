import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}) => {
  const getVariantContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled ? Colors.surfaceHighlight : Colors.primary,
          borderWidth: 0,
        };
      case 'secondary':
        return {
          backgroundColor: disabled ? Colors.surfaceHighlight : Colors.surfaceLight,
          borderWidth: 1,
          borderColor: Colors.border,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: disabled ? Colors.border : Colors.primary,
        };
      case 'danger':
        return {
          backgroundColor: disabled ? Colors.surfaceHighlight : Colors.danger,
          borderWidth: 0,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
      default:
        return {};
    }
  };

  const getVariantTextStyle = (): TextStyle => {
    switch (variant) {
      case 'primary':
        return { color: disabled ? Colors.textMuted : '#0B0F19', fontWeight: '700' };
      case 'secondary':
        return { color: disabled ? Colors.textMuted : Colors.text };
      case 'outline':
        return { color: disabled ? Colors.textMuted : Colors.primary, fontWeight: '600' };
      case 'danger':
        return { color: '#FFFFFF', fontWeight: '700' };
      case 'ghost':
        return { color: disabled ? Colors.textMuted : Colors.primary };
      default:
        return {};
    }
  };

  const getSizeStyle = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: { paddingVertical: Spacing.xs + 2, paddingHorizontal: Spacing.sm + 4 },
          text: Typography.captionBold,
        };
      case 'lg':
        return {
          container: { paddingVertical: Spacing.md + 2, paddingHorizontal: Spacing.lg },
          text: Typography.title3,
        };
      case 'md':
      default:
        return {
          container: { paddingVertical: Spacing.md - 2, paddingHorizontal: Spacing.md },
          text: Typography.bodyBold,
        };
    }
  };

  const sizeStyles = getSizeStyle();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        sizeStyles.container,
        getVariantContainerStyle(),
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#0B0F19' : Colors.primary}
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={[styles.textBase, sizeStyles.text, getVariantTextStyle(), textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  textBase: {
    textAlign: 'center',
  },
});
