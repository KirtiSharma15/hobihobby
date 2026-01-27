import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, PanGestureHandler, State } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../constants/designSystem';

interface SliderProps {
  defaultValue?: number | number[];
  value?: number | number[];
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
  onValueChange?: (value: number | number[]) => void;
  style?: any;
  className?: string; // For compatibility with the original API
}

const Slider: React.FC<SliderProps> = ({
  defaultValue,
  value,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  orientation = 'horizontal',
  onValueChange,
  style,
  className,
}) => {
  const { colors } = useTheme();
  const [values, setValues] = useState<number[]>(() => {
    const initialValue = value ?? defaultValue;
    if (Array.isArray(initialValue)) {
      return initialValue.map(v => Math.max(min, Math.min(max, v)));
    } else if (typeof initialValue === 'number') {
      return [Math.max(min, Math.min(max, initialValue))];
    }
    return [min];
  });

  const trackRef = useRef<View>(null);
  const [trackLayout, setTrackLayout] = useState({ width: 0, height: 0 });

  // Update values when value prop changes
  useEffect(() => {
    if (value !== undefined) {
      const newValues = Array.isArray(value) ? value : [value];
      setValues(newValues.map(v => Math.max(min, Math.min(max, v))));
    }
  }, [value, min, max]);

  const getPositionFromValue = (val: number) => {
    const percentage = (val - min) / (max - min);
    if (orientation === 'horizontal') {
      return percentage * trackLayout.width;
    } else {
      return (1 - percentage) * trackLayout.height;
    }
  };

  const getValueFromPosition = (position: number) => {
    let percentage: number;
    if (orientation === 'horizontal') {
      percentage = position / trackLayout.width;
    } else {
      percentage = 1 - (position / trackLayout.height);
    }
    
    const rawValue = min + (percentage * (max - min));
    const steppedValue = Math.round(rawValue / step) * step;
    return Math.max(min, Math.min(max, steppedValue));
  };

  const handleGestureEvent = (event: any, thumbIndex: number) => {
    if (disabled) return;

    if (event.nativeEvent.state === State.ACTIVE) {
      const position = orientation === 'horizontal' 
        ? event.nativeEvent.x 
        : event.nativeEvent.y;
      
      const newValue = getValueFromPosition(position);
      const newValues = [...values];
      newValues[thumbIndex] = newValue;
      
      // Sort values to maintain order
      newValues.sort((a, b) => a - b);
      
      setValues(newValues);
      onValueChange?.(newValues.length === 1 ? newValues[0] : newValues);
    }
  };

  const getTrackStyles = () => {
    const baseStyles = {
      backgroundColor: colors.muted,
      borderRadius: BorderRadius.full,
    };

    if (orientation === 'horizontal') {
      return {
        ...baseStyles,
        height: 16, // h-4 equivalent
        width: '100%',
      };
    } else {
      return {
        ...baseStyles,
        height: '100%',
        width: 6, // w-1.5 equivalent
        minHeight: 176, // min-h-44 equivalent
      };
    }
  };

  const getRangeStyles = () => {
    const baseStyles = {
      backgroundColor: colors.primary,
      position: 'absolute' as const,
    };

    if (orientation === 'horizontal') {
      const minValue = Math.min(...values);
      const maxValue = Math.max(...values);
      const startPercentage = (minValue - min) / (max - min);
      const endPercentage = (maxValue - min) / (max - min);
      
      return {
        ...baseStyles,
        height: '100%',
        left: `${startPercentage * 100}%`,
        width: `${(endPercentage - startPercentage) * 100}%`,
      };
    } else {
      const minValue = Math.min(...values);
      const maxValue = Math.max(...values);
      const startPercentage = 1 - ((maxValue - min) / (max - min));
      const endPercentage = 1 - ((minValue - min) / (max - min));
      
      return {
        ...baseStyles,
        width: '100%',
        top: `${startPercentage * 100}%`,
        height: `${(endPercentage - startPercentage) * 100}%`,
      };
    }
  };

  const getThumbStyles = (thumbIndex: number) => {
    const baseStyles = {
      backgroundColor: colors.background,
      borderColor: colors.primary,
      borderWidth: 1,
      borderRadius: BorderRadius.full,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
      position: 'absolute' as const,
    };

    const position = getPositionFromValue(values[thumbIndex]);

    if (orientation === 'horizontal') {
      return {
        ...baseStyles,
        width: 16, // size-4 equivalent
        height: 16,
        left: position - 8, // Center the thumb
        top: 0,
      };
    } else {
      return {
        ...baseStyles,
        width: 16,
        height: 16,
        top: position - 8,
        left: -5, // Center the thumb
      };
    }
  };

  return (
    <View
      style={[
        styles.container,
        orientation === 'vertical' && styles.containerVertical,
        { opacity: disabled ? 0.5 : 1 },
        style,
      ]}
    >
      <View
        ref={trackRef}
        style={[styles.track, getTrackStyles()]}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setTrackLayout({ width, height });
        }}
      >
        <View style={[styles.range, getRangeStyles()]} />
        
        {values.map((_, index) => (
          <PanGestureHandler
            key={index}
            onGestureEvent={(event) => handleGestureEvent(event, index)}
            enabled={!disabled}
          >
            <Animated.View
              style={[
                styles.thumb,
                getThumbStyles(index),
              ]}
            />
          </PanGestureHandler>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerVertical: {
    height: '100%',
    minHeight: 176, // min-h-44 equivalent
    flexDirection: 'column',
  },
  track: {
    position: 'relative',
    overflow: 'hidden',
  },
  range: {
    // Styles applied dynamically
  },
  thumb: {
    // Styles applied dynamically
  },
});

export { Slider };
