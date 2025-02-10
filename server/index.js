const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const https = require('https');
const fs = require('fs');
const cheerio = require('cheerio');

// Retry configuration
const RETRY_DELAYS = [1000, 2000, 5000]; // Delays in milliseconds
const MAX_RETRIES = 3;

async function withRetry(operation, operationName) {
  let lastError;
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt + 1}/${MAX_RETRIES} failed for ${operationName}:`, error.message);
      
      if (attempt < MAX_RETRIES - 1) {
        const delay = RETRY_DELAYS[attempt];
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`All ${MAX_RETRIES} attempts failed for ${operationName}. Last error: ${lastError.message}`);
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Performing graceful shutdown...');
  shutdown();
});

process.on('SIGINT', () => {
  console.log('Received SIGINT. Performing graceful shutdown...');
  shutdown();
});

function shutdown() {
  // Close the watcher
  if (watcher) {
    watcher.close();
  }
  
  // Close all WebSocket connections
  wss.clients.forEach(client => {
    client.close();
  });
  
  // Close the WebSocket server
  wss.close(() => {
    console.log('WebSocket server closed');
    // Close the HTTP server
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
}

async function handleVerseUpdate() {
  try {
    // Parse local XML file with retry
    currentVerse = await withRetry(
      () => parseXMLFile(),
      'parseXMLFile'
    );
    
    // Fetch from remote endpoint if configured
    if (config.bibleShowRemoteEndpoint && currentVerse) {
      try {
        const response = await withRetry(
          () => new Promise((resolve, reject) => {
            const url = new URL(config.bibleShowRemoteEndpoint);
            const requestModule = url.protocol === 'https:' ? https : http;
            
            requestModule.get(config.bibleShowRemoteEndpoint, (res) => {
              let data = '';
              res.on('data', (chunk) => data += chunk);
              res.on('end', () => resolve(data));
              res.on('error', reject);
            }).on('error', reject);
          }),
          'fetchRemoteEndpoint'
        );
        
        verses = await withRetry(
          () => parseHtmlResponse(response),
          'parseHtmlResponse'
        );
      } catch (fetchError) {
        console.error('Error fetching remote endpoint after all retries:', fetchError.message);
      }
    }

    // Broadcast all verses with retry
    await withRetry(
      () => broadcastVerses({
        currentVerse,
        verses: verses
      }),
      'broadcastVerses'
    );

  } catch (error) {
    console.error('Error updating verse after all retries:', error);
  }
}
const xml2js = require('xml2js');
const chokidar = require('chokidar');
const path = require('path');
const ip = require('ip');
const os = require('os');

// Load config from executable's directory
let config;
let configLoadAttempt = 1;

async function loadConfig() {
    while (true) {
        try {
            const configPath = path.join(process.cwd(), 'config.json');
            const configData = fs.readFileSync(configPath, 'utf-8');
            config = JSON.parse(configData);
            console.log('Successfully loaded config.json');
            return;
        } catch (error) {
            console.error(`Attempt ${configLoadAttempt} failed loading config.json:`, error);
            if (error instanceof SyntaxError) {
                console.error('JSON syntax error detected. Please check config.json format.');
            } else if (error.code === 'ENOENT') {
                console.error('Config file not found. Please ensure config.json exists in the correct location.');
            }
            console.error('Will retry in 1 second...');
            configLoadAttempt++;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

// Load config before starting server
(async () => {
    await loadConfig();
    startServer();
})();

function startServer() {
    const app = express();
    const server = http.createServer(app);
    const wss = new WebSocketServer({ server });

    const XML_PATH = config.xmlPath;
let currentVerse = null;
let verses = [];

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
      const [version, bookId, chapter, verse] = link.replace("/", "").split(':');

      const text = $row.find('.txtver').text();
      
      verses.push({
        text,
        reference: `${currentVerse.book} ${chapter}:${verse}`,
        version: version,
        book: currentVerse.book,
        chapter: currentVerse.chapter,
        verse,
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
    };
  } catch (error) {
    console.error('Error parsing XML:', error);
    return null;
  }
}

// Function to broadcast verse to all connected clients
function broadcastVerses() {  
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify({
        type: 'verses',
        data: {
          currentVerse,
          verses,
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
  ws.send(JSON.stringify({
    type: 'verses',
    data: {
      currentVerse,
      verses
    }
  }));

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
