const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

async function handleVerseUpdate() {
  try {
    // Parse local XML file
    const verse = await parseXMLFile();
    
    // Fetch from remote endpoint if configured
    if (config.bibleShowRemoteEndpoint) {
      try {
        const response = await axios.get(config.bibleShowRemoteEndpoint);
        const verses = await parseHtmlResponse(response.data);
        
        if (verses.length > 0) {
          // Use the first verse as current verse for compatibility
          currentVerse = verses[0];
          console.log(`Parsed ${verses.length} verses from remote endpoint`);
          
          // Broadcast all verses
          broadcastVerse({
            currentBook: verses[0].book,
            verses: verses
          });
        }
      } catch (fetchError) {
        console.error('Error fetching remote endpoint:', fetchError.message);
      }
    } else if (verse) {
      currentVerse = verse;
      console.log('Verse updated to:', verse.reference);
      broadcastVerse({
        currentBook: verse.book,
        verses: [verse]
      });
    }
  } catch (error) {
    console.error('Error updating verse:', error);
  }
}
const xml2js = require('xml2js');
const chokidar = require('chokidar');
const path = require('path');
const ip = require('ip');
const os = require('os');

// Load config from executable's directory
let config;
try {
    const configPath = path.join(process.cwd(), 'config.json');
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
} catch (error) {
    console.error('Error loading config.json. Please ensure config.json exists in the same directory as the executable.');
    console.error('Error details:', error);
    process.exit(1);
}

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const XML_PATH = config.xmlPath;
let currentVerse = null;

// XML parser
const parser = new xml2js.Parser({ explicitArray: false });

async function parseHtmlResponse(html) {
  const $ = cheerio.load(html);
  const verses = [];
  
  $('.bibrow').each((i, element) => {
    const $row = $(element);
    const link = $row.find('a').attr('href');
    
    if (link) {
      // Parse reference from href="/VDCC:27:4:19:"
      const [version, bookId, chapter, verse] = link.replace(/[/":]|:$/g, '').split(':').slice(1);
      
      const text = $row.find('.txtver').text();
      
      verses.push({
        text,
        reference: `${bookId} ${chapter}:${verse}`,
        book: bookId,
        chapter,
        verse,
        html: text // Since the sample doesn't have HTML formatting, using text as HTML
      });
    }
  });
  
  return verses;
}

async function parseXMLFile() {
  try {
    const xmlContent = await fs.promises.readFile(XML_PATH, 'utf-8');
    const result = await parser.parseStringPromise(xmlContent);
    
    // Extract verse data
    const data = result.BibleShowData;
    // Strip HTML tags for plain text version
    const plainText = data.Scripture
      .replace(/<[^>]+>/g, '') // Remove HTML tags
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
    
    return {
      text: plainText,
      reference: `${data.BookName} ${data.ChapterNumber}:${data.VerseNumber}`,
      book: data.BookName,
      chapter: data.ChapterNumber,
      verse: data.VerseNumber,
      html: data.Scripture
    };
  } catch (error) {
    console.error('Error parsing XML:', error);
    return null;
  }
}

// Initialize currentVerse
parseXMLFile().then(verse => {
  if (verse) {
    currentVerse = verse;
    console.log('Initial verse loaded:', currentVerse.reference);
  }
});

// Function to broadcast verse to all connected clients
function broadcastVerse(verse) {
  if (!verse) return;
  
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify({
        type: 'verses',
        data: {
          currentBook: verse.book,
          verses: [verse]
        }
      }));
    }
  });
}

// Watch for XML file changes
const watcher = chokidar.watch(XML_PATH, {
  persistent: true,
  usePolling: true,
  interval: 100,
  awaitWriteFinish: {
    stabilityThreshold: 300,
    pollInterval: 100
  },
  ignoreInitial: false
});

watcher
  .on('ready', () => {
    console.log('Initial file scan complete. Ready for changes.');
    console.log('Watching file:', XML_PATH);
  })
  .on('add', async (path) => {
    console.log('File added:', path);
    await handleVerseUpdate();
  })
  .on('change', async (path) => {
    console.log('File changed:', path);
    await handleVerseUpdate();
  })
  .on('unlink', () => {
    console.log('File removed:', XML_PATH);
    currentVerse = null;
  })
  .on('error', error => {
    console.error('Watcher error:', error);
  });

wss.on('connection', async (ws) => {
  console.log('Client connected');
  
  // Send initial verse if available
  if (currentVerse) {
    ws.send(JSON.stringify({
      type: 'verses',
      data: {
        currentBook: currentVerse.book,
        verses: [currentVerse]
      }
    }));
  }

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received message:', {data});
      if (data.type === 'refresh') {
        await handleVerseUpdate();
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });
});

const PORT = process.env.PORT || config.port;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Get and display all external IP addresses
  const networkInterfaces = os.networkInterfaces();
  console.log('\nAvailable IP addresses:');
  
  Object.keys(networkInterfaces).forEach((interfaceName) => {
    const addresses = networkInterfaces[interfaceName];
    addresses.forEach((addr) => {
      if (addr.family === 'IPv4' && !addr.internal) {
        console.log(`${interfaceName}: ${addr.address}`);
      }
    });
  });
  
  console.log(`\nPrimary IP: ${ip.address()}`);
});
