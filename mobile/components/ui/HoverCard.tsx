import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, Animated } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../constants/designSystem';

interface HoverCardProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface HoverCardTriggerProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
}

interface HoverCardPortalProps {
  children: React.ReactNode;
}

interface HoverCardContentProps {
  children: React.ReactNode;
  visible: boolean;
  onRequestClose: () => void;
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}

const HoverCard: React.FC<HoverCardProps> = ({
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

const HoverCardTrigger: React.FC<HoverCardTriggerProps> = ({
  children,
  onPress,
  onLongPress,
}) => {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      {children}
    </TouchableOpacity>
  );
};

const HoverCardPortal: React.FC<HoverCardPortalProps> = ({
  children,
}) => {
  return <>{children}</>;
};

const HoverCardContent: React.FC<HoverCardContentProps> = ({
  children,
  visible,
  onRequestClose,
  align = 'center',
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
            },
          ]}
        >
          {children}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
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
    width: 256, // w-64 equivalent
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
  },
});

export {
  HoverCard,
  HoverCardTrigger,
  HoverCardPortal,
  HoverCardContent,
};
