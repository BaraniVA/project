import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle,
  useAnimatedGestureHandler,
  runOnJS,
  withSpring,
} from 'react-native-reanimated';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { useTheme } from '@/hooks/useTheme';

interface AnimatedSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  label: string;
  step?: number;
}

export function AnimatedSlider({
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 12,
  label,
  step = 0.1,
}: AnimatedSliderProps) {
  const { colors } = useTheme();
  const translateX = useSharedValue(0);
  const sliderWidth = 280;
  const thumbSize = 24;
  const trackWidth = sliderWidth - thumbSize;

  const styles = createStyles(colors);

  // Initialize position based on current value
  useEffect(() => {
    const progress = (value - minimumValue) / (maximumValue - minimumValue);
    translateX.value = withSpring(progress * trackWidth);
  }, [value, minimumValue, maximumValue, trackWidth]);

  const updateValue = (newValue: number) => {
    onValueChange(newValue);
  };

  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { startX: number }
  >({
    onStart: (_, context) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      const newX = Math.max(0, Math.min(trackWidth, context.startX + event.translationX));
      translateX.value = newX;
      
      const progress = newX / trackWidth;
      const newValue = minimumValue + progress * (maximumValue - minimumValue);
      const steppedValue = Math.round(newValue / step) * step;
      const clampedValue = Math.max(minimumValue, Math.min(maximumValue, steppedValue));
      
      runOnJS(updateValue)(clampedValue);
    },
    onEnd: () => {
      // Ensure the thumb snaps to the correct position
      const progress = (value - minimumValue) / (maximumValue - minimumValue);
      translateX.value = withSpring(progress * trackWidth);
    },
  });

  const thumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const trackFillStyle = useAnimatedStyle(() => {
    return {
      width: translateX.value + thumbSize / 2,
    };
  });

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.sliderContainer}>
        <View style={[styles.track, { width: sliderWidth }]}>
          <Animated.View style={[styles.trackFill, trackFillStyle]} />
          <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View style={[styles.thumb, thumbStyle]} />
          </PanGestureHandler>
        </View>
        <Text style={styles.value}>{value.toFixed(1)}h</Text>
      </View>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  sliderContainer: {
    alignItems: 'center',
  },
  track: {
    height: 6,
    backgroundColor: `${colors.surface}60`,
    borderRadius: 3,
    position: 'relative',
    justifyContent: 'center',
  },
  trackFill: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 3,
    position: 'absolute',
    left: 0,
  },
  thumb: {
    position: 'absolute',
    top: -9,
    width: 24,
    height: 24,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
  },
});