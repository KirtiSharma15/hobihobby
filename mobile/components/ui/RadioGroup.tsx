import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { BorderRadius, Spacing } from '../../constants/designSystem';

interface RadioGroupProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  style?: any;
  className?: string; // For compatibility with the original API
}

interface RadioGroupItemProps {
  value: string;
  disabled?: boolean;
  onPress?: () => void;
  style?: any;
  className?: string; // For compatibility with the original API
}

interface RadioGroupContextType {
  value?: string;
  onValueChange?: (value: string) => void;
}

const RadioGroupContext = React.createContext<RadioGroupContextType>({});

const RadioGroup: React.FC<RadioGroupProps> = ({
  children,
  value,
  onValueChange,
  style,
  className,
}) => {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <View style={[styles.radioGroup, style]}>
        {children}
      </View>
    </RadioGroupContext.Provider>
  );
};

const RadioGroupItem: React.FC<RadioGroupItemProps> = ({
  value,
  disabled = false,
  onPress,
  style,
  className,
}) => {
  const { colors } = useTheme();
  const { value: selectedValue, onValueChange } = React.useContext(RadioGroupContext);
  const [isPressed, setIsPressed] = useState(false);

  const isSelected = selectedValue === value;

  const handlePress = () => {
    if (!disabled && onValueChange) {
      onValueChange(value);
    }
    onPress?.();
  };

  const getRadioStyles = () => {
    const baseStyles = {
      borderColor: colors.border,
      backgroundColor: colors.background,
    };

    if (disabled) {
      return {
        ...baseStyles,
        opacity: 0.5,
      };
    }

    if (isPressed) {
      return {
        ...baseStyles,
        borderColor: colors.ring,
      };
    }

    return baseStyles;
  };

  return (
    <TouchableOpacity
      style={[
        styles.radioItem,
        getRadioStyles(),
        style,
      ]}
      onPress={handlePress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      disabled={disabled}
      activeOpacity={0.8}
      accessibilityRole="radio"
      accessibilityState={{
        checked: isSelected,
        disabled,
      }}
      accessibilityValue={{
        text: value,
      }}
    >
      {isSelected && (
        <View
          style={[
            styles.indicator,
            {
              backgroundColor: colors.primary,
            },
          ]}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  radioGroup: {
    gap: Spacing.md,
  },
  radioItem: {
    width: 16, // size-4 equivalent
    height: 16,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  indicator: {
    width: 8, // size-2 equivalent
    height: 8,
    borderRadius: BorderRadius.full,
  },
});

export { RadioGroup, RadioGroupItem };
