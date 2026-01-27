import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../constants/designSystem';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined';
  style?: any;
  className?: string;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

interface CardActionProps {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  style,
  className,
}) => {
  const { colors } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderColor: colors.border,
        };
      default:
        return {
          backgroundColor: colors.card,
          borderColor: colors.border,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View
      style={[
        styles.card,
        variantStyles,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className,
}) => {
  return (
    <View style={styles.cardHeader}>
      {children}
    </View>
  );
};

const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className,
}) => {
  const { colors } = useTheme();

  return (
    <Text style={[styles.cardTitle, { color: colors.cardForeground }]}>
      {children}
    </Text>
  );
};

const CardDescription: React.FC<CardDescriptionProps> = ({
  children,
  className,
}) => {
  const { colors } = useTheme();

  return (
    <Text style={[styles.cardDescription, { color: colors.mutedForeground }]}>
      {children}
    </Text>
  );
};

const CardAction: React.FC<CardActionProps> = ({
  children,
  className,
}) => {
  return (
    <View style={styles.cardAction}>
      {children}
    </View>
  );
};

const CardContent: React.FC<CardContentProps> = ({
  children,
  className,
}) => {
  return (
    <View style={styles.cardContent}>
      {children}
    </View>
  );
};

const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className,
}) => {
  return (
    <View style={styles.cardFooter}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'column',
    gap: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  cardHeader: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    gap: Spacing.sm,
  },
  cardTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold as any,
    lineHeight: Typography.lineHeight.tight * Typography.fontSize.lg,
  },
  cardDescription: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
  },
  cardAction: {
    alignSelf: 'flex-start',
    justifyContent: 'flex-end',
  },
  cardContent: {
    paddingHorizontal: Spacing.xl,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
});

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
