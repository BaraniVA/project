import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, TouchableOpacity, Linking, Image, View, Animated } from 'react-native';

interface BoltBadgeProps {
  position?: 'inline' | 'fixed';
}

export const BoltBadge = ({ position = 'inline' }: BoltBadgeProps) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Intro animation - fade in with slight rotation
    const introAnimation = Animated.sequence([
      Animated.delay(1000), // 1 second delay
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]);

    introAnimation.start();
  }, []);

  const handlePress = () => {
    Linking.openURL('https://bolt.new/?rid=os72mi');
  };

  const handlePressIn = () => {
    // Hover-like animation on press
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1, 1.2],
    outputRange: ['-90deg', '0deg', '22deg'],
  });

  const containerStyle = position === 'fixed' 
    ? [styles.fixedContainer, { opacity: fadeAnim }]
    : [styles.button, { opacity: fadeAnim }];

  const imageStyle = position === 'fixed' 
    ? styles.fixedLogo 
    : styles.logo;

  const animatedStyle = {
    transform: [
      { rotate },
      { scale: scaleAnim },
    ],
  };

  if (position === 'fixed') {
    return (
      <Animated.View style={containerStyle}>
        <TouchableOpacity 
          onPress={handlePress} 
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
          style={styles.fixedButton}
        >
          <Animated.Image 
            source={{ uri: 'https://storage.bolt.army/white_circle_360x360.png' }}
            style={[imageStyle, animatedStyle]}
          />
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={containerStyle}>
      <TouchableOpacity 
        style={styles.buttonContent} 
        onPress={handlePress} 
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <View style={styles.buttonContentInner}>
          <Animated.Image 
            source={require('../assets/images/boltlogo.png')}
            style={[styles.logo, animatedStyle]}
          />
          <Text style={styles.buttonText}>
            Powered by Bolt.new
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
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
  },
  buttonContentInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
  fixedContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1000,
  },
  fixedButton: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fixedLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    resizeMode: 'contain',
  },
});