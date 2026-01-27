import React, { useState, useRef, createContext, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../constants/designSystem';

// OTP Input Context
interface OTPInputContextValue {
  slots: Array<{
    char: string;
    hasFakeCaret: boolean;
    isActive: boolean;
  }>;
  value: string;
  setValue: (value: string) => void;
  maxLength: number;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}

const OTPInputContext = createContext<OTPInputContextValue | null>(null);

const useOTPInputContext = () => {
  const context = useContext(OTPInputContext);
  if (!context) {
    throw new Error('useOTPInputContext must be used within <InputOTP>');
  }
  return context;
};

// Main OTP Input Component
interface InputOTPProps {
  value?: string;
  onChange?: (value: string) => void;
  maxLength?: number;
  disabled?: boolean;
  style?: any;
  containerStyle?: any;
}

const InputOTP: React.FC<InputOTPProps> = ({
  value = '',
  onChange,
  maxLength = 6,
  disabled = false,
  style,
  containerStyle,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<TextInput>(null);

  const handleChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    const newValue = numericValue.slice(0, maxLength);
    onChange?.(newValue);
  };

  const handleFocus = () => {
    setActiveIndex(0);
  };

  const slots = Array.from({ length: maxLength }, (_, index) => ({
    char: value[index] || '',
    hasFakeCaret: index === activeIndex && value.length === index,
    isActive: index === activeIndex,
  }));

  const contextValue: OTPInputContextValue = {
    slots,
    value,
    setValue: handleChange,
    maxLength,
    activeIndex,
    setActiveIndex,
  };

  return (
    <OTPInputContext.Provider value={contextValue}>
      <View style={[styles.container, containerStyle]}>
        <TextInput
          ref={inputRef}
          style={[styles.hiddenInput, style]}
          value={value}
          onChangeText={handleChange}
          onFocus={handleFocus}
          maxLength={maxLength}
          keyboardType="numeric"
          editable={!disabled}
          autoFocus
        />
        <View style={[styles.slotsContainer, { opacity: disabled ? 0.5 : 1 }]}>
          {slots.map((_, index) => (
            <InputOTPSlot key={index} index={index} />
          ))}
        </View>
      </View>
    </OTPInputContext.Provider>
  );
};

// OTP Group Component
interface InputOTPGroupProps {
  children: React.ReactNode;
  style?: any;
}

const InputOTPGroup: React.FC<InputOTPGroupProps> = ({ children, style }) => {
  return (
    <View style={[styles.group, style]}>
      {children}
    </View>
  );
};

// OTP Slot Component
interface InputOTPSlotProps {
  index: number;
  style?: any;
}

const InputOTPSlot: React.FC<InputOTPSlotProps> = ({ index, style }) => {
  const { colors } = useTheme();
  const { slots } = useOTPInputContext();
  const { char, hasFakeCaret, isActive } = slots[index];
  const caretAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (hasFakeCaret) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(caretAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(caretAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      caretAnim.setValue(0);
    }
  }, [hasFakeCaret, caretAnim]);

  const getSlotStyles = () => {
    const baseStyles = {
      backgroundColor: colors.background,
      borderColor: colors.border,
    };

    if (isActive) {
      return {
        ...baseStyles,
        borderColor: colors.ring,
        zIndex: 10,
      };
    }

    return baseStyles;
  };

  return (
    <View
      style={[
        styles.slot,
        getSlotStyles(),
        index === 0 && styles.firstSlot,
        index === slots.length - 1 && styles.lastSlot,
        style,
      ]}
    >
      <Text
        style={[
          styles.slotText,
          {
            color: colors.foreground,
          },
        ]}
      >
        {char}
      </Text>
      {hasFakeCaret && (
        <Animated.View
          style={[
            styles.caret,
            {
              backgroundColor: colors.foreground,
              opacity: caretAnim,
            },
          ]}
        />
      )}
    </View>
  );
};

// OTP Separator Component
interface InputOTPSeparatorProps {
  style?: any;
}

const InputOTPSeparator: React.FC<InputOTPSeparatorProps> = ({ style }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.separator, style]}>
      <Text style={[styles.separatorText, { color: colors.mutedForeground }]}>
        —
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  slotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  slot: {
    width: 36, // h-9 equivalent
    height: 36, // h-9 equivalent
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  firstSlot: {
    borderTopLeftRadius: BorderRadius.md,
    borderBottomLeftRadius: BorderRadius.md,
  },
  lastSlot: {
    borderTopRightRadius: BorderRadius.md,
    borderBottomRightRadius: BorderRadius.md,
  },
  slotText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as any,
  },
  caret: {
    position: 'absolute',
    width: 1,
    height: 16, // h-4 equivalent
  },
  separator: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
  },
  separatorText: {
    fontSize: Typography.fontSize.sm,
  },
});

export {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
  useOTPInputContext,
};
