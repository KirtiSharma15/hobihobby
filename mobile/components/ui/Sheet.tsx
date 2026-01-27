import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated, Dimensions } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../constants/designSystem';

interface SheetProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface SheetTriggerProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
}

interface SheetCloseProps {
  onPress?: () => void;
  style?: any;
}

interface SheetContentProps {
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  visible: boolean;
  onRequestClose: () => void;
  style?: any;
}

interface SheetHeaderProps {
  children: React.ReactNode;
  style?: any;
}

interface SheetFooterProps {
  children: React.ReactNode;
  style?: any;
}

interface SheetTitleProps {
  children: React.ReactNode;
  style?: any;
}

interface SheetDescriptionProps {
  children: React.ReactNode;
  style?: any;
}

interface SheetContextType {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const SheetContext = React.createContext<SheetContextType>({});

const Sheet: React.FC<SheetProps> = ({
  children,
  open = false,
  onOpenChange,
}) => {
  return (
    <SheetContext.Provider value={{ open, onOpenChange }}>
      {children}
    </SheetContext.Provider>
  );
};

const SheetTrigger: React.FC<SheetTriggerProps> = ({
  children,
  onPress,
  style,
}) => {
  const { onOpenChange } = React.useContext(SheetContext);

  const handlePress = () => {
    onOpenChange?.(true);
    onPress?.();
  };

  return (
    <TouchableOpacity
      style={style}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {children}
    </TouchableOpacity>
  );
};

const SheetClose: React.FC<SheetCloseProps> = ({
  onPress,
  style,
}) => {
  const { onOpenChange } = React.useContext(SheetContext);

  const handlePress = () => {
    onOpenChange?.(false);
    onPress?.();
  };

  return (
    <TouchableOpacity
      style={[styles.closeButton, style]}
      onPress={handlePress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="Close sheet"
    >
      <Text style={styles.closeIcon}>✕</Text>
    </TouchableOpacity>
  );
};

const SheetContent: React.FC<SheetContentProps> = ({
  children,
  side = 'right',
  visible,
  onRequestClose,
  style,
}) => {
  const { colors } = useTheme();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const getSlideValue = () => {
    switch (side) {
      case 'right':
        return screenWidth * 0.75; // w-3/4 equivalent
      case 'left':
        return -screenWidth * 0.75;
      case 'top':
        return -screenHeight * 0.5;
      case 'bottom':
        return screenHeight * 0.5;
      default:
        return screenWidth * 0.75;
    }
  };

  const getContentStyles = () => {
    const baseStyles = {
      backgroundColor: colors.background,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      zIndex: 50,
    };

    switch (side) {
      case 'right':
        return {
          ...baseStyles,
          position: 'absolute',
          top: 0,
          right: 0,
          height: '100%',
          width: Math.min(screenWidth * 0.75, 384), // sm:max-w-sm equivalent
          borderLeftWidth: 1,
          borderLeftColor: colors.border,
        };
      case 'left':
        return {
          ...baseStyles,
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: Math.min(screenWidth * 0.75, 384),
          borderRightWidth: 1,
          borderRightColor: colors.border,
        };
      case 'top':
        return {
          ...baseStyles,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 'auto',
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        };
      case 'bottom':
        return {
          ...baseStyles,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 'auto',
          borderTopWidth: 1,
          borderTopColor: colors.border,
        };
      default:
        return baseStyles;
    }
  };

  const getSlideTransform = () => {
    const slideValue = getSlideValue();
    
    switch (side) {
      case 'right':
        return {
          transform: [{ translateX: slideAnim }],
        };
      case 'left':
        return {
          transform: [{ translateX: slideAnim }],
        };
      case 'top':
        return {
          transform: [{ translateY: slideAnim }],
        };
      case 'bottom':
        return {
          transform: [{ translateY: slideAnim }],
        };
      default:
        return {
          transform: [{ translateX: slideAnim }],
        };
    }
  };

  useEffect(() => {
    const slideValue = getSlideValue();
    
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: slideValue,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim, side]);

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
            styles.overlayBackground,
            {
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              opacity: fadeAnim,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.content,
            getContentStyles(),
            getSlideTransform(),
            style,
          ]}
        >
          {children}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const SheetHeader: React.FC<SheetHeaderProps> = ({
  children,
  style,
}) => {
  return (
    <View style={[styles.header, style]}>
      {children}
    </View>
  );
};

const SheetFooter: React.FC<SheetFooterProps> = ({
  children,
  style,
}) => {
  return (
    <View style={[styles.footer, style]}>
      {children}
    </View>
  );
};

const SheetTitle: React.FC<SheetTitleProps> = ({
  children,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <Text style={[styles.title, { color: colors.foreground }, style]}>
      {children}
    </Text>
  );
};

const SheetDescription: React.FC<SheetDescriptionProps> = ({
  children,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <Text style={[styles.description, { color: colors.mutedForeground }, style]}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 32,
    height: 32,
    borderRadius: BorderRadius.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  closeIcon: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold as any,
    color: '#000',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flexDirection: 'column',
    gap: Spacing.lg,
  },
  header: {
    flexDirection: 'column',
    gap: 6, // gap-1.5 equivalent
    padding: Spacing.lg,
  },
  footer: {
    marginTop: 'auto',
    flexDirection: 'column',
    gap: Spacing.sm,
    padding: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold as any,
  },
  description: {
    fontSize: Typography.fontSize.sm,
  },
});

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
