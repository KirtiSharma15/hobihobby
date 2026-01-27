import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../constants/designSystem';
import { Button } from './Button';

interface CarouselProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  showsIndicators?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

interface CarouselContentProps {
  children: React.ReactNode;
  className?: string;
}

interface CarouselItemProps {
  children: React.ReactNode;
  className?: string;
}

interface CarouselPreviousProps {
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
}

interface CarouselNextProps {
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
}

interface CarouselContextType {
  currentIndex: number;
  totalSlides: number;
  scrollToIndex: (index: number) => void;
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  orientation: 'horizontal' | 'vertical';
}

const CarouselContext = React.createContext<CarouselContextType | null>(null);

const useCarousel = () => {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />');
  }
  return context;
};

const Carousel: React.FC<CarouselProps> = ({
  children,
  orientation = 'horizontal',
  showsIndicators = false,
  autoPlay = false,
  autoPlayInterval = 3000,
  className,
}) => {
  const { colors } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalSlides, setTotalSlides] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const scrollToIndex = useCallback((index: number) => {
    if (scrollViewRef.current && containerWidth > 0) {
      const offset = index * containerWidth;
      scrollViewRef.current.scrollTo({
        x: orientation === 'horizontal' ? offset : 0,
        y: orientation === 'vertical' ? offset : 0,
        animated: true,
      });
    }
  }, [containerWidth, orientation]);

  const scrollPrev = useCallback(() => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }
  }, [currentIndex, scrollToIndex]);

  const scrollNext = useCallback(() => {
    if (currentIndex < totalSlides - 1) {
      scrollToIndex(currentIndex + 1);
    }
  }, [currentIndex, totalSlides, scrollToIndex]);

  const canScrollPrev = currentIndex > 0;
  const canScrollNext = currentIndex < totalSlides - 1;

  const handleScroll = useCallback((event: any) => {
    const offset = orientation === 'horizontal' ? event.nativeEvent.contentOffset.x : event.nativeEvent.contentOffset.y;
    const index = Math.round(offset / containerWidth);
    setCurrentIndex(index);
  }, [containerWidth, orientation]);

  const handleContentLayout = useCallback((event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setContentWidth(orientation === 'horizontal' ? width : height);
  }, [orientation]);

  const handleContainerLayout = useCallback((event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerWidth(orientation === 'horizontal' ? width : height);
  }, [orientation]);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || totalSlides <= 1) return;

    const interval = setInterval(() => {
      if (currentIndex === totalSlides - 1) {
        scrollToIndex(0);
      } else {
        scrollNext();
      }
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, currentIndex, totalSlides, scrollToIndex, scrollNext]);

  // Count total slides
  useEffect(() => {
    const slides = React.Children.count(children);
    setTotalSlides(slides);
  }, [children]);

  const contextValue: CarouselContextType = {
    currentIndex,
    totalSlides,
    scrollToIndex,
    scrollPrev,
    scrollNext,
    canScrollPrev,
    canScrollNext,
    orientation,
  };

  return (
    <CarouselContext.Provider value={contextValue}>
      <View
        style={[
          styles.carousel,
          { backgroundColor: colors.card },
        ]}
        onLayout={handleContainerLayout}
      >
        <ScrollView
          ref={scrollViewRef}
          horizontal={orientation === 'horizontal'}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          pagingEnabled
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onLayout={handleContentLayout}
          style={styles.scrollView}
        >
          {children}
        </ScrollView>

        {showsIndicators && totalSlides > 1 && (
          <View style={styles.indicators}>
            {Array.from({ length: totalSlides }).map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.indicator,
                  {
                    backgroundColor: index === currentIndex ? colors.primary : colors.muted,
                  },
                ]}
                onPress={() => scrollToIndex(index)}
              />
            ))}
          </View>
        )}
      </View>
    </CarouselContext.Provider>
  );
};

const CarouselContent: React.FC<CarouselContentProps> = ({
  children,
  className,
}) => {
  return (
    <View style={styles.carouselContent}>
      {children}
    </View>
  );
};

const CarouselItem: React.FC<CarouselItemProps> = ({
  children,
  className,
}) => {
  const { orientation } = useCarousel();

  return (
    <View
      style={[
        styles.carouselItem,
        orientation === 'horizontal' ? { width: Dimensions.get('window').width } : { height: 200 },
      ]}
    >
      {children}
    </View>
  );
};

const CarouselPrevious: React.FC<CarouselPreviousProps> = ({
  onPress,
  disabled,
  className,
}) => {
  const { scrollPrev, canScrollPrev } = useCarousel();

  return (
    <Button
      variant="outline"
      size="icon"
      onPress={onPress || scrollPrev}
      disabled={disabled || !canScrollPrev}
      style={styles.navigationButton}
    >
      <Text style={styles.navigationIcon}>‹</Text>
    </Button>
  );
};

const CarouselNext: React.FC<CarouselNextProps> = ({
  onPress,
  disabled,
  className,
}) => {
  const { scrollNext, canScrollNext } = useCarousel();

  return (
    <Button
      variant="outline"
      size="icon"
      onPress={onPress || scrollNext}
      disabled={disabled || !canScrollNext}
      style={[styles.navigationButton, styles.nextButton]}
    >
      <Text style={styles.navigationIcon}>›</Text>
    </Button>
  );
};

const styles = StyleSheet.create({
  carousel: {
    position: 'relative',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  carouselContent: {
    flex: 1,
  },
  carouselItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigationButton: {
    position: 'absolute',
    top: '50%',
    left: Spacing.md,
    transform: [{ translateY: -20 }],
    width: 32,
    height: 32,
    borderRadius: 16,
    zIndex: 10,
  },
  nextButton: {
    left: undefined,
    right: Spacing.md,
  },
  navigationIcon: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold as any,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  useCarousel,
};
