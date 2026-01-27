import React, { useState } from 'react';
import { View, StyleSheet, ViewStyle, LayoutChangeEvent } from 'react-native';

interface AspectRatioProps {
  ratio?: number;
  children: React.ReactNode;
  style?: ViewStyle;
}

const AspectRatio: React.FC<AspectRatioProps> = ({
  ratio = 16 / 9,
  children,
  style,
}) => {
  const [width, setWidth] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width: newWidth } = event.nativeEvent.layout;
    setWidth(newWidth);
  };

  const height = width / ratio;

  return (
    <View style={[styles.container, style]} onLayout={handleLayout}>
      <View style={[styles.content, { height }]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  content: {
    width: '100%',
    overflow: 'hidden',
  },
});

export { AspectRatio };
