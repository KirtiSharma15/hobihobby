import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../constants/designSystem';

interface CommandProps {
  children: React.ReactNode;
  className?: string;
}

interface CommandDialogProps {
  visible: boolean;
  onRequestClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

interface CommandInputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  className?: string;
}

interface CommandListProps {
  children: React.ReactNode;
  className?: string;
}

interface CommandEmptyProps {
  children: React.ReactNode;
}

interface CommandGroupProps {
  heading?: string;
  children: React.ReactNode;
  className?: string;
}

interface CommandSeparatorProps {
  className?: string;
}

interface CommandItemProps {
  children: React.ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  className?: string;
}

interface CommandShortcutProps {
  children: React.ReactNode;
  className?: string;
}

const Command: React.FC<CommandProps> = ({
  children,
  className,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.command,
        {
          backgroundColor: colors.popover,
        },
      ]}
    >
      {children}
    </View>
  );
};

const CommandDialog: React.FC<CommandDialogProps> = ({
  visible,
  onRequestClose,
  title = 'Command Palette',
  description = 'Search for a command to run...',
  children,
}) => {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      onRequestClose={onRequestClose}
      animationType="fade"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.popover,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.dialogHeader}>
            <Text style={[styles.dialogTitle, { color: colors.foreground }]}>
              {title}
            </Text>
            <Text style={[styles.dialogDescription, { color: colors.mutedForeground }]}>
              {description}
            </Text>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
};

const CommandInput: React.FC<CommandInputProps> = ({
  placeholder = 'Search commands...',
  value,
  onChangeText,
  className,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.inputWrapper,
        {
          borderBottomColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.searchIcon, { color: colors.mutedForeground }]}>
        🔍
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            color: colors.foreground,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        value={value}
        onChangeText={onChangeText}
        autoFocus
      />
    </View>
  );
};

const CommandList: React.FC<CommandListProps> = ({
  children,
  className,
}) => {
  return (
    <ScrollView
      style={styles.commandList}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
};

const CommandEmpty: React.FC<CommandEmptyProps> = ({
  children,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.empty}>
      <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
        {children}
      </Text>
    </View>
  );
};

const CommandGroup: React.FC<CommandGroupProps> = ({
  heading,
  children,
  className,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.group}>
      {heading && (
        <Text style={[styles.groupHeading, { color: colors.mutedForeground }]}>
          {heading}
        </Text>
      )}
      <View style={styles.groupContent}>
        {children}
      </View>
    </View>
  );
};

const CommandSeparator: React.FC<CommandSeparatorProps> = ({
  className,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.separator,
        {
          backgroundColor: colors.border,
        },
      ]}
    />
  );
};

const CommandItem: React.FC<CommandItemProps> = ({
  children,
  onSelect,
  disabled = false,
  className,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.item,
        {
          opacity: disabled ? 0.5 : 1,
        },
      ]}
      onPress={onSelect}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      {children}
    </TouchableOpacity>
  );
};

const CommandShortcut: React.FC<CommandShortcutProps> = ({
  children,
  className,
}) => {
  const { colors } = useTheme();

  return (
    <Text style={[styles.shortcut, { color: colors.mutedForeground }]}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  command: {
    flex: 1,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    maxHeight: 600,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dialogHeader: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  dialogTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold as any,
    marginBottom: Spacing.xs,
  },
  dialogDescription: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.sm,
  },
  searchIcon: {
    fontSize: 16,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    padding: 0,
  },
  commandList: {
    maxHeight: 300,
  },
  empty: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
  },
  group: {
    paddingVertical: Spacing.xs,
  },
  groupHeading: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium as any,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  groupContent: {
    gap: Spacing.xs,
  },
  separator: {
    height: 1,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  shortcut: {
    fontSize: Typography.fontSize.xs,
    marginLeft: 'auto',
    letterSpacing: 1,
  },
});

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
