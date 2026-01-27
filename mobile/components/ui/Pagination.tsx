import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../constants/designSystem';

interface PaginationProps {
  children: React.ReactNode;
  style?: any;
}

interface PaginationContentProps {
  children: React.ReactNode;
  style?: any;
}

interface PaginationItemProps {
  children: React.ReactNode;
  style?: any;
}

interface PaginationLinkProps {
  children: React.ReactNode;
  isActive?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  size?: 'default' | 'icon';
  style?: any;
}

interface PaginationPreviousProps {
  onPress?: () => void;
  disabled?: boolean;
  style?: any;
}

interface PaginationNextProps {
  onPress?: () => void;
  disabled?: boolean;
  style?: any;
}

interface PaginationEllipsisProps {
  style?: any;
}

const Pagination: React.FC<PaginationProps> = ({
  children,
  style,
}) => {
  return (
    <View
      style={[styles.pagination, style]}
      accessibilityRole="navigation"
      accessibilityLabel="pagination"
    >
      {children}
    </View>
  );
};

const PaginationContent: React.FC<PaginationContentProps> = ({
  children,
  style,
}) => {
  return (
    <View style={[styles.paginationContent, style]}>
      {children}
    </View>
  );
};

const PaginationItem: React.FC<PaginationItemProps> = ({
  children,
  style,
}) => {
  return (
    <View style={[styles.paginationItem, style]}>
      {children}
    </View>
  );
};

const PaginationLink: React.FC<PaginationLinkProps> = ({
  children,
  isActive = false,
  onPress,
  disabled = false,
  size = 'icon',
  style,
}) => {
  const { colors } = useTheme();
  const [isPressed, setIsPressed] = React.useState(false);

  const getButtonStyles = () => {
    const baseStyles = {
      backgroundColor: isActive ? colors.background : 'transparent',
      borderColor: isActive ? colors.border : 'transparent',
    };

    if (isPressed && !isActive) {
      return {
        ...baseStyles,
        backgroundColor: colors.accent,
      };
    }

    return baseStyles;
  };

  const getTextStyles = () => {
    if (isActive) {
      return { color: colors.foreground };
    }
    if (isPressed) {
      return { color: colors.accentForeground };
    }
    return { color: colors.foreground };
  };

  const getSizeStyles = () => {
    if (size === 'icon') {
      return {
        width: 36, // size-9 equivalent
        height: 36,
        paddingHorizontal: 0,
        paddingVertical: 0,
      };
    }
    return {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
    };
  };

  return (
    <TouchableOpacity
      style={[
        styles.paginationLink,
        getSizeStyles(),
        getButtonStyles(),
        {
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      disabled={disabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ 
        selected: isActive,
        disabled,
      }}
    >
      <Text style={[styles.linkText, getTextStyles()]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

const PaginationPrevious: React.FC<PaginationPreviousProps> = ({
  onPress,
  disabled = false,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <PaginationLink
      onPress={onPress}
      disabled={disabled}
      size="default"
      style={[styles.paginationPrevious, style]}
      accessibilityLabel="Go to previous page"
    >
      <View style={styles.previousContent}>
        <Text style={[styles.chevronIcon, { color: colors.foreground }]}>
          ‹
        </Text>
        <Text style={[styles.previousText, { color: colors.foreground }]}>
          Previous
        </Text>
      </View>
    </PaginationLink>
  );
};

const PaginationNext: React.FC<PaginationNextProps> = ({
  onPress,
  disabled = false,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <PaginationLink
      onPress={onPress}
      disabled={disabled}
      size="default"
      style={[styles.paginationNext, style]}
      accessibilityLabel="Go to next page"
    >
      <View style={styles.nextContent}>
        <Text style={[styles.nextText, { color: colors.foreground }]}>
          Next
        </Text>
        <Text style={[styles.chevronIcon, { color: colors.foreground }]}>
          ›
        </Text>
      </View>
    </PaginationLink>
  );
};

const PaginationEllipsis: React.FC<PaginationEllipsisProps> = ({
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[styles.paginationEllipsis, style]}
      accessibilityRole="text"
      accessibilityLabel="More pages"
    >
      <Text style={[styles.ellipsisIcon, { color: colors.mutedForeground }]}>
        ⋯
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginHorizontal: 'auto',
  },
  paginationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  paginationItem: {
    // Container for pagination items
  },
  paginationLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minWidth: 36, // size-9 equivalent
    minHeight: 36,
  },
  linkText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as any,
    textAlign: 'center',
  },
  paginationPrevious: {
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  previousContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  previousText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as any,
  },
  paginationNext: {
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  nextContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  nextText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as any,
  },
  chevronIcon: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold as any,
  },
  paginationEllipsis: {
    width: 36, // size-9 equivalent
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ellipsisIcon: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold as any,
  },
});

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
