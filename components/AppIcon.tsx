import React from 'react';
import { View, StyleSheet } from 'react-native';
import { 
  Zap, 
  Camera, 
  Music, 
  Play, 
  MessageCircle, 
  Hash,
  Gamepad2,
  Tv,
  Youtube
} from 'lucide-react-native';

interface AppIconProps {
  appName: string;
  size?: number;
  color?: string;
}

const iconMap = {
  'TikTok': Zap,
  'Instagram': Camera,
  'Snapchat': Camera,
  'YouTube': Youtube,
  'Netflix': Tv,
  'Spotify': Music,
  'Facebook': Hash,
  'Twitter': Hash,
  'WhatsApp': MessageCircle,
  'Discord': MessageCircle,
  'Games': Gamepad2,
  'Reddit': Hash,
} as const;

export function AppIcon({ appName, size = 24, color = '#ffffff' }: AppIconProps) {
  const IconComponent = iconMap[appName as keyof typeof iconMap] || Hash;
  
  return (
    <View style={[styles.container, { width: size + 8, height: size + 8 }]}>
      <IconComponent size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});