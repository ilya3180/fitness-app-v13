import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  TextInputProps,
  ViewStyle
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BrutalInputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
  showCounter?: boolean;
  maxLength?: number;
}

export default function BrutalInput({
  label,
  error,
  isPassword = false,
  containerStyle,
  showCounter = false,
  maxLength,
  value,
  ...props
}: BrutalInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label.toUpperCase()}</Text>}
      
      <View style={[
        styles.inputContainer, 
        isFocused && styles.inputContainerFocused,
        error && styles.inputContainerError
      ]}>
        <TextInput
          style={styles.input}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={value}
          maxLength={maxLength}
          placeholderTextColor="#AAAAAA"
          {...props}
        />
        
        {isPassword && (
          <TouchableOpacity 
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons 
              name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
              size={24} 
              color="#000000" 
            />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.bottomRow}>
        {error && <Text style={styles.errorText}>{error}</Text>}
        {showCounter && maxLength && (
          <Text style={styles.counter}>
            {value ? value.length : 0}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    fontFamily: 'Helvetica',
  },
  inputContainer: {
    flexDirection: 'row',
    borderWidth: 3,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  inputContainerFocused: {
    borderColor: '#D32F2F',
  },
  inputContainerError: {
    borderColor: '#FF0000',
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Helvetica',
    color: '#000000',
  },
  eyeIcon: {
    padding: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  errorText: {
    color: '#FF0000',
    fontSize: 14,
    fontFamily: 'Helvetica',
  },
  counter: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'Helvetica',
    marginLeft: 'auto',
  },
}); 