import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { BorderRadius } from '../../constants/designSystem';

interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  style?: any;
  className?: string; // For compatibility with the original API
}

const Switch: React.FC<SwitchProps> = ({
  checked = false,
  onCheckedChange,
  disabled = false,
  style,
  className,
}) => {
  const { colors } = useTheme();
  const [isChecked, setIsChecked] = useState(checked);
  const thumbAnim = useRef(new Animated.Value(checked ? 1 : 0)).current;
  const backgroundAnim = useRef(new Animated.Value(checked ? 1 : 0)).current;

  // Update internal state when checked prop changes
  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  // Animate when checked state changes
  useEffect(() => {
    const toValue = isChecked ? 1 : 0;
    
    Animated.parallel([
      Animated.timing(thumbAnim, {
        toValue,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundAnim, {
        toValue,
        duration: 200,
        useNativeDriver: false, // Background color animation requires useNativeDriver: false
      }),
    ]).start();
  }, [isChecked, thumbAnim, backgroundAnim]);

  const handlePress = () => {
    if (disabled) return;
    
    const newValue = !isChecked;
    setIsChecked(newValue);
    onCheckedChange?.(newValue);
  };

  const getSwitchStyles = () => {
    const baseStyles = {
      borderColor: 'transparent',
      borderRadius: BorderRadius.full,
    };

    if (disabled) {
      return {
        ...baseStyles,
        backgroundColor: colors.muted,
        opacity: 0.5,
      };
    }

    return baseStyles;
  };

  const getThumbStyles = () => {
    const baseStyles = {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.full,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    };

    if (disabled) {
      return {
        ...baseStyles,
        backgroundColor: colors.mutedForeground,
      };
    }

    return baseStyles;
  };

  const getBackgroundColor = () => {
    if (disabled) {
      return colors.muted;
    }

    return backgroundAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.switchBackground || colors.muted, colors.primary],
    });
  };

  const getThumbTranslateX = () => {
    return thumbAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 16], // 32px (w-8) - 16px (size-4) - 2px (border)
    });
  };

  return (
    <TouchableOpacity
      style={[
        styles.switch,
        getSwitchStyles(),
        {
          backgroundColor: getBackgroundColor(),
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
      accessibilityRole="switch"
      accessibilityState={{ checked: isChecked, disabled }}
      accessibilityValue={{ text: isChecked ? 'on' : 'off' }}
    >
      <Animated.View
        style={[
          styles.thumb,
          getThumbStyles(),
          {
            transform: [{ translateX: getThumbTranslateX() }],
          },
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  switch: {
    width: 32, // w-8 equivalent
    height: 18.4, // h-[1.15rem] equivalent
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 2,
  },
  thumb: {
    width: 16, // size-4 equivalent
    height: 16,
  },
});

export { Switch };
