import React from 'react';
import { Text, StyleSheet, TouchableOpacity, Linking, Image, View } from 'react-native';

export const BoltBadge = () => {
  const handlePress = () => {
    Linking.openURL('https://bolt.new');
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.buttonContent}>
        <Image 
          source={require('../assets/images/boltlogo.png')} // Update path to your b logo
          style={styles.logo}
        />
        <Text style={styles.buttonText}>
          Powered by Bolt.new
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 2,
    borderColor: '#6366f1',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    width: '100%',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  logo: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});