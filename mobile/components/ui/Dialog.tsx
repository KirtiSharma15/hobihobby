import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../constants/designSystem';

interface DialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface DialogTriggerProps {
  children: React.ReactNode;
  onPress?: () => void;
}

interface DialogPortalProps {
  children: React.ReactNode;
}

interface DialogOverlayProps {
  visible: boolean;
  onPress?: () => void;
}

interface DialogContentProps {
  children: React.ReactNode;
  visible: boolean;
  onRequestClose: () => void;
}

interface DialogCloseProps {
  onPress?: () => void;
}

interface DialogHeaderProps {
  children: React.ReactNode;
}

interface DialogFooterProps {
  children: React.ReactNode;
}

interface DialogTitleProps {
  children: React.ReactNode;
}

interface DialogDescriptionProps {
  children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({
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

const DialogTrigger: React.FC<DialogTriggerProps> = ({
  children,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      {children}
    </TouchableOpacity>
  );
};

const DialogPortal: React.FC<DialogPortalProps> = ({
  children,
}) => {
  return <>{children}</>;
};

const DialogOverlay: React.FC<DialogOverlayProps> = ({
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

const DialogContent: React.FC<DialogContentProps> = ({
  children,
  visible,
  onRequestClose,
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
      <DialogOverlay visible={visible} onPress={onRequestClose} />
      <View style={styles.contentContainer}>
        <Animated.View
          style={[
            styles.content,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {children}
          <DialogClose onPress={onRequestClose} />
        </Animated.View>
      </View>
    </Modal>
  );
};

const DialogClose: React.FC<DialogCloseProps> = ({
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
      accessibilityLabel="Close dialog"
    >
      <Text style={[styles.closeIcon, { color: colors.mutedForeground }]}>
        ✕
      </Text>
    </TouchableOpacity>
  );
};

const DialogHeader: React.FC<DialogHeaderProps> = ({
  children,
}) => {
  return (
    <View style={styles.header}>
      {children}
    </View>
  );
};

const DialogFooter: React.FC<DialogFooterProps> = ({
  children,
}) => {
  return (
    <View style={styles.footer}>
      {children}
    </View>
  );
};

const DialogTitle: React.FC<DialogTitleProps> = ({
  children,
}) => {
  const { colors } = useTheme();

  return (
    <Text style={[styles.title, { color: colors.foreground }]}>
      {children}
    </Text>
  );
};

const DialogDescription: React.FC<DialogDescriptionProps> = ({
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
    padding: Spacing.xl,
  },
  content: {
    width: '100%',
    maxWidth: 500,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    gap: Spacing.lg,
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
  },
  closeIcon: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.bold as any,
  },
  header: {
    gap: Spacing.sm,
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold as any,
    lineHeight: Typography.lineHeight.tight * Typography.fontSize.lg,
    textAlign: 'center',
  },
  description: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
    textAlign: 'center',
  },
});

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
