import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../constants/designSystem';

interface AlertProps {
  variant?: 'default' | 'destructive';
  children: React.ReactNode;
  className?: string;
}

interface AlertTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  variant = 'default',
  children,
  className,
}) => {
  const { colors } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive':
        return {
          backgroundColor: colors.card,
          borderColor: colors.destructive,
        };
      default:
        return {
          backgroundColor: colors.card,
          borderColor: colors.border,
        };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'destructive':
        return colors.destructive;
      default:
        return colors.foreground;
    }
  };

  return (
    <View
      style={[
        styles.alert,
        getVariantStyles(),
      ]}
      accessibilityRole="alert"
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === AlertTitle) {
            return React.cloneElement(child, { 
              textColor: getTextColor(),
              variant 
            } as any);
          }
          if (child.type === AlertDescription) {
            return React.cloneElement(child, { variant } as any);
          }
        }
        return child;
      })}
    </View>
  );
};

const AlertTitle: React.FC<AlertTitleProps & { textColor?: string; variant?: string }> = ({
  children,
  className,
  textColor,
  variant,
}) => {
  const { colors } = useTheme();

  return (
    <Text
      style={[
        styles.title,
        {
          color: textColor || colors.foreground,
        },
      ]}
      numberOfLines={1}
    >
      {children}
    </Text>
  );
};

const AlertDescription: React.FC<AlertDescriptionProps & { variant?: string }> = ({
  children,
  className,
  variant,
}) => {
  const { colors } = useTheme();

  const getDescriptionColor = () => {
    switch (variant) {
      case 'destructive':
        return colors.destructive + 'E6'; // 90% opacity
      default:
        return colors.mutedForeground;
    }
  };

  return (
    <View style={styles.descriptionContainer}>
      <Text
        style={[
          styles.description,
          {
            color: getDescriptionColor(),
          },
        ]}
      >
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  alert: {
    width: '100%',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as any,
    letterSpacing: -0.025,
    flex: 1,
    minHeight: 16,
  },
  descriptionContainer: {
    flex: 1,
    gap: Spacing.xs,
  },
  description: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },
});

export { Alert, AlertTitle, AlertDescription };
