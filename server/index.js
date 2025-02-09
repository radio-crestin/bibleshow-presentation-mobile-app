const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const fs = require('fs');
const xml2js = require('xml2js');
const chokidar = require('chokidar');
const path = require('path');

// Load config
let config;
try {
    const configPath = path.join(process.pkg ? process.cwd() : __dirname, 'config.json');
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
} catch (error) {
    console.error('Error loading config.json:', error);
    process.exit(1);
}

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const XML_PATH = path.join(process.cwd(), config.xmlPath);
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

const PORT = process.env.PORT || config.port;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
