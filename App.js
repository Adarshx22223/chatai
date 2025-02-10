import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import ChatScreen from './screens/ChatScreen';

export default function App() {
  return (
    <View style={styles.container}>
      <ChatScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    ...(Platform.OS === 'web' ? {
      maxWidth: 600,
      width: '100%',
      marginHorizontal: 'auto',
    } : {})
  },
});