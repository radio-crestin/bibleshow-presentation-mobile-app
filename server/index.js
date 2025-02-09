const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const verses = [
  { text: "In the beginning was the Word, and the Word was with God, and the Word was God.", reference: "1:1" },
  { text: "He was with God in the beginning.", reference: "1:2" },
  { text: "Through him all things were made; without him nothing was made that has been made.", reference: "1:3" },
  { text: "In him was life, and that life was the light of all mankind.", reference: "1:4" },
  { text: "The light shines in the darkness, and the darkness has not overcome it.", reference: "1:5" },
  { text: "The Word became flesh and made his dwelling among us.", reference: "1:14" },
  { text: "For God so loved the world that he gave his one and only Son.", reference: "3:16" },
  { text: "I am the way and the truth and the life.", reference: "14:6" },
  { text: "Peace I leave with you; my peace I give you.", reference: "14:27" },
  { text: "Greater love has no one than this: to lay down one's life for one's friends.", reference: "15:13" }
];

let currentVerseIndex = 4; // Start with verse 1:5

function getVerseGroup(centerIndex) {
  const prevIndex = (centerIndex - 1 + verses.length) % verses.length;
  const nextIndex = (centerIndex + 1) % verses.length;
  return [verses[prevIndex], verses[centerIndex], verses[nextIndex]];
}

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  // Send initial verses
  ws.send(JSON.stringify({
    type: 'verses',
    data: {
      currentBook: 'John',
      verses: getVerseGroup(currentVerseIndex)
    }
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'setReference') {
        const newIndex = verses.findIndex(v => v.reference === data.reference);
        if (newIndex !== -1) {
          currentVerseIndex = newIndex;
          // Broadcast to all clients
          wss.clients.forEach(client => {
            client.send(JSON.stringify({
              type: 'verses',
              data: {
                currentBook: 'John',
                verses: getVerseGroup(currentVerseIndex)
              }
            }));
          });
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
