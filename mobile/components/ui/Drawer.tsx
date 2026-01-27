import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated, PanGestureHandler, State } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../constants/designSystem';

interface DrawerProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  direction?: 'top' | 'bottom' | 'left' | 'right';
}

interface DrawerTriggerProps {
  children: React.ReactNode;
  onPress?: () => void;
}

interface DrawerPortalProps {
  children: React.ReactNode;
}

interface DrawerOverlayProps {
  visible: boolean;
  onPress?: () => void;
}

interface DrawerContentProps {
  children: React.ReactNode;
  visible: boolean;
  onRequestClose: () => void;
  direction?: 'top' | 'bottom' | 'left' | 'right';
}

interface DrawerCloseProps {
  onPress?: () => void;
}

interface DrawerHeaderProps {
  children: React.ReactNode;
}

interface DrawerFooterProps {
  children: React.ReactNode;
}

interface DrawerTitleProps {
  children: React.ReactNode;
}

interface DrawerDescriptionProps {
  children: React.ReactNode;
}

const Drawer: React.FC<DrawerProps> = ({
  children,
  open,
  onOpenChange,
  direction = 'bottom',
}) => {
  return (
    <View>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            open,
            onOpenChange,
            direction,
          } as any);
        }
        return child;
      })}
    </View>
  );
};

const DrawerTrigger: React.FC<DrawerTriggerProps> = ({
  children,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      {children}
    </TouchableOpacity>
  );
};

const DrawerPortal: React.FC<DrawerPortalProps> = ({
  children,
}) => {
  return <>{children}</>;
};

const DrawerOverlay: React.FC<DrawerOverlayProps> = ({
  visible,
  onPress,
}) => {
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
        styles.overlay,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.overlayTouchable}
        activeOpacity={1}
        onPress={onPress}
      />
    </Animated.View>
  );
};

const DrawerContent: React.FC<DrawerContentProps> = ({
  children,
  visible,
  onRequestClose,
  direction = 'bottom',
}) => {
  const { colors } = useTheme();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  const getDrawerStyles = () => {
    const baseStyles = {
      backgroundColor: colors.background,
      borderColor: colors.border,
    };

    switch (direction) {
      case 'top':
        return {
          ...baseStyles,
          top: 0,
          left: 0,
          right: 0,
          maxHeight: '80%',
          borderBottomWidth: 1,
          borderBottomLeftRadius: BorderRadius.lg,
          borderBottomRightRadius: BorderRadius.lg,
          transform: [{
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-400, 0],
            }),
          }],
        };
      case 'bottom':
        return {
          ...baseStyles,
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: '80%',
          borderTopWidth: 1,
          borderTopLeftRadius: BorderRadius.lg,
          borderTopRightRadius: BorderRadius.lg,
          transform: [{
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [400, 0],
            }),
          }],
        };
      case 'left':
        return {
          ...baseStyles,
          left: 0,
          top: 0,
          bottom: 0,
          width: '75%',
          maxWidth: 400,
          borderRightWidth: 1,
          borderTopRightRadius: BorderRadius.lg,
          borderBottomRightRadius: BorderRadius.lg,
          transform: [{
            translateX: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-400, 0],
            }),
          }],
        };
      case 'right':
        return {
          ...baseStyles,
          right: 0,
          top: 0,
          bottom: 0,
          width: '75%',
          maxWidth: 400,
          borderLeftWidth: 1,
          borderTopLeftRadius: BorderRadius.lg,
          borderBottomLeftRadius: BorderRadius.lg,
          transform: [{
            translateX: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [400, 0],
            }),
          }],
        };
      default:
        return baseStyles;
    }
  };

  const getHandleStyles = () => {
    switch (direction) {
      case 'top':
      case 'bottom':
        return styles.handleHorizontal;
      case 'left':
      case 'right':
        return styles.handleVertical;
      default:
        return styles.handleHorizontal;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onRequestClose}
    >
      <DrawerOverlay visible={visible} onPress={onRequestClose} />
      <View style={styles.contentContainer}>
        <Animated.View
          style={[
            styles.content,
            getDrawerStyles(),
            {
              opacity: fadeAnim,
            },
          ]}
        >
          {(direction === 'bottom' || direction === 'top') && (
            <View style={getHandleStyles()}>
              <View style={styles.handle} />
            </View>
          )}
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};

const DrawerClose: React.FC<DrawerCloseProps> = ({
  onPress,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.closeButton,
        {
          backgroundColor: colors.accent,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Close drawer"
    >
      <Text style={[styles.closeIcon, { color: colors.mutedForeground }]}>
        ✕
      </Text>
    </TouchableOpacity>
  );
};

const DrawerHeader: React.FC<DrawerHeaderProps> = ({
  children,
}) => {
  return (
    <View style={styles.header}>
      {children}
    </View>
  );
};

const DrawerFooter: React.FC<DrawerFooterProps> = ({
  children,
}) => {
  return (
    <View style={styles.footer}>
      {children}
    </View>
  );
};

const DrawerTitle: React.FC<DrawerTitleProps> = ({
  children,
}) => {
  const { colors } = useTheme();

  return (
    <Text style={[styles.title, { color: colors.foreground }]}>
      {children}
    </Text>
  );
};

const DrawerDescription: React.FC<DrawerDescriptionProps> = ({
  children,
}) => {
  const { colors } = useTheme();

  return (
    <Text style={[styles.description, { color: colors.mutedForeground }]}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 50,
  },
  overlayTouchable: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    position: 'absolute',
    zIndex: 51,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  handleHorizontal: {
    alignItems: 'center',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  handleVertical: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  handle: {
    width: 100,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.7,
    zIndex: 1,
  },
  closeIcon: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.bold as any,
  },
  header: {
    gap: Spacing.sm,
    padding: Spacing.lg,
  },
  footer: {
    marginTop: 'auto',
    gap: Spacing.sm,
    padding: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold as any,
    lineHeight: Typography.lineHeight.tight * Typography.fontSize.lg,
  },
  description: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
  },
});

export {
  Drawer,
  DrawerTrigger,
  DrawerPortal,
  DrawerOverlay,
  DrawerContent,
  DrawerClose,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
