import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing } from '../../constants/designSystem';

interface BreadcrumbProps {
  children: React.ReactNode;
  className?: string;
}

interface BreadcrumbListProps {
  children: React.ReactNode;
  className?: string;
}

interface BreadcrumbItemProps {
  children: React.ReactNode;
  className?: string;
}

interface BreadcrumbLinkProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
}

interface BreadcrumbPageProps {
  children: React.ReactNode;
  className?: string;
}

interface BreadcrumbSeparatorProps {
  children?: React.ReactNode;
  className?: string;
}

interface BreadcrumbEllipsisProps {
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  children,
  className,
}) => {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.breadcrumbContainer}
      accessibilityRole="navigation"
      accessibilityLabel="breadcrumb"
    >
      {children}
    </ScrollView>
  );
};

const BreadcrumbList: React.FC<BreadcrumbListProps> = ({
  children,
  className,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.breadcrumbList, { color: colors.mutedForeground }]}>
      {children}
    </View>
  );
};

const BreadcrumbItem: React.FC<BreadcrumbItemProps> = ({
  children,
  className,
}) => {
  return (
    <View style={styles.breadcrumbItem}>
      {children}
    </View>
  );
};

const BreadcrumbLink: React.FC<BreadcrumbLinkProps> = ({
  children,
  onPress,
  className,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={styles.breadcrumbLink}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.linkText, { color: colors.mutedForeground }]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

const BreadcrumbPage: React.FC<BreadcrumbPageProps> = ({
  children,
  className,
}) => {
  const { colors } = useTheme();

  return (
    <Text 
      style={[styles.pageText, { color: colors.foreground }]}
      accessibilityRole="link"
      accessibilityState={{ disabled: true }}
      accessibilityLabel="current page"
    >
      {children}
    </Text>
  );
};

const BreadcrumbSeparator: React.FC<BreadcrumbSeparatorProps> = ({
  children,
  className,
}) => {
  const { colors } = useTheme();

  return (
    <View 
      style={styles.separator}
      accessibilityRole="presentation"
      accessibilityHidden={true}
    >
      {children || <Text style={{ color: colors.mutedForeground }}>›</Text>}
    </View>
  );
};

const BreadcrumbEllipsis: React.FC<BreadcrumbEllipsisProps> = ({
  className,
}) => {
  const { colors } = useTheme();

  return (
    <View 
      style={styles.ellipsis}
      accessibilityRole="presentation"
      accessibilityHidden={true}
    >
      <Text style={{ color: colors.mutedForeground }}>⋯</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  breadcrumbContainer: {
    paddingHorizontal: Spacing.md,
  },
  breadcrumbList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  breadcrumbLink: {
    paddingVertical: Spacing.xs,
  },
  linkText: {
    fontSize: Typography.fontSize.sm,
    textDecorationLine: 'underline',
  },
  pageText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.normal as any,
  },
  separator: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 14,
    height: 14,
  },
  ellipsis: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
