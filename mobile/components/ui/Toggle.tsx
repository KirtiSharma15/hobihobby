import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../constants/designSystem';

interface ToggleProps {
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  disabled?: boolean;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  children?: React.ReactNode;
  style?: any;
  className?: string; // For compatibility with the original API
  onPress?: () => void;
  accessibilityLabel?: string;
}

const Toggle: React.FC<ToggleProps> = ({
  pressed = false,
  onPressedChange,
  disabled = false,
  variant = 'default',
  size = 'default',
  children,
  style,
  className,
  onPress,
  accessibilityLabel,
}) => {
  const { colors } = useTheme();
  const [isPressed, setIsPressed] = useState(pressed);

  const handlePress = () => {
    if (!disabled) {
      const newPressedState = !isPressed;
      setIsPressed(newPressedState);
      onPressedChange?.(newPressedState);
      onPress?.();
    }
  };

  const getToggleStyles = () => {
    const baseStyles = {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderRadius: BorderRadius.md,
    };

    if (variant === 'outline') {
      return {
        ...baseStyles,
        backgroundColor: 'transparent',
        borderColor: colors.border,
        borderWidth: 1,
      };
    }

    return {
      ...baseStyles,
      backgroundColor: 'transparent',
    };
  };

  const getPressedStyles = () => {
    if (isPressed) {
      return {
        backgroundColor: colors.accent,
      };
    }

    return {};
  };

  const getTextStyles = () => {
    if (isPressed) {
      return {
        color: colors.accentForeground,
        fontWeight: Typography.fontWeight.medium as any,
      };
    }

    return {
      color: colors.mutedForeground,
    };
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          height: 32, // h-8 equivalent
          paddingHorizontal: Spacing.sm,
          minWidth: 32,
          fontSize: Typography.fontSize.xs,
        };
      case 'lg':
        return {
          height: 40, // h-10 equivalent
          paddingHorizontal: Spacing.md,
          minWidth: 40,
          fontSize: Typography.fontSize.lg,
        };
      default:
        return {
          height: 36, // h-9 equivalent
          paddingHorizontal: Spacing.sm,
          minWidth: 36,
          fontSize: Typography.fontSize.sm,
        };
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.toggle,
        getToggleStyles(),
        getPressedStyles(),
        getSizeStyles(),
        {
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ 
        selected: isPressed, 
        disabled 
      }}
      accessibilityLabel={accessibilityLabel}
    >
      <Text style={[styles.toggleText, getTextStyles()]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  toggle: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  toggleText: {
    textAlign: 'center',
  },
});

export { Toggle };
