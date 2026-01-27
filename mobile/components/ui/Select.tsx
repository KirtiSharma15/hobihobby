import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated, ScrollView } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../constants/designSystem';

interface SelectProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface SelectGroupProps {
  children: React.ReactNode;
  style?: any;
}

interface SelectValueProps {
  children?: React.ReactNode;
  placeholder?: string;
  style?: any;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  size?: 'sm' | 'default';
  disabled?: boolean;
  onPress?: () => void;
  style?: any;
}

interface SelectContentProps {
  children: React.ReactNode;
  visible: boolean;
  onRequestClose: () => void;
  style?: any;
}

interface SelectLabelProps {
  children: React.ReactNode;
  style?: any;
}

interface SelectItemProps {
  children: React.ReactNode;
  value: string;
  disabled?: boolean;
  onSelect?: () => void;
  style?: any;
}

interface SelectSeparatorProps {
  style?: any;
}

interface SelectScrollUpButtonProps {
  onPress?: () => void;
  style?: any;
}

interface SelectScrollDownButtonProps {
  onPress?: () => void;
  style?: any;
}

interface SelectContextType {
  value?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextType>({});

const Select: React.FC<SelectProps> = ({
  children,
  value,
  onValueChange,
  open = false,
  onOpenChange,
}) => {
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, onOpenChange }}>
      <View>
        {children}
      </View>
    </SelectContext.Provider>
  );
};

const SelectGroup: React.FC<SelectGroupProps> = ({
  children,
  style,
}) => {
  return (
    <View style={[styles.selectGroup, style]}>
      {children}
    </View>
  );
};

const SelectValue: React.FC<SelectValueProps> = ({
  children,
  placeholder,
  style,
}) => {
  const { colors } = useTheme();
  const { value } = React.useContext(SelectContext);

  return (
    <View style={[styles.selectValue, style]}>
      <Text
        style={[
          styles.valueText,
          {
            color: value ? colors.foreground : colors.mutedForeground,
          },
        ]}
        numberOfLines={1}
      >
        {value ? children : placeholder}
      </Text>
    </View>
  );
};

const SelectTrigger: React.FC<SelectTriggerProps> = ({
  children,
  size = 'default',
  disabled = false,
  onPress,
  style,
}) => {
  const { colors } = useTheme();
  const { open, onOpenChange } = React.useContext(SelectContext);
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = () => {
    if (!disabled) {
      onOpenChange?.(!open);
      onPress?.();
    }
  };

  const getTriggerStyles = () => {
    const baseStyles = {
      backgroundColor: colors.input,
      borderColor: colors.border,
    };

    if (isPressed) {
      return {
        ...baseStyles,
        borderColor: colors.ring,
      };
    }

    return baseStyles;
  };

  const getSizeStyles = () => {
    if (size === 'sm') {
      return { height: 32 }; // h-8 equivalent
    }
    return { height: 36 }; // h-9 equivalent
  };

  return (
    <TouchableOpacity
      style={[
        styles.selectTrigger,
        getSizeStyles(),
        getTriggerStyles(),
        {
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      onPress={handlePress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      disabled={disabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ expanded: open, disabled }}
    >
      {children}
      <Text
        style={[
          styles.chevronIcon,
          {
            color: colors.mutedForeground,
            transform: [{ rotate: open ? '180deg' : '0deg' }],
          },
        ]}
      >
        ▼
      </Text>
    </TouchableOpacity>
  );
};

const SelectContent: React.FC<SelectContentProps> = ({
  children,
  visible,
  onRequestClose,
  style,
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-8)).current;

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
        Animated.timing(slideAnim, {
          toValue: 0,
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
        Animated.timing(slideAnim, {
          toValue: -8,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scaleAnim, fadeAnim, slideAnim]);

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
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim },
              ],
            },
            style,
          ]}
        >
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const SelectLabel: React.FC<SelectLabelProps> = ({
  children,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.selectLabel, style]}>
      <Text style={[styles.labelText, { color: colors.mutedForeground }]}>
        {children}
      </Text>
    </View>
  );
};

const SelectItem: React.FC<SelectItemProps> = ({
  children,
  value,
  disabled = false,
  onSelect,
  style,
}) => {
  const { colors } = useTheme();
  const { value: selectedValue, onValueChange } = React.useContext(SelectContext);
  const [isPressed, setIsPressed] = useState(false);

  const isSelected = selectedValue === value;

  const handlePress = () => {
    if (!disabled) {
      onValueChange?.(value);
      onSelect?.();
    }
  };

  const getItemStyles = () => {
    const baseStyles = {
      backgroundColor: 'transparent',
    };

    if (isPressed || isSelected) {
      return {
        ...baseStyles,
        backgroundColor: colors.accent,
      };
    }

    return baseStyles;
  };

  return (
    <TouchableOpacity
      style={[
        styles.selectItem,
        getItemStyles(),
        {
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      onPress={handlePress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      disabled={disabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected, disabled }}
    >
      <Text
        style={[
          styles.itemText,
          {
            color: isPressed || isSelected ? colors.accentForeground : colors.foreground,
          },
        ]}
      >
        {children}
      </Text>
      {isSelected && (
        <Text
          style={[
            styles.checkIcon,
            {
              color: colors.foreground,
            },
          ]}
        >
          ✓
        </Text>
      )}
    </TouchableOpacity>
  );
};

const SelectSeparator: React.FC<SelectSeparatorProps> = ({
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.selectSeparator,
        {
          backgroundColor: colors.border,
        },
        style,
      ]}
    />
  );
};

const SelectScrollUpButton: React.FC<SelectScrollUpButtonProps> = ({
  onPress,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.scrollButton, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.scrollIcon, { color: colors.foreground }]}>
        ▲
      </Text>
    </TouchableOpacity>
  );
};

const SelectScrollDownButton: React.FC<SelectScrollDownButtonProps> = ({
  onPress,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.scrollButton, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.scrollIcon, { color: colors.foreground }]}>
        ▼
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  selectGroup: {
    // Container for select groups
  },
  selectValue: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  valueText: {
    fontSize: Typography.fontSize.sm,
    flex: 1,
  },
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minWidth: 128, // min-w-[8rem] equivalent
  },
  chevronIcon: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold as any,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    minWidth: 128, // min-w-[8rem] equivalent
    maxHeight: 300,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 50,
  },
  scrollView: {
    padding: Spacing.xs,
  },
  selectLabel: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  labelText: {
    fontSize: Typography.fontSize.xs,
  },
  selectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    minHeight: 32,
  },
  itemText: {
    fontSize: Typography.fontSize.sm,
    flex: 1,
  },
  checkIcon: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold as any,
  },
  selectSeparator: {
    height: 1,
    marginHorizontal: Spacing.xs,
    marginVertical: Spacing.xs,
  },
  scrollButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
  },
  scrollIcon: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold as any,
  },
});

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
