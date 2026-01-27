import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { BorderRadius } from '../../constants/designSystem';

interface ProgressProps {
  value?: number;
  max?: number;
  style?: any;
  className?: string; // For compatibility with the original API
}

const Progress: React.FC<ProgressProps> = ({
  value = 0,
  max = 100,
  style,
  className,
}) => {
  const { colors } = useTheme();
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Calculate the percentage
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: percentage,
      duration: 300,
      useNativeDriver: false, // We need to animate width which requires useNativeDriver: false
    }).start();
  }, [percentage, progressAnim]);

  return (
    <View
      style={[
        styles.progress,
        {
          backgroundColor: colors.primary + '20', // 20% opacity
        },
        style,
      ]}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: max,
        now: value,
      }}
    >
      <Animated.View
        style={[
          styles.indicator,
          {
            backgroundColor: colors.primary,
            width: progressAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  progress: {
    position: 'relative',
    height: 8, // h-2 equivalent
    width: '100%',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  indicator: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
});

export { Progress };
