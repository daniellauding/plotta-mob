import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Image } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '../../hooks/useTheme';

interface LinkPreviewProps {
  url: string;
}

export default function LinkPreview({ url }: LinkPreviewProps) {
  const { theme } = useTheme();

  const handlePress = () => {
    Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err));
  };

  // Extract domain and path
  let domain = '';
  let pathname = '';
  let displayTitle = '';
  let iconName: any = 'link';
  let iconColor = theme.colors.mutedForeground;

  try {
    const urlObj = new URL(url);
    domain = urlObj.hostname.replace('www.', '');
    pathname = urlObj.pathname + urlObj.search;
    if (pathname === '/') pathname = '';

    // Enhanced recognition for popular services
    if (domain.includes('maps.google')) {
      displayTitle = 'Google Maps';
      iconName = 'map-marker';
      iconColor = '#4285F4';
    } else if (domain.includes('maps.apple')) {
      displayTitle = 'Apple Maps';
      iconName = 'map-marker';
      iconColor = '#000';
    } else if (domain.includes('facebook.com') || domain.includes('fb.com')) {
      displayTitle = 'Facebook';
      iconName = 'facebook-square';
      iconColor = '#1877F2';
    } else if (domain.includes('twitter.com') || domain.includes('x.com')) {
      displayTitle = 'Twitter/X';
      iconName = 'twitter';
      iconColor = '#1DA1F2';
    } else if (domain.includes('linkedin.com')) {
      displayTitle = 'LinkedIn';
      iconName = 'linkedin-square';
      iconColor = '#0A66C2';
    } else if (domain.includes('github.com')) {
      displayTitle = 'GitHub';
      iconName = 'github';
      iconColor = '#333';
    } else if (domain.includes('reddit.com')) {
      displayTitle = 'Reddit';
      iconName = 'reddit-square';
      iconColor = '#FF4500';
    } else if (domain.includes('tiktok.com')) {
      displayTitle = 'TikTok';
      iconName = 'music';
      iconColor = '#000';
    } else {
      displayTitle = domain;
    }
  } catch (error) {
    domain = url;
    displayTitle = url;
  }

  // Get favicon URL using Google's favicon service
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

  return (
    <TouchableOpacity
      style={[styles.container, {
        backgroundColor: theme.colors.muted,
        borderColor: theme.colors.border,
      }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <FontAwesome
            name={iconName}
            size={20}
            color={iconColor}
            style={styles.serviceIcon}
          />
        </View>
        <View style={styles.textContainer}>
          <Text
            style={[styles.domain, { color: theme.colors.foreground }]}
            numberOfLines={1}
          >
            {displayTitle}
          </Text>
          {pathname ? (
            <Text
              style={[styles.path, { color: theme.colors.mutedForeground }]}
              numberOfLines={1}
            >
              {pathname}
            </Text>
          ) : null}
        </View>
        <FontAwesome
          name="external-link"
          size={14}
          color={theme.colors.mutedForeground}
          style={styles.icon}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 8,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceIcon: {
    // Icon styling
  },
  textContainer: {
    flex: 1,
  },
  domain: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  path: {
    fontSize: 12,
  },
  icon: {
    marginLeft: 8,
  },
});
