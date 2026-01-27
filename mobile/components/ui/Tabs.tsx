import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../constants/designSystem';

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  style?: any;
  className?: string; // For compatibility with the original API
}

interface TabsListProps {
  children: React.ReactNode;
  style?: any;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  style?: any;
  className?: string;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  style?: any;
  className?: string;
}

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextType | null>(null);

const useTabs = () => {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error('useTabs must be used within a Tabs component');
  }
  return context;
};

const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value: valueProp,
  onValueChange,
  children,
  style,
  className,
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const value = valueProp ?? internalValue;

  const handleValueChange = (newValue: string) => {
    if (valueProp === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <View style={[styles.tabs, style]}>
        {children}
      </View>
    </TabsContext.Provider>
  );
};

const TabsList: React.FC<TabsListProps> = ({ children, style, className }) => {
  const { colors } = useTheme();

  return (
    <View style={[
      styles.tabsList,
      {
        backgroundColor: colors.muted,
      },
      style
    ]}>
      {children}
    </View>
  );
};

const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  children,
  disabled = false,
  style,
  className,
}) => {
  const { colors } = useTheme();
  const { value: selectedValue, onValueChange } = useTabs();
  const isActive = selectedValue === value;
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = () => {
    if (!disabled) {
      onValueChange(value);
    }
  };

  const getTriggerStyles = () => {
    const baseStyles = {
      borderColor: 'transparent',
      borderRadius: BorderRadius.xl,
    };

    if (isActive) {
      return {
        ...baseStyles,
        backgroundColor: colors.card,
        borderColor: colors.border,
      };
    }

    return baseStyles;
  };

  const getTextStyles = () => {
    if (isActive) {
      return {
        color: colors.foreground,
        fontWeight: Typography.fontWeight.medium as any,
      };
    }

    return {
      color: colors.mutedForeground,
    };
  };

  return (
    <TouchableOpacity
      style={[
        styles.tabsTrigger,
        getTriggerStyles(),
        {
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      onPress={handlePress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      disabled={disabled}
      activeOpacity={0.8}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive, disabled }}
    >
      <Text style={[styles.tabsTriggerText, getTextStyles()]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

const TabsContent: React.FC<TabsContentProps> = ({
  value,
  children,
  style,
  className,
}) => {
  const { value: selectedValue } = useTabs();
  const isActive = selectedValue === value;
  const fadeAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(isActive ? 1 : 0.95)).current;

  useEffect(() => {
    if (isActive) {
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
  }, [isActive, fadeAnim, scaleAnim]);

  if (!isActive) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.tabsContent,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'column',
    gap: Spacing.sm,
  },
  tabsList: {
    flexDirection: 'row',
    height: 36, // h-9 equivalent
    borderRadius: BorderRadius.xl,
    padding: 3, // p-[3px] equivalent
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsTrigger: {
    flex: 1,
    height: '100%',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  tabsTriggerText: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  tabsContent: {
    flex: 1,
  },
});

export { Tabs, TabsList, TabsTrigger, TabsContent };
