import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import YoutubePlayer from 'react-native-youtube-iframe';

interface MediaEmbedProps {
  url: string;
}

export default function MediaEmbed({ url }: MediaEmbedProps) {
  const screenWidth = Dimensions.get('window').width;

  // YouTube detection
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  );

  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    return (
      <View style={styles.embedContainer}>
        <YoutubePlayer
          height={Math.floor((screenWidth - 32) * 9 / 16)}
          videoId={videoId}
          play={false}
        />
      </View>
    );
  }

  // Spotify detection
  const spotifyMatch = url.match(
    /spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/
  );

  if (spotifyMatch) {
    const [, type, id] = spotifyMatch;
    return (
      <View style={styles.spotifyContainer}>
        <WebView
          source={{ uri: `https://open.spotify.com/embed/${type}/${id}` }}
          style={styles.spotifyWebview}
          javaScriptEnabled
          domStorageEnabled
        />
      </View>
    );
  }

  // Instagram detection
  const instagramMatch = url.match(/instagram\.com\/(p|reel|tv)\/([a-zA-Z0-9_-]+)/);

  if (instagramMatch) {
    const [, type, id] = instagramMatch;
    return (
      <View style={styles.instagramContainer}>
        <WebView
          source={{ uri: `https://www.instagram.com/${type}/${id}/embed/` }}
          style={styles.instagramWebview}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
        />
      </View>
    );
  }

  // SoundCloud detection
  if (url.includes('soundcloud.com')) {
    const encodedUrl = encodeURIComponent(url);
    return (
      <View style={styles.soundcloudContainer}>
        <WebView
          source={{
            uri: `https://w.soundcloud.com/player/?url=${encodedUrl}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`,
          }}
          style={styles.soundcloudWebview}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
        />
      </View>
    );
  }

  // Vimeo detection
  const vimeoMatch = url.match(/vimeo\.com\/(?:.*\/)?(\d+)/);

  if (vimeoMatch) {
    const videoId = vimeoMatch[1];
    return (
      <View style={styles.embedContainer}>
        <WebView
          source={{ uri: `https://player.vimeo.com/video/${videoId}` }}
          style={styles.webview}
          allowsFullscreenVideo
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
        />
      </View>
    );
  }

  // Facebook video detection
  const facebookMatch = url.match(/facebook\.com\/.*\/videos\/(\d+)/);

  if (facebookMatch) {
    const videoId = facebookMatch[1];
    return (
      <View style={styles.embedContainer}>
        <WebView
          source={{ uri: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false` }}
          style={styles.webview}
          allowsFullscreenVideo
          javaScriptEnabled
          domStorageEnabled
        />
      </View>
    );
  }

  // Twitter/X detection
  const twitterMatch = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);

  if (twitterMatch) {
    const tweetId = twitterMatch[1];
    return (
      <View style={styles.twitterContainer}>
        <WebView
          source={{ uri: `https://platform.twitter.com/embed/Tweet.html?id=${tweetId}` }}
          style={styles.twitterWebview}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
        />
      </View>
    );
  }

  // Google Maps detection
  const mapsMatch = url.match(/maps\.google\.com|google\.com\/maps/);

  if (mapsMatch) {
    return (
      <View style={styles.mapsContainer}>
        <WebView
          source={{ uri: url }}
          style={styles.mapsWebview}
          javaScriptEnabled
          domStorageEnabled
        />
      </View>
    );
  }

  // For unsupported platforms, return null (markdown will render as link)
  return null;
}

const styles = StyleSheet.create({
  embedContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 8,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
  },
  spotifyContainer: {
    width: '100%',
    height: 152,
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 8,
  },
  spotifyWebview: {
    flex: 1,
  },
  instagramContainer: {
    width: '100%',
    height: 500,
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 8,
  },
  instagramWebview: {
    flex: 1,
  },
  soundcloudContainer: {
    width: '100%',
    height: 166,
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 8,
  },
  soundcloudWebview: {
    flex: 1,
  },
  twitterContainer: {
    width: '100%',
    height: 400,
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 8,
  },
  twitterWebview: {
    flex: 1,
  },
  mapsContainer: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 8,
  },
  mapsWebview: {
    flex: 1,
  },
});
