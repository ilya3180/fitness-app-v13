import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  View,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BrutalButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  uppercase?: boolean;
}

export default function BrutalButton({
  label,
  variant = 'primary',
  icon,
  iconPosition = 'right',
  containerStyle,
  textStyle,
  uppercase = true,
  ...props
}: BrutalButtonProps) {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return '#D32F2F';
      case 'secondary':
        return '#333333';
      case 'outline':
        return 'transparent';
      default:
        return '#D32F2F';
    }
  };

  const getTextColor = () => {
    return variant === 'outline' ? '#000000' : '#FFFFFF';
  };

  const renderIcon = () => {
    if (!icon) return null;
    
    return (
      <Ionicons 
        name={icon} 
        size={20} 
        color={getTextColor()} 
        style={iconPosition === 'left' ? styles.iconLeft : styles.iconRight}
      />
    );
  };

  return (
    <TouchableOpacity 
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        variant === 'outline' && styles.outlineButton,
        containerStyle
      ]}
      {...props}
    >
      {icon && iconPosition === 'left' && renderIcon()}
      <Text 
        style={[
          styles.text, 
          { color: getTextColor() },
          textStyle
        ]}
      >
        {uppercase ? label.toUpperCase() : label}
      </Text>
      {icon && iconPosition === 'right' && renderIcon()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderWidth: 3,
    borderColor: '#000000',
  },
  outlineButton: {
    borderWidth: 3,
    borderColor: '#000000',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
}); 