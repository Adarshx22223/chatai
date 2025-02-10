import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import axios from 'axios';

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getBotResponse = async (userMessage) => {
    try {
      setIsLoading(true);
      // We'll replace this URL with the actual API endpoint
      const response = await axios.post('/chat', {
        message: userMessage,
        provider: 'deepseek' // or 'openai' or 'gemini'
      });

      const botMessage = {
        _id: Math.round(Math.random() * 1000000),
        text: response.data.choices[0].text,
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'AI Assistant',
          avatar: 'https://placehold.co/100x100?text=AI'
        }
      };

      setMessages(previousMessages => 
        GiftedChat.append(previousMessages, [botMessage])
      );
    } catch (error) {
      console.error('Error getting bot response:', error);
      const errorMessage = {
        _id: Math.round(Math.random() * 1000000),
        text: 'Sorry, I encountered an error. Please try again.',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'AI Assistant',
          avatar: 'https://placehold.co/100x100?text=AI'
        }
      };
      setMessages(previousMessages => 
        GiftedChat.append(previousMessages, [errorMessage])
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onSend = useCallback((newMessages = []) => {
    setMessages(previousMessages => 
      GiftedChat.append(previousMessages, newMessages)
    );

    // Get bot response for the latest message
    if (newMessages[0]) {
      getBotResponse(newMessages[0].text);
    }
  }, []);

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0084ff" />
        </View>
      )}
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{
          _id: 1,
        }}
        renderAvatar={null}
        placeholder="Type a message..."
        alwaysShowSend
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingVertical: 10,
    alignItems: 'center',
  }
});