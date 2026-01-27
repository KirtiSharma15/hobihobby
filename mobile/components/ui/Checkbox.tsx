import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../constants/designSystem';

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  label?: string;
  description?: string;
}

interface CheckboxIndicatorProps {
  children?: React.ReactNode;
}

const CheckboxIndicator: React.FC<CheckboxIndicatorProps> = ({ children }) => {
  return (
    <View style={styles.indicator}>
      {children}
    </View>
  );
};

const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  onCheckedChange,
  disabled = false,
  className,
  children,
  label,
  description,
}) => {
  const { colors } = useTheme();

  const handlePress = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked);
    }
  };

  const getCheckboxStyles = () => {
    const baseStyles = {
      backgroundColor: colors.background,
      borderColor: colors.border,
    };

    if (checked) {
      return {
        ...baseStyles,
        backgroundColor: colors.primary,
        borderColor: colors.primary,
      };
    }

    if (disabled) {
      return {
        ...baseStyles,
        opacity: 0.5,
      };
    }

    return baseStyles;
  };

  const getCheckIconColor = () => {
    if (checked) {
      return colors.primaryForeground;
    }
    return colors.foreground;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.checkbox,
          getCheckboxStyles(),
        ]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}
        accessibilityRole="checkbox"
        accessibilityState={{ checked, disabled }}
        accessibilityLabel={label || 'Checkbox'}
      >
        {checked && (
          <CheckboxIndicator>
            <Text style={[styles.checkIcon, { color: getCheckIconColor() }]}>
              ✓
            </Text>
          </CheckboxIndicator>
        )}
      </TouchableOpacity>
      
      {(children || label || description) && (
        <View style={styles.labelContainer}>
          {label && (
            <Text style={[styles.label, { color: colors.foreground }]}>
              {label}
            </Text>
          )}
          {description && (
            <Text style={[styles.description, { color: colors.mutedForeground }]}>
              {description}
            </Text>
          )}
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  indicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold as any,
    lineHeight: 14,
  },
  labelContainer: {
    flex: 1,
    gap: Spacing.xs,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as any,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
  },
  description: {
    fontSize: Typography.fontSize.xs,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.xs,
  },
});

export { Checkbox, CheckboxIndicator };
