import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
  style?: any;
  className?: string; // For compatibility with the original API
}

const Separator: React.FC<SeparatorProps> = ({
  orientation = 'horizontal',
  decorative = true,
  style,
  className,
}) => {
  const { colors } = useTheme();

  const getSeparatorStyles = () => {
    const baseStyles = {
      backgroundColor: colors.border,
    };

    if (orientation === 'horizontal') {
      return {
        ...baseStyles,
        height: 1, // h-px equivalent
        width: '100%',
      };
    } else {
      return {
        ...baseStyles,
        height: '100%',
        width: 1, // w-px equivalent
      };
    }
  };

  return (
    <View
      style={[
        styles.separator,
        getSeparatorStyles(),
        style,
      ]}
      accessibilityRole={decorative ? 'none' : 'separator'}
      accessibilityLabel={decorative ? undefined : 'Separator'}
    />
  );
};

const styles = StyleSheet.create({
  separator: {
    flexShrink: 0,
  },
});

export { Separator };
