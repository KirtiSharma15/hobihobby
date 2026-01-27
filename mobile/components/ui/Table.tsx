import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../constants/designSystem';

interface TableProps {
  children: React.ReactNode;
  style?: any;
  className?: string; // For compatibility with the original API
}

interface TableHeaderProps {
  children: React.ReactNode;
  style?: any;
  className?: string;
}

interface TableBodyProps {
  children: React.ReactNode;
  style?: any;
  className?: string;
}

interface TableFooterProps {
  children: React.ReactNode;
  style?: any;
  className?: string;
}

interface TableRowProps {
  children: React.ReactNode;
  selected?: boolean;
  onPress?: () => void;
  style?: any;
  className?: string;
}

interface TableHeadProps {
  children: React.ReactNode;
  style?: any;
  className?: string;
}

interface TableCellProps {
  children: React.ReactNode;
  style?: any;
  className?: string;
}

interface TableCaptionProps {
  children: React.ReactNode;
  style?: any;
  className?: string;
}

const Table: React.FC<TableProps> = ({ children, style, className }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.tableContainer, { backgroundColor: colors.background }, style]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={[styles.table, { borderColor: colors.border }]}>
          {children}
        </View>
      </ScrollView>
    </View>
  );
};

const TableHeader: React.FC<TableHeaderProps> = ({ children, style, className }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.tableHeader, { borderBottomColor: colors.border }, style]}>
      {children}
    </View>
  );
};

const TableBody: React.FC<TableBodyProps> = ({ children, style, className }) => {
  return (
    <View style={[styles.tableBody, style]}>
      {children}
    </View>
  );
};

const TableFooter: React.FC<TableFooterProps> = ({ children, style, className }) => {
  const { colors } = useTheme();

  return (
    <View 
      style={[
        styles.tableFooter, 
        { 
          backgroundColor: colors.muted + '80', // 50% opacity
          borderTopColor: colors.border 
        }, 
        style
      ]}
    >
      {children}
    </View>
  );
};

const TableRow: React.FC<TableRowProps> = ({ 
  children, 
  selected = false, 
  onPress, 
  style, 
  className 
}) => {
  const { colors } = useTheme();

  const getRowStyles = () => {
    const baseStyles = {
      borderBottomColor: colors.border,
    };

    if (selected) {
      return {
        ...baseStyles,
        backgroundColor: colors.muted,
      };
    }

    return baseStyles;
  };

  const RowComponent = onPress ? View : View;

  return (
    <RowComponent
      style={[
        styles.tableRow,
        getRowStyles(),
        style,
      ]}
      onTouchEnd={onPress}
    >
      {children}
    </RowComponent>
  );
};

const TableHead: React.FC<TableHeadProps> = ({ children, style, className }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.tableHead, { borderColor: colors.border }, style]}>
      <Text style={[
        styles.tableHeadText,
        { 
          color: colors.foreground,
          fontWeight: Typography.fontWeight.medium as any,
        }
      ]}>
        {children}
      </Text>
    </View>
  );
};

const TableCell: React.FC<TableCellProps> = ({ children, style, className }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.tableCell, { borderColor: colors.border }, style]}>
      <Text style={[styles.tableCellText, { color: colors.foreground }]}>
        {children}
      </Text>
    </View>
  );
};

const TableCaption: React.FC<TableCaptionProps> = ({ children, style, className }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.tableCaption, style]}>
      <Text style={[
        styles.tableCaptionText,
        { color: colors.mutedForeground }
      ]}>
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tableContainer: {
    width: '100%',
    position: 'relative',
  },
  table: {
    minWidth: '100%',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  tableHeader: {
    borderBottomWidth: 1,
  },
  tableBody: {
    // No specific styles needed
  },
  tableFooter: {
    borderTopWidth: 1,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    minHeight: 40, // h-10 equivalent
  },
  tableHead: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'flex-start',
    minWidth: 100, // Ensure minimum width for content
  },
  tableHeadText: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'flex-start',
    minWidth: 100, // Ensure minimum width for content
  },
  tableCellText: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  tableCaption: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  tableCaptionText: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
});

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
