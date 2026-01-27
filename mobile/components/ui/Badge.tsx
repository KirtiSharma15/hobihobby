import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../constants/designSystem';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  onPress?: () => void;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  onPress,
  className,
}) => {
  const { colors } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: colors.secondary,
          borderColor: 'transparent',
          color: colors.secondaryForeground,
        };
      case 'destructive':
        return {
          backgroundColor: colors.destructive,
          borderColor: 'transparent',
          color: colors.white,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: colors.border,
          color: colors.foreground,
        };
      default:
        return {
          backgroundColor: colors.primary,
          borderColor: 'transparent',
          color: colors.primaryForeground,
        };
    }
  };

  const variantStyles = getVariantStyles();

  const BadgeComponent = onPress ? TouchableOpacity : View;

  return (
    <BadgeComponent
      style={[
        styles.badge,
        {
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
        },
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (typeof child.type === 'string' && child.type === 'Text') {
            return React.cloneElement(child, {
              style: [
                styles.text,
                {
                  color: variantStyles.color,
                },
                child.props.style,
              ],
            } as any);
          }
        }
        return child;
      })}
    </BadgeComponent>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    alignSelf: 'flex-start',
    minWidth: 20,
  },
  text: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium as any,
    textAlign: 'center',
  },
});

export { Badge };
