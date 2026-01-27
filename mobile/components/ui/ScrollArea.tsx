import React, { useState, useRef } from 'react';
import { View, ScrollView, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { BorderRadius, Spacing } from '../../constants/designSystem';

interface ScrollAreaProps {
  children: React.ReactNode;
  style?: any;
  className?: string; // For compatibility with the original API
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
}

interface ScrollBarProps {
  orientation?: 'vertical' | 'horizontal';
  style?: any;
  className?: string; // For compatibility with the original API
}

interface ScrollAreaContextType {
  scrollOffset: Animated.Value;
  contentSize: { width: number; height: number };
  viewportSize: { width: number; height: number };
}

const ScrollAreaContext = React.createContext<ScrollAreaContextType>({
  scrollOffset: new Animated.Value(0),
  contentSize: { width: 0, height: 0 },
  viewportSize: { width: 0, height: 0 },
});

const ScrollArea: React.FC<ScrollAreaProps> = ({
  children,
  style,
  className,
  showsVerticalScrollIndicator = false,
  showsHorizontalScrollIndicator = false,
}) => {
  const { colors } = useTheme();
  const scrollOffset = useRef(new Animated.Value(0)).current;
  const [contentSize, setContentSize] = useState({ width: 0, height: 0 });
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollOffset } } }],
    { useNativeDriver: false }
  );

  const handleContentSizeChange = (width: number, height: number) => {
    setContentSize({ width, height });
  };

  const handleLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setViewportSize({ width, height });
  };

  return (
    <ScrollAreaContext.Provider 
      value={{ scrollOffset, contentSize, viewportSize }}
    >
      <View
        style={[
          styles.scrollArea,
          {
            backgroundColor: colors.background,
          },
          style,
        ]}
        onLayout={handleLayout}
      >
        <ScrollView
          style={styles.viewport}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
          onScroll={handleScroll}
          onContentSizeChange={handleContentSizeChange}
          scrollEventThrottle={16}
        >
          {children}
        </ScrollView>
        
        <ScrollBar orientation="vertical" />
        <ScrollBar orientation="horizontal" />
      </View>
    </ScrollAreaContext.Provider>
  );
};

const ScrollBar: React.FC<ScrollBarProps> = ({
  orientation = 'vertical',
  style,
  className,
}) => {
  const { colors } = useTheme();
  const { scrollOffset, contentSize, viewportSize } = React.useContext(ScrollAreaContext);
  const [isVisible, setIsVisible] = useState(false);

  const getScrollBarStyles = () => {
    const baseStyles = {
      backgroundColor: colors.border,
    };

    if (orientation === 'vertical') {
      return {
        ...baseStyles,
        width: 10, // w-2.5 equivalent
        height: '100%',
        borderLeftWidth: 1,
        borderLeftColor: 'transparent',
      };
    } else {
      return {
        ...baseStyles,
        height: 10, // h-2.5 equivalent
        width: '100%',
        borderTopWidth: 1,
        borderTopColor: 'transparent',
      };
    }
  };

  const getThumbStyles = () => {
    const baseStyles = {
      backgroundColor: colors.border,
      borderRadius: BorderRadius.full,
    };

    if (orientation === 'vertical') {
      const maxScroll = Math.max(0, contentSize.height - viewportSize.height);
      const thumbHeight = Math.max(20, (viewportSize.height / contentSize.height) * viewportSize.height);
      const thumbPosition = maxScroll > 0 ? (scrollOffset as any).interpolate({
        inputRange: [0, maxScroll],
        outputRange: [0, viewportSize.height - thumbHeight],
        extrapolate: 'clamp',
      }) : 0;

      return {
        ...baseStyles,
        height: thumbHeight,
        transform: [{ translateY: thumbPosition }],
      };
    } else {
      const maxScroll = Math.max(0, contentSize.width - viewportSize.width);
      const thumbWidth = Math.max(20, (viewportSize.width / contentSize.width) * viewportSize.width);
      const thumbPosition = maxScroll > 0 ? (scrollOffset as any).interpolate({
        inputRange: [0, maxScroll],
        outputRange: [0, viewportSize.width - thumbWidth],
        extrapolate: 'clamp',
      }) : 0;

      return {
        ...baseStyles,
        width: thumbWidth,
        transform: [{ translateX: thumbPosition }],
      };
    }
  };

  // Show scrollbar when content is larger than viewport
  React.useEffect(() => {
    if (orientation === 'vertical') {
      setIsVisible(contentSize.height > viewportSize.height);
    } else {
      setIsVisible(contentSize.width > viewportSize.width);
    }
  }, [contentSize, viewportSize, orientation]);

  if (!isVisible) return null;

  return (
    <View
      style={[
        styles.scrollBar,
        getScrollBarStyles(),
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.scrollThumb,
          getThumbStyles(),
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  scrollArea: {
    position: 'relative',
    flex: 1,
  },
  viewport: {
    flex: 1,
    borderRadius: BorderRadius.md,
  },
  scrollBar: {
    position: 'absolute',
    padding: 1, // p-px equivalent
    touchAction: 'none',
  },
  scrollThumb: {
    flex: 1,
    borderRadius: BorderRadius.full,
  },
});

export { ScrollArea, ScrollBar };
