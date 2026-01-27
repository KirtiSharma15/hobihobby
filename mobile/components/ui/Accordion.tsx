import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../constants/designSystem';

interface AccordionProps {
  children: React.ReactNode;
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
}

interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
}

const Accordion: React.FC<AccordionProps> = ({
  children,
  type = 'single',
  defaultValue,
  value,
  onValueChange,
}) => {
  const [openItems, setOpenItems] = useState<string[]>(
    defaultValue ? (Array.isArray(defaultValue) ? defaultValue : [defaultValue]) : []
  );

  const controlledValue = value ? (Array.isArray(value) ? value : [value]) : null;
  const currentOpenItems = controlledValue || openItems;

  const handleValueChange = (itemValue: string) => {
    let newOpenItems: string[];

    if (type === 'single') {
      newOpenItems = currentOpenItems.includes(itemValue) ? [] : [itemValue];
    } else {
      newOpenItems = currentOpenItems.includes(itemValue)
        ? currentOpenItems.filter(item => item !== itemValue)
        : [...currentOpenItems, itemValue];
    }

    if (!controlledValue) {
      setOpenItems(newOpenItems);
    }

    if (onValueChange) {
      onValueChange(type === 'single' ? newOpenItems[0] || '' : newOpenItems);
    }
  };

  return (
    <View style={styles.accordion}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === AccordionItem) {
          return React.cloneElement(child, {
            isOpen: currentOpenItems.includes(child.props.value),
            onToggle: () => handleValueChange(child.props.value),
          } as any);
        }
        return child;
      })}
    </View>
  );
};

const AccordionItem: React.FC<AccordionItemProps & { isOpen?: boolean; onToggle?: () => void }> = ({
  children,
  className,
  isOpen = false,
  onToggle,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.accordionItem, { borderBottomColor: colors.border }]}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === AccordionTrigger) {
            return React.cloneElement(child, { isOpen, onToggle } as any);
          }
          if (child.type === AccordionContent) {
            return React.cloneElement(child, { isOpen } as any);
          }
        }
        return child;
      })}
    </View>
  );
};

const AccordionTrigger: React.FC<AccordionTriggerProps & { isOpen?: boolean; onToggle?: () => void }> = ({
  children,
  className,
  isOpen = false,
  onToggle,
}) => {
  const { colors } = useTheme();
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isOpen, rotateAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <TouchableOpacity
      style={[
        styles.accordionTrigger,
        {
          backgroundColor: colors.card,
        },
      ]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.triggerContent}>
        <Text style={[styles.triggerText, { color: colors.foreground }]}>
          {children}
        </Text>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Text style={[styles.chevronIcon, { color: colors.mutedForeground }]}>
            ▼
          </Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const AccordionContent: React.FC<AccordionContentProps & { isOpen?: boolean }> = ({
  children,
  className,
  isOpen = false,
}) => {
  const { colors } = useTheme();
  const heightAnim = React.useRef(new Animated.Value(0)).current;
  const [contentHeight, setContentHeight] = useState(0);

  React.useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isOpen, heightAnim]);

  const height = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, contentHeight],
  });

  return (
    <Animated.View
      style={[
        styles.accordionContent,
        {
          height,
          backgroundColor: colors.card,
        },
      ]}
    >
      <View
        style={styles.contentInner}
        onLayout={(event) => {
          const { height: measuredHeight } = event.nativeEvent.layout;
          setContentHeight(measuredHeight);
        }}
      >
        <Text style={[styles.contentText, { color: colors.mutedForeground }]}>
          {children}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  accordion: {
    width: '100%',
  },
  accordionItem: {
    borderBottomWidth: 1,
  },
  accordionTrigger: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  triggerText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as any,
    textAlign: 'left',
  },
  chevronIcon: {
    fontSize: Typography.fontSize.sm,
    marginTop: 2,
  },
  accordionContent: {
    overflow: 'hidden',
  },
  contentInner: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  contentText: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
  },
});

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
