import React, { createContext, useContext, useId } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../constants/designSystem';

// Chart configuration type
export type ChartConfig = {
  [k in string]: {
    label?: string;
    icon?: React.ComponentType;
    color?: string;
    theme?: {
      light: string;
      dark: string;
    };
  };
};

// Chart context type
interface ChartContextType {
  config: ChartConfig;
  chartId: string;
}

const ChartContext = createContext<ChartContextType | null>(null);

const useChart = () => {
  const context = useContext(ChartContext);
  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />');
  }
  return context;
};

// Chart Container Component
interface ChartContainerProps {
  children: React.ReactNode;
  config: ChartConfig;
  id?: string;
  className?: string;
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  children,
  config,
  id,
  className,
}) => {
  const { colors } = useTheme();
  const uniqueId = useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`;

  return (
    <ChartContext.Provider value={{ config, chartId }}>
      <View
        style={[
          styles.chartContainer,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        {children}
      </View>
    </ChartContext.Provider>
  );
};

// Chart Tooltip Component
interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  className?: string;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: 'line' | 'dot' | 'dashed';
  formatter?: (value: any, name: string, props: any) => React.ReactNode;
}

const ChartTooltip: React.FC<ChartTooltipProps> = ({
  active,
  payload,
  label,
  className,
  hideLabel = false,
  hideIndicator = false,
  indicator = 'dot',
  formatter,
}) => {
  const { colors } = useTheme();
  const { config } = useChart();

  if (!active || !payload?.length) {
    return null;
  }

  const getPayloadConfig = (item: any, key: string) => {
    return config[key] || config[item?.dataKey] || config[item?.name];
  };

  const tooltipLabel = !hideLabel && label ? (
    <Text style={[styles.tooltipLabel, { color: colors.foreground }]}>
      {label}
    </Text>
  ) : null;

  return (
    <View
      style={[
        styles.tooltip,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      {tooltipLabel}
      <View style={styles.tooltipContent}>
        {payload.map((item, index) => {
          const key = item.name || item.dataKey || 'value';
          const itemConfig = getPayloadConfig(item, key);
          const indicatorColor = item.color || item.payload?.fill || colors.primary;

          return (
            <View key={item.dataKey} style={styles.tooltipItem}>
              {formatter ? (
                formatter(item.value, item.name, item)
              ) : (
                <>
                  {!hideIndicator && (
                    <View
                      style={[
                        styles.indicator,
                        {
                          backgroundColor: indicatorColor,
                          width: indicator === 'dot' ? 10 : 4,
                          height: indicator === 'dot' ? 10 : 4,
                          borderRadius: indicator === 'dot' ? 5 : 2,
                        },
                      ]}
                    />
                  )}
                  <View style={styles.tooltipItemContent}>
                    <Text style={[styles.tooltipItemLabel, { color: colors.mutedForeground }]}>
                      {itemConfig?.label || item.name}
                    </Text>
                    {item.value && (
                      <Text style={[styles.tooltipItemValue, { color: colors.foreground }]}>
                        {item.value.toLocaleString()}
                      </Text>
                    )}
                  </View>
                </>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

// Chart Legend Component
interface ChartLegendProps {
  payload?: any[];
  className?: string;
  hideIcon?: boolean;
  verticalAlign?: 'top' | 'bottom';
}

const ChartLegend: React.FC<ChartLegendProps> = ({
  payload,
  className,
  hideIcon = false,
  verticalAlign = 'bottom',
}) => {
  const { colors } = useTheme();
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  const getPayloadConfig = (item: any, key: string) => {
    return config[key] || config[item?.dataKey] || config[item?.name];
  };

  return (
    <View
      style={[
        styles.legend,
        verticalAlign === 'top' ? { paddingBottom: Spacing.md } : { paddingTop: Spacing.md },
      ]}
    >
      {payload.map((item) => {
        const key = item.dataKey || 'value';
        const itemConfig = getPayloadConfig(item, key);

        return (
          <View key={item.value} style={styles.legendItem}>
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <View
                style={[
                  styles.legendIndicator,
                  { backgroundColor: item.color },
                ]}
              />
            )}
            <Text style={[styles.legendLabel, { color: colors.foreground }]}>
              {itemConfig?.label || item.value}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

// Chart Tooltip Content Component
const ChartTooltipContent = ChartTooltip;

// Chart Legend Content Component
const ChartLegendContent = ChartLegend;

// Chart Style Component (for React Native, this is a no-op since we use StyleSheet)
const ChartStyle: React.FC<{ id: string; config: ChartConfig }> = () => {
  return null;
};

// Helper function to extract item config from payload
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string,
) {
  if (typeof payload !== 'object' || payload === null) {
    return undefined;
  }

  const payloadPayload =
    'payload' in payload &&
    typeof payload.payload === 'object' &&
    payload.payload !== null
      ? payload.payload
      : undefined;

  let configLabelKey: string = key;

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === 'string'
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === 'string'
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string;
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config];
}

const styles = StyleSheet.create({
  chartContainer: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    aspectRatio: 16 / 9,
    justifyContent: 'center',
  },
  tooltip: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    minWidth: 128,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tooltipLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as any,
    marginBottom: Spacing.xs,
  },
  tooltipContent: {
    gap: Spacing.xs,
  },
  tooltipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tooltipItemContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tooltipItemLabel: {
    fontSize: Typography.fontSize.xs,
  },
  tooltipItemValue: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium as any,
    fontFamily: 'monospace',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: Typography.fontSize.xs,
  },
});

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  useChart,
  getPayloadConfigFromPayload,
};
