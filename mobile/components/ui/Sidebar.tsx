import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, ScrollView } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../constants/designSystem';

// Constants
const SIDEBAR_WIDTH = 256; // 16rem equivalent
const SIDEBAR_WIDTH_MOBILE = 288; // 18rem equivalent
const SIDEBAR_WIDTH_ICON = 48; // 3rem equivalent
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

// Types
interface SidebarContextProps {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
}

interface SidebarProviderProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  style?: any;
}

interface SidebarProps {
  children: React.ReactNode;
  side?: 'left' | 'right';
  variant?: 'sidebar' | 'floating' | 'inset';
  collapsible?: 'offcanvas' | 'icon' | 'none';
  style?: any;
}

interface SidebarTriggerProps {
  onPress?: () => void;
  style?: any;
}

interface SidebarRailProps {
  onPress?: () => void;
  style?: any;
}

interface SidebarInsetProps {
  children: React.ReactNode;
  style?: any;
}

interface SidebarHeaderProps {
  children: React.ReactNode;
  style?: any;
}

interface SidebarFooterProps {
  children: React.ReactNode;
  style?: any;
}

interface SidebarContentProps {
  children: React.ReactNode;
  style?: any;
}

interface SidebarGroupProps {
  children: React.ReactNode;
  style?: any;
}

interface SidebarGroupLabelProps {
  children: React.ReactNode;
  style?: any;
}

interface SidebarGroupActionProps {
  onPress?: () => void;
  style?: any;
}

interface SidebarGroupContentProps {
  children: React.ReactNode;
  style?: any;
}

interface SidebarMenuProps {
  children: React.ReactNode;
  style?: any;
}

interface SidebarMenuItemProps {
  children: React.ReactNode;
  style?: any;
}

interface SidebarMenuButtonProps {
  children: React.ReactNode;
  isActive?: boolean;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  tooltip?: string;
  onPress?: () => void;
  style?: any;
}

interface SidebarMenuActionProps {
  onPress?: () => void;
  showOnHover?: boolean;
  style?: any;
}

interface SidebarMenuBadgeProps {
  children: React.ReactNode;
  style?: any;
}

interface SidebarMenuSkeletonProps {
  showIcon?: boolean;
  style?: any;
}

interface SidebarMenuSubProps {
  children: React.ReactNode;
  style?: any;
}

interface SidebarMenuSubItemProps {
  children: React.ReactNode;
  style?: any;
}

interface SidebarMenuSubButtonProps {
  children: React.ReactNode;
  size?: 'sm' | 'md';
  isActive?: boolean;
  onPress?: () => void;
  style?: any;
}

// Context
const SidebarContext = React.createContext<SidebarContextProps | null>(null);

// Hook
function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }
  return context;
}

// Utility hook for mobile detection
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const { width } = Dimensions.get('window');
    setIsMobile(width < 768); // md breakpoint equivalent
    
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setIsMobile(window.width < 768);
    });
    
    return () => subscription?.remove();
  }, []);
  
  return isMobile;
}

// Provider Component
const SidebarProvider: React.FC<SidebarProviderProps> = ({
  children,
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  style,
}) => {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = useState(false);
  const [_open, _setOpen] = useState(defaultOpen);
  
  const open = openProp ?? _open;
  const setOpen = useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === 'function' ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }
    },
    [setOpenProp, open],
  );

  const toggleSidebar = useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
  }, [isMobile, setOpen, setOpenMobile]);

  const state = open ? 'expanded' : 'collapsed';

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <View style={[styles.sidebarWrapper, style]}>
        {children}
      </View>
    </SidebarContext.Provider>
  );
};

// Main Sidebar Component
const Sidebar: React.FC<SidebarProps> = ({
  children,
  side = 'left',
  variant = 'sidebar',
  collapsible = 'offcanvas',
  style,
}) => {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
  const { colors } = useTheme();
  const widthAnim = useRef(new Animated.Value(SIDEBAR_WIDTH)).current;

  useEffect(() => {
    if (collapsible === 'none') return;
    
    const targetWidth = state === 'expanded' ? SIDEBAR_WIDTH : SIDEBAR_WIDTH_ICON;
    Animated.timing(widthAnim, {
      toValue: targetWidth,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [state, widthAnim, collapsible]);

  if (collapsible === 'none') {
    return (
      <View
        style={[
          styles.sidebar,
          {
            backgroundColor: colors.sidebar,
            width: SIDEBAR_WIDTH,
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  if (isMobile) {
    return (
      <View style={styles.mobileContainer}>
        {/* Mobile implementation would use Sheet component */}
        <View
          style={[
            styles.mobileSidebar,
            {
              backgroundColor: colors.sidebar,
              width: SIDEBAR_WIDTH_MOBILE,
            },
          ]}
        >
          {children}
        </View>
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.sidebarContainer,
        {
          backgroundColor: colors.sidebar,
          width: widthAnim,
          [side === 'left' ? 'left' : 'right']: 0,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

// Trigger Component
const SidebarTrigger: React.FC<SidebarTriggerProps> = ({
  onPress,
  style,
}) => {
  const { toggleSidebar } = useSidebar();
  const { colors } = useTheme();

  const handlePress = () => {
    toggleSidebar();
    onPress?.();
  };

  return (
    <TouchableOpacity
      style={[
        styles.trigger,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
        },
        style,
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Text style={styles.triggerIcon}>☰</Text>
    </TouchableOpacity>
  );
};

// Rail Component
const SidebarRail: React.FC<SidebarRailProps> = ({
  onPress,
  style,
}) => {
  const { toggleSidebar } = useSidebar();

  const handlePress = () => {
    toggleSidebar();
    onPress?.();
  };

  return (
    <TouchableOpacity
      style={[styles.rail, style]}
      onPress={handlePress}
      activeOpacity={0.8}
    />
  );
};

// Inset Component
const SidebarInset: React.FC<SidebarInsetProps> = ({
  children,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.inset,
        {
          backgroundColor: colors.background,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

// Header Component
const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  children,
  style,
}) => {
  return (
    <View style={[styles.header, style]}>
      {children}
    </View>
  );
};

// Footer Component
const SidebarFooter: React.FC<SidebarFooterProps> = ({
  children,
  style,
}) => {
  return (
    <View style={[styles.footer, style]}>
      {children}
    </View>
  );
};

// Content Component
const SidebarContent: React.FC<SidebarContentProps> = ({
  children,
  style,
}) => {
  return (
    <ScrollView
      style={[styles.content, style]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
};

// Group Components
const SidebarGroup: React.FC<SidebarGroupProps> = ({
  children,
  style,
}) => {
  return (
    <View style={[styles.group, style]}>
      {children}
    </View>
  );
};

const SidebarGroupLabel: React.FC<SidebarGroupLabelProps> = ({
  children,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <Text
      style={[
        styles.groupLabel,
        {
          color: colors.sidebarForeground + '70',
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

const SidebarGroupAction: React.FC<SidebarGroupActionProps> = ({
  onPress,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.groupAction,
        {
          backgroundColor: colors.sidebarAccent,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.groupActionIcon}>⋯</Text>
    </TouchableOpacity>
  );
};

const SidebarGroupContent: React.FC<SidebarGroupContentProps> = ({
  children,
  style,
}) => {
  return (
    <View style={[styles.groupContent, style]}>
      {children}
    </View>
  );
};

// Menu Components
const SidebarMenu: React.FC<SidebarMenuProps> = ({
  children,
  style,
}) => {
  return (
    <View style={[styles.menu, style]}>
      {children}
    </View>
  );
};

const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({
  children,
  style,
}) => {
  return (
    <View style={[styles.menuItem, style]}>
      {children}
    </View>
  );
};

const SidebarMenuButton: React.FC<SidebarMenuButtonProps> = ({
  children,
  isActive = false,
  variant = 'default',
  size = 'default',
  tooltip,
  onPress,
  style,
}) => {
  const { colors } = useTheme();
  const { state } = useSidebar();

  const getButtonStyles = () => {
    const baseStyles = {
      backgroundColor: 'transparent',
    };

    if (isActive) {
      return {
        ...baseStyles,
        backgroundColor: colors.sidebarAccent,
      };
    }

    return baseStyles;
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { height: 28 };
      case 'lg':
        return { height: 48 };
      default:
        return { height: 32 };
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.menuButton,
        getButtonStyles(),
        getSizeStyles(),
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {children}
    </TouchableOpacity>
  );
};

const SidebarMenuAction: React.FC<SidebarMenuActionProps> = ({
  onPress,
  showOnHover = false,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.menuAction,
        {
          backgroundColor: colors.sidebarAccent,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.menuActionIcon}>⋯</Text>
    </TouchableOpacity>
  );
};

const SidebarMenuBadge: React.FC<SidebarMenuBadgeProps> = ({
  children,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.menuBadge,
        {
          backgroundColor: colors.sidebarAccent,
        },
        style,
      ]}
    >
      <Text style={[styles.menuBadgeText, { color: colors.sidebarAccentForeground }]}>
        {children}
      </Text>
    </View>
  );
};

const SidebarMenuSkeleton: React.FC<SidebarMenuSkeletonProps> = ({
  showIcon = false,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.menuSkeleton, style]}>
      {showIcon && (
        <View
          style={[
            styles.skeletonIcon,
            {
              backgroundColor: colors.border,
            },
          ]}
        />
      )}
      <View
        style={[
          styles.skeletonText,
          {
            backgroundColor: colors.border,
          },
        ]}
      />
    </View>
  );
};

const SidebarMenuSub: React.FC<SidebarMenuSubProps> = ({
  children,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.menuSub,
        {
          borderLeftColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const SidebarMenuSubItem: React.FC<SidebarMenuSubItemProps> = ({
  children,
  style,
}) => {
  return (
    <View style={[styles.menuSubItem, style]}>
      {children}
    </View>
  );
};

const SidebarMenuSubButton: React.FC<SidebarMenuSubButtonProps> = ({
  children,
  size = 'md',
  isActive = false,
  onPress,
  style,
}) => {
  const { colors } = useTheme();

  const getButtonStyles = () => {
    const baseStyles = {
      backgroundColor: 'transparent',
    };

    if (isActive) {
      return {
        ...baseStyles,
        backgroundColor: colors.sidebarAccent,
      };
    }

    return baseStyles;
  };

  const getSizeStyles = () => {
    if (size === 'sm') {
      return { height: 28 };
    }
    return { height: 32 };
  };

  return (
    <TouchableOpacity
      style={[
        styles.menuSubButton,
        getButtonStyles(),
        getSizeStyles(),
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  sidebarWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    height: '100%',
    flexDirection: 'column',
  },
  sidebarContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    zIndex: 10,
    flexDirection: 'column',
  },
  mobileContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
  },
  mobileSidebar: {
    height: '100%',
    flexDirection: 'column',
  },
  trigger: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerIcon: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold as any,
  },
  rail: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 16,
    zIndex: 20,
  },
  inset: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'column',
    gap: Spacing.sm,
    padding: Spacing.sm,
  },
  footer: {
    flexDirection: 'column',
    gap: Spacing.sm,
    padding: Spacing.sm,
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    gap: Spacing.sm,
  },
  group: {
    flexDirection: 'column',
    padding: Spacing.sm,
  },
  groupLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium as any,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  groupAction: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupActionIcon: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold as any,
  },
  groupContent: {
    flexDirection: 'column',
  },
  menu: {
    flexDirection: 'column',
    gap: Spacing.xs,
  },
  menuItem: {
    position: 'relative',
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    minHeight: 32,
  },
  menuAction: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuActionIcon: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold as any,
  },
  menuBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 20,
    height: 20,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
  },
  menuBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium as any,
  },
  menuSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    minHeight: 32,
  },
  skeletonIcon: {
    width: 16,
    height: 16,
    borderRadius: BorderRadius.sm,
  },
  skeletonText: {
    height: 16,
    flex: 1,
    borderRadius: BorderRadius.sm,
  },
  menuSub: {
    marginLeft: Spacing.lg,
    paddingLeft: Spacing.md,
    borderLeftWidth: 1,
    paddingVertical: Spacing.xs,
  },
  menuSubItem: {
    position: 'relative',
  },
  menuSubButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    minHeight: 28,
  },
});

export {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarRail,
  SidebarInset,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
};
