import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../constants/designSystem';

interface MenubarProps {
  children: React.ReactNode;
  style?: any;
}

interface MenubarMenuProps {
  children: React.ReactNode;
}

interface MenubarGroupProps {
  children: React.ReactNode;
}

interface MenubarPortalProps {
  children: React.ReactNode;
}

interface MenubarTriggerProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
}

interface MenubarContentProps {
  children: React.ReactNode;
  visible: boolean;
  onRequestClose: () => void;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  sideOffset?: number;
}

interface MenubarItemProps {
  children: React.ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'destructive';
  inset?: boolean;
}

interface MenubarCheckboxItemProps {
  children: React.ReactNode;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

interface MenubarRadioItemProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}

interface MenubarLabelProps {
  children: React.ReactNode;
  inset?: boolean;
}

interface MenubarSeparatorProps {}

interface MenubarShortcutProps {
  children: React.ReactNode;
}

interface MenubarSubProps {
  children: React.ReactNode;
}

interface MenubarSubTriggerProps {
  children: React.ReactNode;
  inset?: boolean;
}

interface MenubarSubContentProps {
  children: React.ReactNode;
  visible: boolean;
  onRequestClose: () => void;
}

interface MenubarRadioGroupProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}

const Menubar: React.FC<MenubarProps> = ({
  children,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.menubar,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const MenubarMenu: React.FC<MenubarMenuProps> = ({
  children,
}) => {
  return <View>{children}</View>;
};

const MenubarGroup: React.FC<MenubarGroupProps> = ({
  children,
}) => {
  return <View style={styles.group}>{children}</View>;
};

const MenubarPortal: React.FC<MenubarPortalProps> = ({
  children,
}) => {
  return <>{children}</>;
};

const MenubarTrigger: React.FC<MenubarTriggerProps> = ({
  children,
  onPress,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.trigger,
        {
          backgroundColor: colors.background,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {children}
    </TouchableOpacity>
  );
};

const MenubarContent: React.FC<MenubarContentProps> = ({
  children,
  visible,
  onRequestClose,
  align = 'start',
  alignOffset = -4,
  sideOffset = 8,
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

  const getAlignStyles = () => {
    switch (align) {
      case 'start':
        return { alignSelf: 'flex-start' as const };
      case 'end':
        return { alignSelf: 'flex-end' as const };
      case 'center':
      default:
        return { alignSelf: 'center' as const };
    }
  };

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
            getAlignStyles(),
            {
              backgroundColor: colors.popover,
              borderColor: colors.border,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
              marginTop: sideOffset,
              marginLeft: alignOffset,
            },
          ]}
        >
          {children}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const MenubarItem: React.FC<MenubarItemProps> = ({
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

const MenubarCheckboxItem: React.FC<MenubarCheckboxItemProps> = ({
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

const MenubarRadioItem: React.FC<MenubarRadioItemProps> = ({
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

const MenubarLabel: React.FC<MenubarLabelProps> = ({
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

const MenubarSeparator: React.FC<MenubarSeparatorProps> = () => {
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

const MenubarShortcut: React.FC<MenubarShortcutProps> = ({
  children,
}) => {
  const { colors } = useTheme();

  return (
    <Text style={[styles.shortcut, { color: colors.mutedForeground }]}>
      {children}
    </Text>
  );
};

const MenubarSub: React.FC<MenubarSubProps> = ({
  children,
}) => {
  return <View>{children}</View>;
};

const MenubarSubTrigger: React.FC<MenubarSubTriggerProps> = ({
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

const MenubarSubContent: React.FC<MenubarSubContentProps> = ({
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

const MenubarRadioGroup: React.FC<MenubarRadioGroupProps> = ({
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
  menubar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    height: 36, // h-9 equivalent
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.xs,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    minWidth: 192, // min-w-[12rem] equivalent
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
    minWidth: 128, // min-w-[8rem] equivalent
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
  Menubar,
  MenubarMenu,
  MenubarGroup,
  MenubarPortal,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarLabel,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
};
