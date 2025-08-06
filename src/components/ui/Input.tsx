import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface BaseInputProps {
  style?: any;
  className?: string; // Keep for compatibility but won't be used
}

interface InputProps extends BaseInputProps {
  as?: 'input';
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  editable?: boolean;
  maxLength?: number;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  onSubmitEditing?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

interface TextareaProps extends BaseInputProps {
  as: 'textarea';
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  rows?: number;
  editable?: boolean;
  maxLength?: number;
  onFocus?: () => void;
  onBlur?: () => void;
}

interface SelectProps extends BaseInputProps {
  as: 'select';
  selectedValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  enabled?: boolean;
}

type CombinedInputProps = InputProps | TextareaProps | SelectProps;

export function Input({ as = 'input', style, ...props }: CombinedInputProps) {
  if (as === 'textarea') {
    const { 
      value, 
      onChangeText, 
      placeholder, 
      placeholderTextColor = '#9ca3af',
      rows = 4,
      editable = true,
      maxLength,
      onFocus,
      onBlur,
      ...textareaProps 
    } = props as TextareaProps;
    
    return (
      <TextInput
        style={[styles.baseInput, styles.textareaInput, style]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        multiline={true}
        numberOfLines={rows}
        textAlignVertical="top"
        editable={editable}
        maxLength={maxLength}
        onFocus={onFocus}
        onBlur={onBlur}
        {...textareaProps}
      />
    );
  }

  if (as === 'select') {
    const { 
      selectedValue, 
      onValueChange, 
      children, 
      enabled = true,
      ...selectProps 
    } = props as SelectProps;
    
    return (
      <View style={[styles.baseInput, styles.selectContainer, style]}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          enabled={enabled}
          style={styles.picker}
          {...selectProps}
        >
          {children}
        </Picker>
      </View>
    );
  }

  const { 
    value, 
    onChangeText, 
    placeholder, 
    placeholderTextColor = '#9ca3af',
    multiline = false,
    numberOfLines,
    keyboardType = 'default',
    secureTextEntry = false,
    autoCapitalize = 'sentences',
    autoCorrect = true,
    editable = true,
    maxLength,
    returnKeyType = 'done',
    onSubmitEditing,
    onFocus,
    onBlur,
    ...inputProps 
  } = props as InputProps;

  return (
    <TextInput
      style={[styles.baseInput, style]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor}
      multiline={multiline}
      numberOfLines={numberOfLines}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect}
      editable={editable}
      maxLength={maxLength}
      returnKeyType={returnKeyType}
      onSubmitEditing={onSubmitEditing}
      onFocus={onFocus}
      onBlur={onBlur}
      {...inputProps}
    />
  );
}

const styles = StyleSheet.create({
  baseInput: {
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#d1d5db', // var(--color-input-border)
    borderRadius: 6,
    backgroundColor: 'white',
    fontSize: 14,
    color: '#111827', // var(--color-text-default)
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    // Elevation for Android
    elevation: 2,
  },
  textareaInput: {
    minHeight: 80,
  },
  selectContainer: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
    height: 40,
  },
});