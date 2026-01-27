import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../constants/designSystem';
import { Button } from './Button';

interface AlertDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

interface AlertDialogTriggerProps {
  children: React.ReactNode;
  onPress?: () => void;
}

interface AlertDialogContentProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDialogActionProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
}

interface AlertDialogCancelProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
}

const AlertDialog: React.FC<AlertDialogProps> = ({
  open = false,
  onOpenChange,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(open);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (open) {
      setIsOpen(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsOpen(false);
      });
    }
  }, [open, fadeAnim, scaleAnim]);

  const handleClose = () => {
    onOpenChange?.(false);
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableWithoutFeedback onPress={() => {}}>
            <Animated.View
              style={[
                styles.contentContainer,
                {
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                  if (child.type === AlertDialogContent) {
                    return React.cloneElement(child, { onClose: handleClose } as any);
                  }
                }
                return child;
              })}
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const AlertDialogTrigger: React.FC<AlertDialogTriggerProps> = ({
  children,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      {children}
    </TouchableOpacity>
  );
};

const AlertDialogContent: React.FC<AlertDialogContentProps & { onClose?: () => void }> = ({
  children,
  className,
  onClose,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.content,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === AlertDialogAction || child.type === AlertDialogCancel) {
            return React.cloneElement(child, { onClose } as any);
          }
        }
        return child;
      })}
    </View>
  );
};

const AlertDialogHeader: React.FC<AlertDialogHeaderProps> = ({
  children,
  className,
}) => {
  return <View style={styles.header}>{children}</View>;
};

const AlertDialogFooter: React.FC<AlertDialogFooterProps> = ({
  children,
  className,
}) => {
  return <View style={styles.footer}>{children}</View>;
};

const AlertDialogTitle: React.FC<AlertDialogTitleProps> = ({
  children,
  className,
}) => {
  const { colors } = useTheme();

  return (
    <Text style={[styles.title, { color: colors.foreground }]}>
      {children}
    </Text>
  );
};

const AlertDialogDescription: React.FC<AlertDialogDescriptionProps> = ({
  children,
  className,
}) => {
  const { colors } = useTheme();

  return (
    <Text style={[styles.description, { color: colors.mutedForeground }]}>
      {children}
    </Text>
  );
};

const AlertDialogAction: React.FC<AlertDialogActionProps & { onClose?: () => void }> = ({
  children,
  onPress,
  variant = 'default',
  className,
  onClose,
}) => {
  const handlePress = () => {
    onPress?.();
    onClose?.();
  };

  return (
    <Button variant={variant} onPress={handlePress}>
      {children}
    </Button>
  );
};

const AlertDialogCancel: React.FC<AlertDialogCancelProps & { onClose?: () => void }> = ({
  children,
  onPress,
  variant = 'outline',
  className,
  onClose,
}) => {
  const handlePress = () => {
    onPress?.();
    onClose?.();
  };

  return (
    <Button variant={variant} onPress={handlePress}>
      {children}
    </Button>
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
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 400,
    paddingHorizontal: Spacing.md,
  },
  content: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold as any,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
    textAlign: 'center',
  },
});

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
