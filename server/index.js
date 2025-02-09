const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const fs = require('fs');
const xml2js = require('xml2js');
const chokidar = require('chokidar');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const XML_PATH = path.join(__dirname, 'bibleshow.xml');
let currentVerse = null;

// XML parser
const parser = new xml2js.Parser({ explicitArray: false });

async function parseXMLFile() {
  try {
    const xmlContent = await fs.promises.readFile(XML_PATH, 'utf-8');
    const result = await parser.parseStringPromise(xmlContent);
    
    // Extract verse data
    const data = result.BibleShowData;
    return {
      text: data.Scripture.replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
      reference: data.Reference,
      book: data.BookName,
      chapter: data.ChapterNumber,
      verse: data.VerseNumber
    };
  } catch (error) {
    console.error('Error parsing XML:', error);
    return null;
  }
}

// Watch for XML file changes
const watcher = chokidar.watch(XML_PATH, {
  persistent: true,
  usePolling: true,
  interval: 100
});

watcher.on('change', async () => {
  const newVerse = await parseXMLFile();
  if (newVerse) {
    currentVerse = newVerse;
    // Broadcast to all clients
    wss.clients.forEach(client => {
      client.send(JSON.stringify({
        type: 'verses',
        data: {
          currentBook: currentVerse.book,
          verses: [currentVerse, currentVerse, currentVerse] // Same verse for all positions
        }
      }));
    });
  }
});

wss.on('connection', async (ws) => {
  console.log('Client connected');
  
  // Send initial verse if available
  if (currentVerse) {
    ws.send(JSON.stringify({
      type: 'verses',
      data: {
        currentBook: currentVerse.book,
        verses: [currentVerse, currentVerse, currentVerse]
      }
    }));
  }

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'refresh' && currentVerse) {
        ws.send(JSON.stringify({
          type: 'verses',
          data: {
            currentBook: currentVerse.book,
            verses: [currentVerse, currentVerse, currentVerse]
          }
        }));
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
