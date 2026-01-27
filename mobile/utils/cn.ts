import { StyleSheet } from 'react-native';

type StyleValue = any; // React Native style object type

export function cn(...inputs: StyleValue[]): any {
  return inputs.reduce((merged, current) => {
    if (!current) return merged;
    
    if (Array.isArray(current)) {
      return cn(merged, ...current);
    }
    
    if (typeof current === 'object') {
      return { ...merged, ...current };
    }
    
    return merged;
  }, {});
}

// Alternative implementation for more complex merging
export function mergeStyles(...inputs: StyleValue[]): any {
  const styles = inputs.filter(Boolean);
  
  if (styles.length === 0) return {};
  if (styles.length === 1) return styles[0];
  
  return StyleSheet.flatten(styles);
}

// Utility for conditional styles
export function conditionalStyle(
  condition: boolean,
  trueStyle: StyleValue,
  falseStyle?: StyleValue
): StyleValue {
  return condition ? trueStyle : falseStyle || {};
}

// Utility for responsive styles
export function responsiveStyle(
  isMobile: boolean,
  mobileStyle: StyleValue,
  desktopStyle: StyleValue
): StyleValue {
  return isMobile ? mobileStyle : desktopStyle;
}
