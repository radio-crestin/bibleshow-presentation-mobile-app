import { useState } from 'react';
import { ThemedView } from '@/components/ThemedView';
import { BibleVerseDisplay } from '@/components/BibleVerseDisplay';

export default function HomeScreen() {
  const [currentBook] = useState("John");
  const [verses] = useState([
    {
      text: "Jesus answered, 'I am the way and the truth and the life. No one comes to the Father except through me.'",
      reference: "14:6"
    },
    {
      text: "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.",
      reference: "14:27"
    },
    {
      text: "Greater love has no one than this: to lay down one's life for one's friends.",
      reference: "15:13"
    }
  ]);

  return (
    <ThemedView style={{ flex: 1 }}>
      <BibleVerseDisplay verses={verses} currentBook={currentBook} />
    </ThemedView>
  );
}
