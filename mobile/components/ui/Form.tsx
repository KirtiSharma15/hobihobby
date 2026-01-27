import React, { createContext, useContext, useId } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Spacing } from '../../constants/designSystem';

// Form context for React Native
interface FormContextValue {
  formState: any;
  getFieldState: (name: string, formState?: any) => any;
}

const FormContext = createContext<FormContextValue | null>(null);

const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};

// Form field context
interface FormFieldContextValue {
  name: string;
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

// Form item context
interface FormItemContextValue {
  id: string;
}

const FormItemContext = createContext<FormItemContextValue | null>(null);

// Form component
interface FormProps {
  children: React.ReactNode;
  formState?: any;
  getFieldState?: (name: string, formState?: any) => any;
}

const Form: React.FC<FormProps> = ({
  children,
  formState = {},
  getFieldState = () => ({}),
}) => {
  return (
    <FormContext.Provider value={{ formState, getFieldState }}>
      {children}
    </FormContext.Provider>
  );
};

// Form field component
interface FormFieldProps {
  name: string;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ name, children }) => {
  return (
    <FormFieldContext.Provider value={{ name }}>
      {children}
    </FormFieldContext.Provider>
  );
};

// Form item component
interface FormItemProps {
  children: React.ReactNode;
  style?: any;
}

const FormItem: React.FC<FormItemProps> = ({ children, style }) => {
  const id = useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <View style={[styles.formItem, style]}>
        {children}
      </View>
    </FormItemContext.Provider>
  );
};

// Form label component
interface FormLabelProps {
  children: React.ReactNode;
  style?: any;
}

const FormLabel: React.FC<FormLabelProps> = ({ children, style }) => {
  const { colors } = useTheme();
  const { error, formItemId } = useFormField();

  return (
    <Text
      style={[
        styles.label,
        {
          color: error ? colors.destructive : colors.foreground,
        },
        style,
      ]}
      accessibilityLabel={formItemId}
    >
      {children}
    </Text>
  );
};

// Form control component
interface FormControlProps {
  children: React.ReactNode;
  style?: any;
}

const FormControl: React.FC<FormControlProps> = ({ children, style }) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  // Clone children and pass form-related props
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        accessibilityLabel: formItemId,
        accessibilityDescribedBy: !error
          ? formDescriptionId
          : `${formDescriptionId} ${formMessageId}`,
        accessibilityInvalid: !!error,
        style: [child.props.style, style],
      } as any);
    }
    return child;
  });

  return <>{enhancedChildren}</>;
};

// Form description component
interface FormDescriptionProps {
  children: React.ReactNode;
  style?: any;
}

const FormDescription: React.FC<FormDescriptionProps> = ({ children, style }) => {
  const { colors } = useTheme();
  const { formDescriptionId } = useFormField();

  return (
    <Text
      style={[
        styles.description,
        {
          color: colors.mutedForeground,
        },
        style,
      ]}
      accessibilityLabel={formDescriptionId}
    >
      {children}
    </Text>
  );
};

// Form message component
interface FormMessageProps {
  children?: React.ReactNode;
  error?: any;
  style?: any;
}

const FormMessage: React.FC<FormMessageProps> = ({ children, error, style }) => {
  const { colors } = useTheme();
  const { error: fieldError, formMessageId } = useFormField();
  
  const message = error?.message || fieldError?.message || children;

  if (!message) {
    return null;
  }

  return (
    <Text
      style={[
        styles.message,
        {
          color: colors.destructive,
        },
        style,
      ]}
      accessibilityLabel={formMessageId}
    >
      {message}
    </Text>
  );
};

// Hook to use form field
const useFormField = () => {
  const fieldContext = useContext(FormFieldContext);
  const itemContext = useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  if (!itemContext) {
    throw new Error('useFormField should be used within <FormItem>');
  }

  const fieldState = getFieldState(fieldContext.name, formState);

  return {
    id: itemContext.id,
    name: fieldContext.name,
    formItemId: `${itemContext.id}-form-item`,
    formDescriptionId: `${itemContext.id}-form-item-description`,
    formMessageId: `${itemContext.id}-form-item-message`,
    error: fieldState?.error,
    ...fieldState,
  };
};

const styles = StyleSheet.create({
  formItem: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as any,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
  },
  description: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
  },
  message: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
  },
});

export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  useFormField,
  useFormContext,
};
