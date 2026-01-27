import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../constants/designSystem';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme, isDark } = useTheme();

  const themes = [
    { key: 'light', label: 'Light' },
    { key: 'dark', label: 'Dark' },
    { key: 'system', label: 'System' },
  ] as const;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: isDark ? '#fbfbfb' : '#030213' }]}>
        Theme: {theme}
      </Text>
      <View style={styles.buttonContainer}>
        {themes.map((themeOption) => (
          <TouchableOpacity
            key={themeOption.key}
            style={[
              styles.button,
              {
                backgroundColor: theme === themeOption.key 
                  ? (isDark ? '#444444' : '#e9ebef') 
                  : 'transparent',
                borderColor: isDark ? '#444444' : '#e9ebef',
              },
            ]}
            onPress={() => setTheme(themeOption.key)}
          >
            <Text
              style={[
                styles.buttonText,
                {
                  color: theme === themeOption.key
                    ? (isDark ? '#fbfbfb' : '#030213')
                    : (isDark ? '#b5b5b5' : '#717182'),
                },
              ]}
            >
              {themeOption.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium as any,
    marginBottom: Spacing.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  button: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as any,
  },
});

export default ThemeToggle;



