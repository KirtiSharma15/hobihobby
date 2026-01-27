import React from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../constants/designSystem';

interface AvatarProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

interface AvatarImageProps {
  source: ImageSourcePropType;
  alt?: string;
  className?: string;
}

interface AvatarFallbackProps {
  children: React.ReactNode;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  children,
  size = 'md',
  className,
}) => {
  const { colors } = useTheme();

  const getSize = () => {
    switch (size) {
      case 'sm':
        return 32;
      case 'lg':
        return 48;
      case 'xl':
        return 64;
      default:
        return 40;
    }
  };

  const avatarSize = getSize();

  return (
    <View
      style={[
        styles.avatar,
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
          backgroundColor: colors.muted,
        },
      ]}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === AvatarImage) {
            return React.cloneElement(child, { size: avatarSize } as any);
          }
          if (child.type === AvatarFallback) {
            return React.cloneElement(child, { size: avatarSize } as any);
          }
        }
        return child;
      })}
    </View>
  );
};

const AvatarImage: React.FC<AvatarImageProps & { size?: number }> = ({
  source,
  alt,
  className,
  size = 40,
}) => {
  return (
    <Image
      source={source}
      style={[
        styles.image,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
      resizeMode="cover"
      accessibilityLabel={alt}
    />
  );
};

const AvatarFallback: React.FC<AvatarFallbackProps & { size?: number }> = ({
  children,
  className,
  size = 40,
}) => {
  const { colors } = useTheme();

  const getFontSize = () => {
    switch (size) {
      case 32:
        return Typography.fontSize.sm;
      case 48:
        return Typography.fontSize.lg;
      case 64:
        return Typography.fontSize.xl;
      default:
        return Typography.fontSize.md;
    }
  };

  return (
    <View
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.muted,
        },
      ]}
    >
      <Text
        style={[
          styles.fallbackText,
          {
            color: colors.mutedForeground,
            fontSize: getFontSize(),
          },
        ]}
      >
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    fontWeight: Typography.fontWeight.medium as any,
    textTransform: 'uppercase',
  },
});

export { Avatar, AvatarImage, AvatarFallback };
