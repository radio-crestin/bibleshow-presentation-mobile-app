import { useState, useEffect } from 'react';
import { ThemedView } from '@/components/ThemedView';
import { BibleVerseDisplay } from '@/components/BibleVerseDisplay';
import { useSettings } from '@/contexts/SettingsContext';

export default function HomeScreen() {
  const [currentBook, setCurrentBook] = useState("Ioan");
  const [verses, setVerses] = useState([
    { text: "Se încarcă...", reference: "..." },
    { text: "Se încarcă...", reference: "..." },
    { text: "Se încarcă...", reference: "..." }
  ]);
  const { ws } = useSettings();

  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'verses') {
          setCurrentBook(data.data.currentBook);
          setVerses(data.data.verses);
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };
  }, [ws]);

  return (
    <ThemedView style={{ flex: 1 }}>
      <BibleVerseDisplay verses={verses} currentBook={currentBook} />
    </ThemedView>
  );
}
