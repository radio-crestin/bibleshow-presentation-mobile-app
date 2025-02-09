const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const verses = [
  { text: "La început era Cuvântul, și Cuvântul era cu Dumnezeu, și Cuvântul era Dumnezeu.", reference: "1:1" },
  { text: "El era la început cu Dumnezeu.", reference: "1:2" },
  { text: "Toate lucrurile au fost făcute prin El; și nimic din ce a fost făcut n-a fost făcut fără El.", reference: "1:3" },
  { text: "În El era viața, și viața era lumina oamenilor.", reference: "1:4" },
  { text: "Lumina luminează în întuneric, și întunericul n-a biruit-o.", reference: "1:5" },
  { text: "Și Cuvântul S-a făcut trup și a locuit printre noi.", reference: "1:14" },
  { text: "Fiindcă atât de mult a iubit Dumnezeu lumea, că a dat pe singurul Lui Fiu.", reference: "3:16" },
  { text: "Eu sunt calea, adevărul și viața.", reference: "14:6" },
  { text: "Vă las pacea, vă dau pacea Mea.", reference: "14:27" },
  { text: "Nu este mai mare dragoste decât să-și dea cineva viața pentru prietenii săi.", reference: "15:13" }
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
      currentBook: 'Ioan',
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
