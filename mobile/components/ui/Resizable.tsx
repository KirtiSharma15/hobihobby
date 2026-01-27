import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, PanGestureHandler, State } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { BorderRadius, Spacing } from '../../constants/designSystem';

interface ResizablePanelGroupProps {
  children: React.ReactNode;
  direction?: 'horizontal' | 'vertical';
  style?: any;
  className?: string; // For compatibility with the original API
}

interface ResizablePanelProps {
  children: React.ReactNode;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  style?: any;
}

interface ResizableHandleProps {
  withHandle?: boolean;
  onResize?: (delta: number) => void;
  style?: any;
  className?: string; // For compatibility with the original API
}

interface ResizableContextType {
  direction: 'horizontal' | 'vertical';
  onResize: (delta: number) => void;
}

const ResizableContext = React.createContext<ResizableContextType>({
  direction: 'horizontal',
  onResize: () => {},
});

const ResizablePanelGroup: React.FC<ResizablePanelGroupProps> = ({
  children,
  direction = 'horizontal',
  style,
  className,
}) => {
  const [panels, setPanels] = useState<{ id: string; size: number }[]>([]);

  const handleResize = (delta: number) => {
    // This would be implemented based on your specific resizing logic
    console.log('Resize delta:', delta);
  };

  return (
    <ResizableContext.Provider value={{ direction, onResize: handleResize }}>
      <View
        style={[
          styles.panelGroup,
          direction === 'vertical' && styles.panelGroupVertical,
          style,
        ]}
      >
        {children}
      </View>
    </ResizableContext.Provider>
  );
};

const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  defaultSize = 100,
  minSize = 0,
  maxSize = 100,
  style,
}) => {
  const { direction } = React.useContext(ResizableContext);

  return (
    <View
      style={[
        styles.panel,
        direction === 'vertical' && styles.panelVertical,
        {
          flex: defaultSize / 100,
          minWidth: direction === 'horizontal' ? minSize : undefined,
          minHeight: direction === 'vertical' ? minSize : undefined,
          maxWidth: direction === 'horizontal' ? maxSize : undefined,
          maxHeight: direction === 'vertical' ? maxSize : undefined,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const ResizableHandle: React.FC<ResizableHandleProps> = ({
  withHandle = false,
  onResize,
  style,
  className,
}) => {
  const { colors } = useTheme();
  const { direction } = React.useContext(ResizableContext);
  const [isDragging, setIsDragging] = useState(false);

  const handleGestureEvent = (event: any) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      setIsDragging(true);
      const delta = direction === 'horizontal' 
        ? event.nativeEvent.translationX 
        : event.nativeEvent.translationY;
      onResize?.(delta);
    } else if (event.nativeEvent.state === State.END) {
      setIsDragging(false);
    }
  };

  return (
    <PanGestureHandler onGestureEvent={handleGestureEvent}>
      <View
        style={[
          styles.handle,
          direction === 'vertical' && styles.handleVertical,
          {
            backgroundColor: colors.border,
          },
          style,
        ]}
      >
        {withHandle && (
          <View
            style={[
              styles.handleGrip,
              {
                backgroundColor: colors.border,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.gripIcon,
                direction === 'vertical' && styles.gripIconVertical,
                {
                  backgroundColor: colors.mutedForeground,
                },
              ]}
            />
          </View>
        )}
      </View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  panelGroup: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    height: '100%',
  },
  panelGroupVertical: {
    flexDirection: 'column',
  },
  panel: {
    flex: 1,
    overflow: 'hidden',
  },
  panelVertical: {
    // Vertical panel specific styles
  },
  handle: {
    width: 1, // w-px equivalent
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  handleVertical: {
    width: '100%',
    height: 1, // h-px equivalent
  },
  handleGrip: {
    width: 12, // w-3 equivalent
    height: 16, // h-4 equivalent
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  gripIcon: {
    width: 10, // size-2.5 equivalent
    height: 10,
    borderRadius: 1,
  },
  gripIconVertical: {
    transform: [{ rotate: '90deg' }],
  },
});

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
