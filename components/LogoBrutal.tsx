import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface LogoBrutalProps {
  size?: 'small' | 'medium' | 'large';
}

export default function LogoBrutal({ size = 'medium' }: LogoBrutalProps) {
  const containerHeight = 
    size === 'small' ? 40 : 
    size === 'large' ? 100 : 
    70; // medium

  return (
    <View style={[styles.container, { height: containerHeight }]}>
      <View style={styles.logoBox}>
        <Text style={styles.fitText}>FIT</Text>
        <View style={styles.brutalTextBox}>
          <Text style={styles.brutalText}>BRUTAL</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBox: {
    flexDirection: 'row',
    borderWidth: 3,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    width: '90%',
  },
  fitText: {
    fontSize: 36,
    fontWeight: '900',
    fontFamily: 'Helvetica-Bold',
    color: '#000000',
    padding: 5,
    letterSpacing: 1,
  },
  brutalTextBox: {
    backgroundColor: '#D32F2F',
    padding: 5,
  },
  brutalText: {
    fontSize: 36,
    fontWeight: '900',
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
}); 