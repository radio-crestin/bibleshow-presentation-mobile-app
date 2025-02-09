import { useState } from 'react';
import { ThemedView } from '@/components/ThemedView';
import { BibleVerseDisplay } from '@/components/BibleVerseDisplay';

export default function HomeScreen() {
  const [verses] = useState([
    {
      text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
      reference: "John 3:16"
    },
    {
      text: "I can do all this through him who gives me strength.",
      reference: "Philippians 4:13"
    },
    {
      text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.",
      reference: "Joshua 1:9"
    }
  ]);

  return (
    <ThemedView style={{ flex: 1 }}>
      <BibleVerseDisplay verses={verses} />
    </ThemedView>
  );
}
