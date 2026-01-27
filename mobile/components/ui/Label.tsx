import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing } from '../../constants/designSystem';

interface LabelProps {
  children: React.ReactNode;
  style?: TextStyle;
  disabled?: boolean;
  error?: boolean;
  htmlFor?: string; // For accessibility association
}

const Label: React.FC<LabelProps> = ({
  children,
  style,
  disabled = false,
  error = false,
  htmlFor,
}) => {
  const { colors } = useTheme();

  const getLabelStyles = () => {
    const baseStyles = {
      color: colors.foreground,
    };

    if (error) {
      return {
        ...baseStyles,
        color: colors.destructive,
      };
    }

    if (disabled) {
      return {
        ...baseStyles,
        color: colors.mutedForeground,
        opacity: 0.5,
      };
    }

    return baseStyles;
  };

  return (
    <Text
      style={[
        styles.label,
        getLabelStyles(),
        style,
      ]}
      accessibilityRole="text"
      accessibilityLabel={htmlFor ? `Label for ${htmlFor}` : undefined}
      accessibilityState={{ disabled }}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as any,
    lineHeight: Typography.lineHeight.tight * Typography.fontSize.sm,
    textAlignVertical: 'center',
  },
});

export { Label };
