import React, { useState, createContext, useContext } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../constants/designSystem';

interface ToggleGroupProps {
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  type?: 'single' | 'multiple';
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
  style?: any;
  className?: string; // For compatibility with the original API
}

interface ToggleGroupItemProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  style?: any;
  className?: string;
}

interface ToggleGroupContextType {
  value: string | string[];
  onValueChange: (value: string) => void;
  type: 'single' | 'multiple';
  variant: 'default' | 'outline';
  size: 'default' | 'sm' | 'lg';
  disabled: boolean;
}

const ToggleGroupContext = createContext<ToggleGroupContextType | null>(null);

const useToggleGroup = () => {
  const context = useContext(ToggleGroupContext);
  if (!context) {
    throw new Error('useToggleGroup must be used within a ToggleGroup component');
  }
  return context;
};

const ToggleGroup: React.FC<ToggleGroupProps> = ({
  value: valueProp,
  onValueChange,
  type = 'single',
  variant = 'default',
  size = 'default',
  disabled = false,
  children,
  style,
  className,
}) => {
  const [internalValue, setInternalValue] = useState<string | string[]>(
    type === 'single' ? '' : []
  );
  const value = valueProp ?? internalValue;

  const handleValueChange = (itemValue: string) => {
    let newValue: string | string[];

    if (type === 'single') {
      newValue = itemValue;
    } else {
      const currentArray = Array.isArray(value) ? value : [];
      if (currentArray.includes(itemValue)) {
        newValue = currentArray.filter(v => v !== itemValue);
      } else {
        newValue = [...currentArray, itemValue];
      }
    }

    if (valueProp === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <ToggleGroupContext.Provider
      value={{
        value,
        onValueChange: handleValueChange,
        type,
        variant,
        size,
        disabled,
      }}
    >
      <View style={[styles.toggleGroup, style]}>
        {children}
      </View>
    </ToggleGroupContext.Provider>
  );
};

const ToggleGroupItem: React.FC<ToggleGroupItemProps> = ({
  value,
  children,
  disabled = false,
  variant: itemVariant,
  size: itemSize,
  style,
  className,
}) => {
  const { colors } = useTheme();
  const { value: groupValue, onValueChange, type, variant, size, disabled: groupDisabled } = useToggleGroup();
  
  const finalVariant = itemVariant || variant;
  const finalSize = itemSize || size;
  const finalDisabled = disabled || groupDisabled;
  
  const isSelected = type === 'single' 
    ? groupValue === value
    : Array.isArray(groupValue) && groupValue.includes(value);

  const handlePress = () => {
    if (!finalDisabled) {
      onValueChange(value);
    }
  };

  const getItemStyles = () => {
    const baseStyles = {
      borderColor: colors.border,
    };

    if (finalVariant === 'outline') {
      return {
        ...baseStyles,
        backgroundColor: isSelected ? colors.accent : 'transparent',
        borderWidth: 1,
      };
    }

    return {
      ...baseStyles,
      backgroundColor: isSelected ? colors.accent : colors.muted,
    };
  };

  const getTextStyles = () => {
    if (isSelected) {
      return {
        color: colors.accentForeground,
        fontWeight: Typography.fontWeight.medium as any,
      };
    }

    return {
      color: colors.mutedForeground,
    };
  };

  const getSizeStyles = () => {
    switch (finalSize) {
      case 'sm':
        return {
          paddingHorizontal: Spacing.sm,
          paddingVertical: Spacing.xs,
          fontSize: Typography.fontSize.xs,
        };
      case 'lg':
        return {
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
          fontSize: Typography.fontSize.lg,
        };
      default:
        return {
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          fontSize: Typography.fontSize.sm,
        };
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.toggleGroupItem,
        getItemStyles(),
        getSizeStyles(),
        {
          opacity: finalDisabled ? 0.5 : 1,
        },
        style,
      ]}
      onPress={handlePress}
      disabled={finalDisabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected, disabled: finalDisabled }}
    >
      <Text style={[styles.toggleGroupItemText, getTextStyles()]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  toggleGroup: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  toggleGroupItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
  toggleGroupItemText: {
    textAlign: 'center',
  },
});

export { ToggleGroup, ToggleGroupItem };
