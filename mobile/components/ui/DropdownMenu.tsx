import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../constants/designSystem';

interface DropdownMenuProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  onPress?: () => void;
}

interface DropdownMenuPortalProps {
  children: React.ReactNode;
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  visible: boolean;
  onRequestClose: () => void;
  sideOffset?: number;
}

interface DropdownMenuGroupProps {
  children: React.ReactNode;
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'destructive';
  inset?: boolean;
}

interface DropdownMenuCheckboxItemProps {
  children: React.ReactNode;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

interface DropdownMenuRadioItemProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}

interface DropdownMenuLabelProps {
  children: React.ReactNode;
  inset?: boolean;
}

interface DropdownMenuSeparatorProps {}

interface DropdownMenuShortcutProps {
  children: React.ReactNode;
}

interface DropdownMenuSubProps {
  children: React.ReactNode;
}

interface DropdownMenuSubTriggerProps {
  children: React.ReactNode;
  inset?: boolean;
}

interface DropdownMenuSubContentProps {
  children: React.ReactNode;
  visible: boolean;
  onRequestClose: () => void;
}

interface DropdownMenuRadioGroupProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  children,
  open,
  onOpenChange,
}) => {
  return (
    <View>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            open,
            onOpenChange,
          } as any);
        }
        return child;
      })}
    </View>
  );
};

const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({
  children,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      {children}
    </TouchableOpacity>
  );
};

const DropdownMenuPortal: React.FC<DropdownMenuPortalProps> = ({
  children,
}) => {
  return <>{children}</>;
};

const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({
  children,
  visible,
  onRequestClose,
  sideOffset = 4,
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scaleAnim, fadeAnim]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onRequestClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onRequestClose}
      >
        <Animated.View
          style={[
            styles.content,
            {
              backgroundColor: colors.popover,
              borderColor: colors.border,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {children}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const DropdownMenuGroup: React.FC<DropdownMenuGroupProps> = ({
  children,
}) => {
  return <View style={styles.group}>{children}</View>;
};

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  children,
  onSelect,
  disabled = false,
  variant = 'default',
  inset = false,
}) => {
  const { colors } = useTheme();

  const getItemStyles = () => {
    const baseStyles = {
      paddingLeft: inset ? Spacing.xl : Spacing.md,
    };

    if (variant === 'destructive') {
      return {
        ...baseStyles,
        color: colors.destructive,
      };
    }

    return baseStyles;
  };

  return (
    <TouchableOpacity
      style={[
        styles.item,
        getItemStyles(),
        {
          opacity: disabled ? 0.5 : 1,
        },
      ]}
      onPress={onSelect}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {children}
    </TouchableOpacity>
  );
};

const DropdownMenuCheckboxItem: React.FC<DropdownMenuCheckboxItemProps> = ({
  children,
  checked = false,
  onCheckedChange,
  disabled = false,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.checkboxItem,
        {
          opacity: disabled ? 0.5 : 1,
        },
      ]}
      onPress={() => onCheckedChange?.(!checked)}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.checkboxIndicator}>
        {checked && (
          <Text style={[styles.checkIcon, { color: colors.foreground }]}>
            ✓
          </Text>
        )}
      </View>
      {children}
    </TouchableOpacity>
  );
};

const DropdownMenuRadioItem: React.FC<DropdownMenuRadioItemProps> = ({
  children,
  value,
  onValueChange,
  disabled = false,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.radioItem,
        {
          opacity: disabled ? 0.5 : 1,
        },
      ]}
      onPress={() => onValueChange?.(value || '')}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.radioIndicator}>
        {value && (
          <View
            style={[
              styles.radioDot,
              { backgroundColor: colors.foreground },
            ]}
          />
        )}
      </View>
      {children}
    </TouchableOpacity>
  );
};

const DropdownMenuLabel: React.FC<DropdownMenuLabelProps> = ({
  children,
  inset = false,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.label,
        {
          paddingLeft: inset ? Spacing.xl : Spacing.md,
        },
      ]}
    >
      <Text style={[styles.labelText, { color: colors.foreground }]}>
        {children}
      </Text>
    </View>
  );
};

const DropdownMenuSeparator: React.FC<DropdownMenuSeparatorProps> = () => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.separator,
        {
          backgroundColor: colors.border,
        },
      ]}
    />
  );
};

const DropdownMenuShortcut: React.FC<DropdownMenuShortcutProps> = ({
  children,
}) => {
  const { colors } = useTheme();

  return (
    <Text style={[styles.shortcut, { color: colors.mutedForeground }]}>
      {children}
    </Text>
  );
};

const DropdownMenuSub: React.FC<DropdownMenuSubProps> = ({
  children,
}) => {
  return <View>{children}</View>;
};

const DropdownMenuSubTrigger: React.FC<DropdownMenuSubTriggerProps> = ({
  children,
  inset = false,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.subTrigger,
        {
          paddingLeft: inset ? Spacing.xl : Spacing.md,
        },
      ]}
    >
      {children}
      <Text style={[styles.chevronIcon, { color: colors.mutedForeground }]}>
        ›
      </Text>
    </View>
  );
};

const DropdownMenuSubContent: React.FC<DropdownMenuSubContentProps> = ({
  children,
  visible,
  onRequestClose,
}) => {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onRequestClose}
      >
        <View
          style={[
            styles.subContent,
            {
              backgroundColor: colors.popover,
              borderColor: colors.border,
            },
          ]}
        >
          {children}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const DropdownMenuRadioGroup: React.FC<DropdownMenuRadioGroupProps> = ({
  children,
  value,
  onValueChange,
}) => {
  return (
    <View>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            value,
            onValueChange,
          } as any);
        }
        return child;
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    minWidth: 128,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.xs,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  subContent: {
    minWidth: 128,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.xs,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  group: {
    gap: Spacing.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
  },
  checkboxIndicator: {
    width: 14,
    height: 14,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold as any,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
  },
  radioIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  labelText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as any,
  },
  separator: {
    height: 1,
    marginHorizontal: Spacing.xs,
    marginVertical: Spacing.xs,
  },
  shortcut: {
    fontSize: Typography.fontSize.xs,
    marginLeft: 'auto',
    letterSpacing: 1,
  },
  subTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
  },
  chevronIcon: {
    fontSize: 12,
    marginLeft: 'auto',
  },
});

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
