import React, { useState, useRef } from 'react';
import { TextInput, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../constants/designSystem';

interface InputProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad' | 'url';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmitEditing?: () => void;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  error?: boolean;
}

const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
  placeholderTextColor,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  editable = true,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  onFocus,
  onBlur,
  onSubmitEditing,
  returnKeyType = 'done',
  style,
  textStyle,
  disabled = false,
  error = false,
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const getInputStyles = () => {
    const baseStyles = {
      backgroundColor: colors.background,
      borderColor: colors.border,
    };

    if (error) {
      return {
        ...baseStyles,
        borderColor: colors.destructive,
      };
    }

    if (isFocused) {
      return {
        ...baseStyles,
        borderColor: colors.ring,
      };
    }

    return baseStyles;
  };

  const getTextStyles = () => {
    const baseTextStyles = {
      color: colors.foreground,
    };

    if (disabled) {
      return {
        ...baseTextStyles,
        color: colors.mutedForeground,
      };
    }

    return baseTextStyles;
  };

  return (
    <TextInput
      ref={inputRef}
      style={[
        styles.input,
        getInputStyles(),
        getTextStyles(),
        style,
        textStyle,
        {
          opacity: disabled ? 0.5 : 1,
          minHeight: multiline ? numberOfLines * 20 : 36, // h-9 equivalent
        },
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor || colors.mutedForeground}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect}
      editable={editable && !disabled}
      multiline={multiline}
      numberOfLines={numberOfLines}
      maxLength={maxLength}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onSubmitEditing={onSubmitEditing}
      returnKeyType={returnKeyType}
      textAlignVertical={multiline ? 'top' : 'center'}
      accessibilityRole="text"
      accessibilityState={{ disabled: disabled || !editable }}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.base,
    textAlignVertical: 'center',
  },
});

export { Input };
