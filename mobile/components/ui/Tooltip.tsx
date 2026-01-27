import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Animated, Dimensions } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../constants/designSystem';

interface TooltipProviderProps {
  delayDuration?: number;
  children: React.ReactNode;
}

interface TooltipProps {
  children: React.ReactNode;
  delayDuration?: number;
}

interface TooltipTriggerProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
}

interface TooltipContentProps {
  children: React.ReactNode;
  sideOffset?: number;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  style?: any;
  className?: string; // For compatibility with the original API
}

interface TooltipContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  delayDuration: number;
}

const TooltipContext = React.createContext<TooltipContextType | null>(null);

const useTooltip = () => {
  const context = React.useContext(TooltipContext);
  if (!context) {
    throw new Error('useTooltip must be used within a TooltipProvider');
  }
  return context;
};

const TooltipProvider: React.FC<TooltipProviderProps> = ({
  delayDuration = 0,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TooltipContext.Provider value={{ isOpen, setIsOpen, delayDuration }}>
      {children}
    </TooltipContext.Provider>
  );
};

const Tooltip: React.FC<TooltipProps> = ({
  children,
  delayDuration = 0,
}) => {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      {children}
    </TooltipProvider>
  );
};

const TooltipTrigger: React.FC<TooltipTriggerProps> = ({
  children,
  onPress,
  style,
}) => {
  const { setIsOpen, delayDuration } = useTooltip();
  const [triggerLayout, setTriggerLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const handlePress = () => {
    onPress?.();
  };

  const handleLongPress = () => {
    if (delayDuration === 0) {
      setIsOpen(true);
    } else {
      setTimeout(() => setIsOpen(true), delayDuration);
    }
  };

  const handlePressOut = () => {
    if (delayDuration > 0) {
      setTimeout(() => setIsOpen(false), 1000); // Auto hide after 1 second
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={handleLongPress}
      onPressOut={handlePressOut}
      style={style}
      onLayout={(event) => {
        const { x, y, width, height } = event.nativeEvent.layout;
        setTriggerLayout({ x, y, width, height });
      }}
    >
      {children}
    </TouchableOpacity>
  );
};

const TooltipContent: React.FC<TooltipContentProps> = ({
  children,
  sideOffset = 0,
  side = 'top',
  align = 'center',
  style,
  className,
}) => {
  const { colors } = useTheme();
  const { isOpen, setIsOpen } = useTooltip();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const [tooltipLayout, setTooltipLayout] = useState({ width: 0, height: 0 });
  const [triggerLayout, setTriggerLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  useEffect(() => {
    if (isOpen) {
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
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen, fadeAnim, scaleAnim]);

  const getTooltipPosition = () => {
    const tooltipWidth = tooltipLayout.width;
    const tooltipHeight = tooltipLayout.height;
    const triggerX = triggerLayout.x;
    const triggerY = triggerLayout.y;
    const triggerWidth = triggerLayout.width;
    const triggerHeight = triggerLayout.height;

    let left = 0;
    let top = 0;

    switch (side) {
      case 'top':
        left = triggerX + (triggerWidth / 2) - (tooltipWidth / 2);
        top = triggerY - tooltipHeight - sideOffset;
        break;
      case 'bottom':
        left = triggerX + (triggerWidth / 2) - (tooltipWidth / 2);
        top = triggerY + triggerHeight + sideOffset;
        break;
      case 'left':
        left = triggerX - tooltipWidth - sideOffset;
        top = triggerY + (triggerHeight / 2) - (tooltipHeight / 2);
        break;
      case 'right':
        left = triggerX + triggerWidth + sideOffset;
        top = triggerY + (triggerHeight / 2) - (tooltipHeight / 2);
        break;
    }

    // Ensure tooltip stays within screen bounds
    if (left < 0) left = 10;
    if (left + tooltipWidth > screenWidth) left = screenWidth - tooltipWidth - 10;
    if (top < 0) top = 10;
    if (top + tooltipHeight > screenHeight) top = screenHeight - tooltipHeight - 10;

    return { left, top };
  };

  const getArrowPosition = () => {
    const tooltipWidth = tooltipLayout.width;
    const tooltipHeight = tooltipLayout.height;

    switch (side) {
      case 'top':
        return {
          bottom: -6,
          left: tooltipWidth / 2 - 6,
          transform: [{ rotate: '45deg' }],
        };
      case 'bottom':
        return {
          top: -6,
          left: tooltipWidth / 2 - 6,
          transform: [{ rotate: '45deg' }],
        };
      case 'left':
        return {
          right: -6,
          top: tooltipHeight / 2 - 6,
          transform: [{ rotate: '45deg' }],
        };
      case 'right':
        return {
          left: -6,
          top: tooltipHeight / 2 - 6,
          transform: [{ rotate: '45deg' }],
        };
      default:
        return {};
    }
  };

  if (!isOpen) return null;

  const position = getTooltipPosition();
  const arrowPosition = getArrowPosition();

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="none"
      onRequestClose={() => setIsOpen(false)}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={() => setIsOpen(false)}
      >
        <Animated.View
          style={[
            styles.tooltipContent,
            {
              backgroundColor: colors.primary,
              left: position.left,
              top: position.top,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
            style,
          ]}
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            setTooltipLayout({ width, height });
          }}
        >
          <Text style={[styles.tooltipText, { color: colors.primaryForeground }]}>
            {children}
          </Text>
          <View
            style={[
              styles.arrow,
              {
                backgroundColor: colors.primary,
                ...arrowPosition,
              },
            ]}
          />
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  tooltipContent: {
    position: 'absolute',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    maxWidth: 200,
    zIndex: 1001,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tooltipText: {
    fontSize: Typography.fontSize.xs,
    lineHeight: 16,
    textAlign: 'center',
  },
  arrow: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 1,
  },
});

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
