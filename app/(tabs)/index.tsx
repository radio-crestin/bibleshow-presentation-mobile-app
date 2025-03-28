import { useState, useEffect } from 'react';
import { ThemedView } from '@/components/ThemedView';
import { BibleVerseDisplay } from '@/components/BibleVerseDisplay';
import { MicrophoneControl } from '@/components/MicrophoneControl';
import { useSettings } from '@/contexts/SettingsContext';
import { AppHeader } from '@/components/AppHeader';
import { View } from 'react-native';

export default function HomeScreen() {
  const [currentVerse, setCurrentVerse] = useState(null);
  const [verses, setVerses] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { ws, usageMode, isConnected, reConnectWebSocket } = useSettings();

  useEffect(() => {
    if (!ws || usageMode !== 'bible') return;

    const handleMessage = (event: MessageEvent) => {
      console.log({event});
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'verses') {
          setCurrentVerse(data.data.currentVerse);
          setVerses(data.data.verses);
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };

    ws.addEventListener('message', handleMessage);

    // Request verses on connection
    const requestVerses = () => {
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'refresh' }));
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error requesting verses:', error);
        return false;
      }
    };

    // Try to request verses immediately and retry after a delay
    requestVerses();
    const retryTimeout = setTimeout(requestVerses, 1000);
    
    // Set up periodic sync every 5 seconds
    const syncInterval = setInterval(() => {
      if (usageMode === 'bible') {
        if (!requestVerses()) {
          // If request fails, mark as disconnected
          console.log('Periodic verse sync failed, connection may be lost');
        }
      }
    }, 5000);

    return () => {
      ws.removeEventListener('message', handleMessage);
      clearTimeout(retryTimeout);
      clearInterval(syncInterval);
    };
  }, [ws, usageMode]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    reConnectWebSocket();
    setIsRefreshing(false);
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <AppHeader 
        isConnected={isConnected}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        currentReference={currentVerse?.reference || ''}
      />
      {usageMode === 'bible' ? (
        <BibleVerseDisplay verses={verses} currentVerse={currentVerse} />
      ) : (
        <MicrophoneControl />
      )}
    </ThemedView>
  );
}
