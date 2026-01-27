import React, { useState } from 'react';
import { TextInput, View, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../constants/designSystem';

interface TextareaProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  editable?: boolean;
  style?: any;
  className?: string; // For compatibility with the original API
  onFocus?: () => void;
  onBlur?: () => void;
  onEndEditing?: () => void;
  onSubmitEditing?: () => void;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  autoComplete?: string;
  textAlignVertical?: 'auto' | 'top' | 'bottom' | 'center';
  blurOnSubmit?: boolean;
  clearButtonMode?: 'never' | 'while-editing' | 'unless-editing' | 'always';
  contextMenuHidden?: boolean;
  dataDetectorTypes?: string;
  enablesReturnKeyAutomatically?: boolean;
  importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
  lineBreakMode?: 'head' | 'middle' | 'tail' | 'clip';
  maxFontSizeMultiplier?: number;
  minimumFontSize?: number;
  mostRecentEventCount?: number;
  onContentSizeChange?: (event: any) => void;
  onScroll?: (event: any) => void;
  onSelectionChange?: (event: any) => void;
  onTextInput?: (event: any) => void;
  scrollEnabled?: boolean;
  selectTextOnFocus?: boolean;
  selection?: { start: number; end: number };
  selectionColor?: string;
  spellCheck?: boolean;
  textContentType?: string;
  textBreakStrategy?: 'simple' | 'highQuality' | 'balanced';
  underlineColorAndroid?: string;
  secureTextEntry?: boolean;
  passwordRules?: string;
  autoFocus?: boolean;
  caretHidden?: boolean;
  defaultValue?: string;
  keyboardAppearance?: 'default' | 'light' | 'dark';
  showSoftInputOnFocus?: boolean;
  testID?: string;
}

const Textarea: React.FC<TextareaProps> = ({
  value,
  onChangeText,
  placeholder,
  placeholderTextColor,
  disabled = false,
  multiline = true,
  numberOfLines = 4,
  maxLength,
  editable = true,
  style,
  className,
  onFocus,
  onBlur,
  onEndEditing,
  onSubmitEditing,
  returnKeyType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  autoComplete,
  textAlignVertical = 'top',
  blurOnSubmit = false,
  clearButtonMode = 'never',
  contextMenuHidden = false,
  dataDetectorTypes,
  enablesReturnKeyAutomatically = false,
  importantForAccessibility = 'auto',
  keyboardType = 'default',
  lineBreakMode = 'tail',
  maxFontSizeMultiplier,
  minimumFontSize,
  mostRecentEventCount,
  onContentSizeChange,
  onScroll,
  onSelectionChange,
  onTextInput,
  scrollEnabled = true,
  selectTextOnFocus = false,
  selection,
  selectionColor,
  spellCheck = true,
  textContentType,
  textBreakStrategy = 'highQuality',
  underlineColorAndroid = 'transparent',
  secureTextEntry = false,
  passwordRules,
  autoFocus = false,
  caretHidden = false,
  defaultValue,
  keyboardAppearance = 'default',
  showSoftInputOnFocus = true,
  testID,
  ...props
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const getTextareaStyles = () => {
    const baseStyles = {
      borderColor: colors.border,
      backgroundColor: colors.inputBackground || colors.background,
      color: colors.foreground,
    };

    if (isFocused) {
      return {
        ...baseStyles,
        borderColor: colors.ring,
        shadowColor: colors.ring,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
        elevation: 3,
      };
    }

    if (disabled) {
      return {
        ...baseStyles,
        backgroundColor: colors.muted,
        opacity: 0.5,
      };
    }

    return baseStyles;
  };

  const getPlaceholderColor = () => {
    return placeholderTextColor || colors.mutedForeground;
  };

  return (
    <View style={[styles.container, style]}>
      <TextInput
        style={[
          styles.textarea,
          getTextareaStyles(),
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={getPlaceholderColor()}
        multiline={multiline}
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        editable={editable && !disabled}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onEndEditing={onEndEditing}
        onSubmitEditing={onSubmitEditing}
        returnKeyType={returnKeyType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        autoComplete={autoComplete}
        textAlignVertical={textAlignVertical}
        blurOnSubmit={blurOnSubmit}
        clearButtonMode={clearButtonMode}
        contextMenuHidden={contextMenuHidden}
        dataDetectorTypes={dataDetectorTypes}
        enablesReturnKeyAutomatically={enablesReturnKeyAutomatically}
        importantForAccessibility={importantForAccessibility}
        keyboardType={keyboardType}
        lineBreakMode={lineBreakMode}
        maxFontSizeMultiplier={maxFontSizeMultiplier}
        minimumFontSize={minimumFontSize}
        mostRecentEventCount={mostRecentEventCount}
        onContentSizeChange={onContentSizeChange}
        onScroll={onScroll}
        onSelectionChange={onSelectionChange}
        onTextInput={onTextInput}
        scrollEnabled={scrollEnabled}
        selectTextOnFocus={selectTextOnFocus}
        selection={selection}
        selectionColor={selectionColor || colors.primary}
        spellCheck={spellCheck}
        textContentType={textContentType}
        textBreakStrategy={textBreakStrategy}
        underlineColorAndroid={underlineColorAndroid}
        secureTextEntry={secureTextEntry}
        passwordRules={passwordRules}
        autoFocus={autoFocus}
        caretHidden={caretHidden}
        defaultValue={defaultValue}
        keyboardAppearance={keyboardAppearance}
        showSoftInputOnFocus={showSoftInputOnFocus}
        testID={testID}
        accessibilityRole="text"
        accessibilityState={{ disabled: disabled || !editable }}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  textarea: {
    minHeight: 64, // min-h-16 equivalent
    width: '100%',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.base,
    lineHeight: 24,
    textAlignVertical: 'top',
  },
});

export { Textarea };
