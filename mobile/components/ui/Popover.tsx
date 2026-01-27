import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, Animated } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../constants/designSystem';

interface PopoverProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface PopoverTriggerProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
}

interface PopoverContentProps {
  children: React.ReactNode;
  visible: boolean;
  onRequestClose: () => void;
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  style?: any;
}

interface PopoverAnchorProps {
  children: React.ReactNode;
  style?: any;
}

const Popover: React.FC<PopoverProps> = ({
  children,
  open = false,
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

const PopoverTrigger: React.FC<PopoverTriggerProps> = ({
  children,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      style={style}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {children}
    </TouchableOpacity>
  );
};

const PopoverContent: React.FC<PopoverContentProps> = ({
  children,
  visible,
  onRequestClose,
  align = 'center',
  sideOffset = 4,
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
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim },
              ],
              marginTop: sideOffset,
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

const PopoverAnchor: React.FC<PopoverAnchorProps> = ({
  children,
  style,
}) => {
  return (
    <View style={style}>
      {children}
    </View>
  );
};

// Hook for managing popover state
export const usePopover = () => {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  return {
    open,
    onOpenChange: handleOpenChange,
  };
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: 288, // w-72 equivalent
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.lg,
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
});

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
};
