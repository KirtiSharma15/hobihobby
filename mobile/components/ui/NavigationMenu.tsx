import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated, ScrollView } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../constants/designSystem';

interface NavigationMenuProps {
  children: React.ReactNode;
  viewport?: boolean;
  style?: any;
}

interface NavigationMenuListProps {
  children: React.ReactNode;
  style?: any;
}

interface NavigationMenuItemProps {
  children: React.ReactNode;
  style?: any;
}

interface NavigationMenuTriggerProps {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: any;
}

interface NavigationMenuContentProps {
  children: React.ReactNode;
  visible: boolean;
  onRequestClose: () => void;
  style?: any;
}

interface NavigationMenuLinkProps {
  children: React.ReactNode;
  onPress?: () => void;
  active?: boolean;
  style?: any;
}

interface NavigationMenuIndicatorProps {
  visible: boolean;
  style?: any;
}

interface NavigationMenuViewportProps {
  children: React.ReactNode;
  style?: any;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({
  children,
  viewport = true,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.navigationMenu,
        {
          backgroundColor: colors.background,
        },
        style,
      ]}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </View>
  );
};

const NavigationMenuList: React.FC<NavigationMenuListProps> = ({
  children,
  style,
}) => {
  return (
    <View style={[styles.navigationMenuList, style]}>
      {children}
    </View>
  );
};

const NavigationMenuItem: React.FC<NavigationMenuItemProps> = ({
  children,
  style,
}) => {
  return (
    <View style={[styles.navigationMenuItem, style]}>
      {children}
    </View>
  );
};

const NavigationMenuTrigger: React.FC<NavigationMenuTriggerProps> = ({
  children,
  onPress,
  disabled = false,
  style,
}) => {
  const { colors } = useTheme();
  const [isPressed, setIsPressed] = useState(false);

  return (
    <TouchableOpacity
      style={[
        styles.navigationMenuTrigger,
        {
          backgroundColor: isPressed ? colors.accent : colors.background,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.triggerText,
          {
            color: isPressed ? colors.accentForeground : colors.foreground,
          },
        ]}
      >
        {children}
      </Text>
      <Text
        style={[
          styles.chevronIcon,
          {
            color: isPressed ? colors.accentForeground : colors.foreground,
          },
        ]}
      >
        ▼
      </Text>
    </TouchableOpacity>
  );
};

const NavigationMenuContent: React.FC<NavigationMenuContentProps> = ({
  children,
  visible,
  onRequestClose,
  style,
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -20,
          duration: 150,
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
          {children}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const NavigationMenuLink: React.FC<NavigationMenuLinkProps> = ({
  children,
  onPress,
  active = false,
  style,
}) => {
  const { colors } = useTheme();
  const [isPressed, setIsPressed] = useState(false);

  return (
    <TouchableOpacity
      style={[
        styles.navigationMenuLink,
        {
          backgroundColor: active || isPressed ? colors.accent : 'transparent',
          opacity: active ? 0.5 : 1,
        },
        style,
      ]}
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.linkText,
          {
            color: active || isPressed ? colors.accentForeground : colors.foreground,
          },
        ]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
};

const NavigationMenuIndicator: React.FC<NavigationMenuIndicatorProps> = ({
  visible,
  style,
}) => {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible, fadeAnim]);

  return (
    <Animated.View
      style={[
        styles.navigationMenuIndicator,
        {
          opacity: fadeAnim,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.indicatorArrow,
          {
            backgroundColor: colors.border,
          },
        ]}
      />
    </Animated.View>
  );
};

const NavigationMenuViewport: React.FC<NavigationMenuViewportProps> = ({
  children,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.navigationMenuViewport,
        {
          backgroundColor: colors.popover,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <ScrollView
        style={styles.viewportScroll}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  navigationMenu: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
    flex: 1,
  },
  navigationMenuList: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  navigationMenuItem: {
    position: 'relative',
  },
  navigationMenuTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36, // h-9 equivalent
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  triggerText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as any,
  },
  chevronIcon: {
    fontSize: 12,
    marginLeft: Spacing.xs,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    minWidth: 200,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  navigationMenuLink: {
    flexDirection: 'column',
    gap: Spacing.xs,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
  },
  linkText: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
  },
  navigationMenuIndicator: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1,
    height: 6,
    alignItems: 'flex-end',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  indicatorArrow: {
    width: 8,
    height: 8,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  navigationMenuViewport: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 50,
    marginTop: Spacing.sm,
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
    maxHeight: 300,
  },
  viewportScroll: {
    flex: 1,
  },
});

// Utility function for creating trigger styles (similar to cva)
const createNavigationMenuTriggerStyle = (baseStyle: any, variants: any) => {
  return (props: any) => {
    const variantStyles = Object.keys(props).reduce((acc, key) => {
      if (variants[key] && variants[key][props[key]]) {
        return { ...acc, ...variants[key][props[key]] };
      }
      return acc;
    }, {});

    return [baseStyle, variantStyles];
  };
};

const navigationMenuTriggerStyle = createNavigationMenuTriggerStyle(
  styles.navigationMenuTrigger,
  {
    size: {
      default: {},
      sm: { height: 32, paddingHorizontal: Spacing.md },
      lg: { height: 40, paddingHorizontal: Spacing.xl },
    },
    variant: {
      default: {},
      outline: { borderWidth: 1 },
      ghost: { backgroundColor: 'transparent' },
    },
  }
);

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
};
