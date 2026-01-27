import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../constants/designSystem';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'default',
  size = 'default',
  onPress,
  disabled = false,
  loading = false,
  className,
}) => {
  const { colors } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive':
        return {
          backgroundColor: colors.destructive,
          borderColor: 'transparent',
          textColor: colors.primaryForeground,
        };
      case 'outline':
        return {
          backgroundColor: colors.background,
          borderColor: colors.border,
          textColor: colors.foreground,
        };
      case 'secondary':
        return {
          backgroundColor: colors.secondary,
          borderColor: 'transparent',
          textColor: colors.secondaryForeground,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          textColor: colors.foreground,
        };
      case 'link':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          textColor: colors.primary,
        };
      default:
        return {
          backgroundColor: colors.primary,
          borderColor: 'transparent',
          textColor: colors.primaryForeground,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          height: 32,
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.xs,
          gap: Spacing.xs,
        };
      case 'lg':
        return {
          height: 40,
          paddingHorizontal: Spacing.xl,
          paddingVertical: Spacing.sm,
          gap: Spacing.sm,
        };
      case 'icon':
        return {
          width: 36,
          height: 36,
          paddingHorizontal: 0,
          paddingVertical: 0,
          gap: 0,
        };
      default:
        return {
          height: 36,
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.sm,
          gap: Spacing.sm,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
          height: sizeStyles.height,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
          opacity: isDisabled ? 0.5 : 1,
        },
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      <View style={[styles.content, { gap: sizeStyles.gap }]}>
        {loading && (
          <ActivityIndicator 
            size="small" 
            color={variantStyles.textColor}
            style={styles.loader}
          />
        )}
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            if (typeof child.type === 'string' && child.type === 'Text') {
              return React.cloneElement(child, {
                style: [
                  styles.text,
                  {
                    color: variantStyles.textColor,
                    textDecorationLine: variant === 'link' ? 'underline' : 'none',
                  },
                  child.props.style,
                ],
              } as any);
            }
          }
          return child;
        })}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as any,
    textAlign: 'center',
  },
  loader: {
    marginRight: Spacing.xs,
  },
});

export { Button };
