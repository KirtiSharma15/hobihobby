import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../constants/designSystem';

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToasterProps {
  position?: 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  duration?: number;
  maxToasts?: number;
  style?: any;
}

interface ToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
  position: string;
}

const ToasterContext = React.createContext<{
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
} | null>(null);

// Hook to use the toaster
export const useToaster = () => {
  const context = React.useContext(ToasterContext);
  if (!context) {
    throw new Error('useToaster must be used within a ToasterProvider');
  }
  return context;
};

// Individual Toast Component
const ToastItem: React.FC<ToastProps> = ({ toast, onDismiss, position }) => {
  const { colors } = useTheme();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide in animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, toast.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss(toast.id);
    });
  };

  const getToastStyles = () => {
    const baseStyles = {
      backgroundColor: colors.popover,
      borderColor: colors.border,
    };

    switch (toast.type) {
      case 'success':
        return {
          ...baseStyles,
          borderLeftColor: colors.success || '#10b981',
          borderLeftWidth: 4,
        };
      case 'error':
        return {
          ...baseStyles,
          borderLeftColor: colors.destructive || '#ef4444',
          borderLeftWidth: 4,
        };
      case 'warning':
        return {
          ...baseStyles,
          borderLeftColor: colors.warning || '#f59e0b',
          borderLeftWidth: 4,
        };
      case 'info':
        return {
          ...baseStyles,
          borderLeftColor: colors.primary,
          borderLeftWidth: 4,
        };
      default:
        return baseStyles;
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  };

  const getIconColor = () => {
    switch (toast.type) {
      case 'success':
        return colors.success || '#10b981';
      case 'error':
        return colors.destructive || '#ef4444';
      case 'warning':
        return colors.warning || '#f59e0b';
      case 'info':
        return colors.primary;
      default:
        return colors.foreground;
    }
  };

  return (
    <Animated.View
      style={[
        styles.toast,
        getToastStyles(),
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={styles.toastContent}>
        {toast.type && (
          <Text style={[styles.toastIcon, { color: getIconColor() }]}>
            {getIcon()}
          </Text>
        )}
        <View style={styles.toastTextContainer}>
          <Text style={[styles.toastMessage, { color: colors.popoverForeground }]}>
            {toast.message}
          </Text>
        </View>
        {toast.action && (
          <TouchableOpacity
            style={styles.toastAction}
            onPress={toast.action.onPress}
            activeOpacity={0.8}
          >
            <Text style={[styles.toastActionText, { color: colors.primary }]}>
              {toast.action.label}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.toastDismiss}
          onPress={handleDismiss}
          activeOpacity={0.8}
        >
          <Text style={[styles.toastDismissIcon, { color: colors.mutedForeground }]}>
            ✕
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// Main Toaster Component
const Toaster: React.FC<ToasterProps> = ({
  position = 'top',
  duration = 5000,
  maxToasts = 3,
  style,
}) => {
  const { colors } = useTheme();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdCounter = useRef(0);

  const addToast = (toastData: Omit<Toast, 'id'>) => {
    const newToast: Toast = {
      ...toastData,
      id: `toast-${toastIdCounter.current++}`,
      duration: toastData.duration ?? duration,
    };

    setToasts(prev => {
      const updated = [newToast, ...prev];
      return updated.slice(0, maxToasts);
    });
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getContainerStyles = () => {
    const baseStyles = {
      position: 'absolute' as const,
      zIndex: 1000,
    };

    switch (position) {
      case 'top':
        return {
          ...baseStyles,
          top: 50,
          left: 20,
          right: 20,
        };
      case 'bottom':
        return {
          ...baseStyles,
          bottom: 50,
          left: 20,
          right: 20,
        };
      case 'top-left':
        return {
          ...baseStyles,
          top: 50,
          left: 20,
        };
      case 'top-right':
        return {
          ...baseStyles,
          top: 50,
          right: 20,
        };
      case 'bottom-left':
        return {
          ...baseStyles,
          bottom: 50,
          left: 20,
        };
      case 'bottom-right':
        return {
          ...baseStyles,
          bottom: 50,
          right: 20,
        };
      default:
        return baseStyles;
    }
  };

  return (
    <ToasterContext.Provider value={{ addToast, removeToast }}>
      <View style={[styles.container, getContainerStyles(), style]}>
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={removeToast}
            position={position}
          />
        ))}
      </View>
    </ToasterContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
  },
  toast: {
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 300,
    maxWidth: 400,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  toastIcon: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold as any,
    marginRight: Spacing.sm,
  },
  toastTextContainer: {
    flex: 1,
  },
  toastMessage: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  toastAction: {
    marginLeft: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  toastActionText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as any,
  },
  toastDismiss: {
    marginLeft: Spacing.sm,
    padding: Spacing.xs,
  },
  toastDismissIcon: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.bold as any,
  },
});

export { Toaster };
