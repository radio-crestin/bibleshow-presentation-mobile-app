import { useState, useEffect } from 'react';
import { ThemedView } from '@/components/ThemedView';
import { BibleVerseDisplay } from '@/components/BibleVerseDisplay';
import { MicrophoneControl } from '@/components/MicrophoneControl';
import { useSettings } from '@/contexts/SettingsContext';

export default function HomeScreen() {
  const [currentVerse, setCurrentVerse] = useState(null);
  const [verses, setVerses] = useState([]);
  const { ws, usageMode } = useSettings();

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
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'refresh' }));
      }
    };

    // Try to request verses immediately and retry after a delay
    requestVerses();
    const retryTimeout = setTimeout(requestVerses, 1000);

    return () => {
      ws.removeEventListener('message', handleMessage);
      clearTimeout(retryTimeout);
    };
  }, [ws, usageMode]);

  return (
    <ThemedView style={{ flex: 1 }}>
      {usageMode === 'bible' ? (
        <BibleVerseDisplay verses={verses} currentVerse={currentVerse} />
      ) : (
        <MicrophoneControl />
      )}
    </ThemedView>
  );
}
