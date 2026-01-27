import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../constants/designSystem';

interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  mode?: 'single' | 'range';
  range?: { from: Date; to: Date };
  onRangeChange?: (range: { from: Date; to: Date }) => void;
  disabled?: Date[];
  className?: string;
}

interface DayProps {
  date: Date;
  isSelected: boolean;
  isToday: boolean;
  isOutside: boolean;
  isDisabled: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isInRange: boolean;
  onPress: () => void;
}

const Calendar: React.FC<CalendarProps> = ({
  selected,
  onSelect,
  mode = 'single',
  range,
  onRangeChange,
  disabled = [],
  className,
}) => {
  const { colors } = useTheme();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    if (mode === 'single' && selected) {
      return date.toDateString() === selected.toDateString();
    }
    if (mode === 'range' && range) {
      return (
        date.toDateString() === range.from.toDateString() ||
        date.toDateString() === range.to.toDateString()
      );
    }
    return false;
  };

  const isInRange = (date: Date) => {
    if (mode === 'range' && range?.from && range?.to) {
      return date >= range.from && date <= range.to;
    }
    return false;
  };

  const isRangeStart = (date: Date) => {
    return mode === 'range' && range?.from && date.toDateString() === range.from.toDateString();
  };

  const isRangeEnd = (date: Date) => {
    return mode === 'range' && range?.to && date.toDateString() === range.to.toDateString();
  };

  const isDisabled = (date: Date) => {
    return disabled.some(disabledDate => disabledDate.toDateString() === date.toDateString());
  };

  const isOutside = (date: Date) => {
    return date.getMonth() !== currentMonth.getMonth();
  };

  const handleDatePress = (date: Date) => {
    if (isDisabled(date)) return;

    if (mode === 'single') {
      onSelect?.(date);
    } else if (mode === 'range') {
      if (!range?.from || (range.from && range.to)) {
        onRangeChange?.({ from: date, to: date });
      } else {
        if (date < range.from) {
          onRangeChange?.({ from: date, to: range.from });
        } else {
          onRangeChange?.({ from: range.from, to: date });
        }
      }
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const generateDays = () => {
    const days = [];
    const totalDays = daysInMonth(currentMonth);
    const firstDay = firstDayOfMonth(currentMonth);
    
    // Add previous month's days
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 0);
    const prevMonthDays = daysInMonth(prevMonth);
    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, prevMonthDays - i);
      days.push(date);
    }
    
    // Add current month's days
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      days.push(date);
    }
    
    // Add next month's days to fill the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, i);
      days.push(date);
    }
    
    return days;
  };

  const Day: React.FC<DayProps> = ({
    date,
    isSelected,
    isToday,
    isOutside,
    isDisabled,
    isRangeStart,
    isRangeEnd,
    isInRange,
    onPress,
  }) => {
    const getDayStyle = () => {
      if (isDisabled) {
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          color: colors.mutedForeground,
          opacity: 0.5,
        };
      }
      if (isSelected) {
        return {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
          color: colors.primaryForeground,
        };
      }
      if (isInRange) {
        return {
          backgroundColor: colors.accent,
          borderColor: colors.accent,
          color: colors.accentForeground,
        };
      }
      if (isToday) {
        return {
          backgroundColor: colors.accent,
          borderColor: colors.accent,
          color: colors.accentForeground,
        };
      }
      if (isOutside) {
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          color: colors.mutedForeground,
        };
      }
      return {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        color: colors.foreground,
      };
    };

    const dayStyle = getDayStyle();

    return (
      <TouchableOpacity
        style={[
          styles.day,
          {
            backgroundColor: dayStyle.backgroundColor,
            borderColor: dayStyle.borderColor,
          },
        ]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.dayText,
            {
              color: dayStyle.color,
              opacity: dayStyle.opacity || 1,
            },
          ]}
        >
          {date.getDate()}
        </Text>
      </TouchableOpacity>
    );
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = generateDays();

  return (
    <View style={[styles.calendar, { backgroundColor: colors.card }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.navButton, { borderColor: colors.border }]}
          onPress={() => navigateMonth('prev')}
          activeOpacity={0.7}
        >
          <Text style={{ color: colors.foreground }}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.monthLabel, { color: colors.foreground }]}>
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>
        <TouchableOpacity
          style={[styles.navButton, { borderColor: colors.border }]}
          onPress={() => navigateMonth('next')}
          activeOpacity={0.7}
        >
          <Text style={{ color: colors.foreground }}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Week days */}
      <View style={styles.weekDays}>
        {weekDays.map((day) => (
          <Text key={day} style={[styles.weekDay, { color: colors.mutedForeground }]}>
            {day}
          </Text>
        ))}
      </View>

      {/* Days grid */}
      <View style={styles.daysGrid}>
        {days.map((date, index) => (
          <Day
            key={index}
            date={date}
            isSelected={isSelected(date)}
            isToday={isToday(date)}
            isOutside={isOutside(date)}
            isDisabled={isDisabled(date)}
            isRangeStart={isRangeStart(date)}
            isRangeEnd={isRangeEnd(date)}
            isInRange={isInRange(date)}
            onPress={() => handleDatePress(date)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  calendar: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  navButton: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium as any,
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.normal as any,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  day: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 1,
  },
  dayText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.normal as any,
  },
});

export { Calendar };
