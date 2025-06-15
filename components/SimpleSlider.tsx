import React from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions } from 'react-native';

interface SimpleSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  label?: string;
}

export function SimpleSlider({
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 12,
  step = 0.1,
  label,
}: SimpleSliderProps) {
  const sliderWidth = 280;
  const thumbSize = 24;
  const trackWidth = sliderWidth - thumbSize;

  const getThumbPosition = () => {
    const progress = (value - minimumValue) / (maximumValue - minimumValue);
    return Math.max(0, Math.min(trackWidth, progress * trackWidth));
  };

  const getValueFromPosition = (position: number) => {
    const progress = position / trackWidth;
    const newValue = minimumValue + progress * (maximumValue - minimumValue);
    const steppedValue = Math.round(newValue / step) * step;
    return Math.max(minimumValue, Math.min(maximumValue, steppedValue));
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      // Start of gesture
    },
    onPanResponderMove: (evt, gestureState) => {
      const currentPosition = getThumbPosition();
      const newPosition = Math.max(0, Math.min(trackWidth, currentPosition + gestureState.dx));
      const newValue = getValueFromPosition(newPosition);
      onValueChange(newValue);
    },
    onPanResponderRelease: () => {
      // End of gesture
    },
  });

  const thumbPosition = getThumbPosition();
  const fillWidth = thumbPosition + thumbSize / 2;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.sliderContainer}>
        <View style={[styles.track, { width: sliderWidth }]}>
          <View style={[styles.trackFill, { width: fillWidth }]} />
          <View
            style={[
              styles.thumb,
              {
                left: thumbPosition,
              },
            ]}
            {...panResponder.panHandlers}
          />
        </View>
        <Text style={styles.value}>{value.toFixed(1)}h</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  sliderContainer: {
    alignItems: 'center',
  },
  track: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    position: 'relative',
    justifyContent: 'center',
  },
  trackFill: {
    height: 6,
    backgroundColor: '#6366f1',
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
    color: '#ffffff',
    marginTop: 12,
  },
});