import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../constants/designSystem';

interface CollapsibleProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

interface CollapsibleTriggerProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

interface CollapsibleContentProps {
  children: React.ReactNode;
  className?: string;
}

const Collapsible: React.FC<CollapsibleProps> = ({
  children,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  className,
}) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <View style={styles.collapsible}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            isOpen,
            onOpenChange: handleOpenChange,
          } as any);
        }
        return child;
      })}
    </View>
  );
};

const CollapsibleTrigger: React.FC<CollapsibleTriggerProps> = ({
  children,
  className,
  disabled = false,
  isOpen,
  onOpenChange,
}) => {
  const { colors } = useTheme();

  const handlePress = () => {
    if (!disabled && onOpenChange) {
      onOpenChange(!isOpen);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.trigger,
        {
          opacity: disabled ? 0.5 : 1,
        },
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ expanded: isOpen }}
      accessibilityLabel={isOpen ? 'Collapse content' : 'Expand content'}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            isOpen,
          } as any);
        }
        return child;
      })}
    </TouchableOpacity>
  );
};

const CollapsibleContent: React.FC<CollapsibleContentProps> = ({
  children,
  className,
  isOpen,
}) => {
  const { colors } = useTheme();
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const [contentHeight, setContentHeight] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  React.useEffect(() => {
    if (contentHeight > 0) {
      setIsAnimating(true);
      Animated.timing(animatedHeight, {
        toValue: isOpen ? contentHeight : 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setIsAnimating(false);
      });
    }
  }, [isOpen, contentHeight, animatedHeight]);

  const handleContentLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    if (height !== contentHeight) {
      setContentHeight(height);
    }
  };

  return (
    <Animated.View
      style={[
        styles.content,
        {
          height: animatedHeight,
          backgroundColor: colors.card,
          borderColor: colors.border,
          overflow: 'hidden',
        },
      ]}
    >
      <View
        style={styles.contentInner}
        onLayout={handleContentLayout}
      >
        {children}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  collapsible: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  trigger: {
    padding: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    borderTopWidth: 1,
  },
  contentInner: {
    padding: Spacing.lg,
  },
});

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
