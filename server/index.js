const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const https = require('https');
const fs = require('fs');
const cheerio = require('cheerio');
const OBSWebSocket = require('obs-websocket-js').default;
const url = require('url');

// Retry configuration
const RETRY_DELAYS = [1000, 2000, 5000]; // Delays in milliseconds
const MAX_RETRIES = 3;

async function withRetry(operation, operationName) {
  let lastError;
  
  for (let attempt = 0; ; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt + 1}/${MAX_RETRIES} failed for ${operationName}:`, error.message);

      const delay = RETRY_DELAYS[attempt] || 5000;
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error(`All ${MAX_RETRIES} attempts failed for ${operationName}. Last error: ${lastError.message}`);
}

// Connect to OBS WebSocket
async function connectToOBS() {
  if (!config.obs || !config.obs.address) {
    console.log('OBS WebSocket configuration not found, skipping connection');
    return;
  }

  try {
    const [host, port] = config.obs.address.split(':');
    
    await obs.connect(`ws://${config.obs.address}`, config.obs.password);
    console.log('Connected to OBS WebSocket server');
    obsConnected = true;
    
    // Get initial scene information
    await updateOBSSceneInfo();
    
    // Set up event listeners
    obs.on('CurrentProgramSceneChanged', async (data) => {
      console.log('OBS scene changed:', data.sceneName);
      currentScene = data.sceneName;
      
      console.log(`Current scene: ${currentScene}`);
      
      // Automatically set microphone state based on scene
      if (currentScene === 'solo' && microphoneState !== 'on') {
        microphoneState = 'on';
        console.log('Microphone automatically turned on due to "solo" scene');
        broadcastMicrophoneState();
      } else if (currentScene === 'tineri' && microphoneState !== 'off') {
        microphoneState = 'off';
        console.log('Microphone automatically turned off due to "tineri" scene');
        broadcastMicrophoneState();
      } else if (currentScene === 'sala' && microphoneState !== 'other') {
        microphoneState = 'other';
        console.log('Microphone set to "other" due to "sala" scene');
        broadcastMicrophoneState();
      }
      
      // Broadcast scene change to all clients
      broadcastSceneChange();
    });
    
    obs.on('SceneListChanged', async () => {
      console.log('OBS scene list changed');
      await updateOBSSceneInfo();
    });
    
    // Handle disconnection
    obs.on('ConnectionClosed', () => {
      console.log('OBS WebSocket disconnected, attempting to reconnect...');
      obsConnected = false;
      setTimeout(() => {
        connectToOBS().catch(err => {
          console.error('Failed to reconnect to OBS:', err.message);
        });
      }, 5000);
    });
    
  } catch (error) {
    console.error('Failed to connect to OBS WebSocket:', error.message);
    console.log('Will retry OBS connection in 10 seconds...');
    setTimeout(connectToOBS, 10000);
  }
}

// Update OBS scene information
async function updateOBSSceneInfo() {
  if (!obsConnected) return;
  
  try {
    // Get current scene
    const sceneInfo = await obs.call('GetCurrentProgramScene');
    currentScene = sceneInfo.currentProgramSceneName;
    
    // Get list of available scenes
    const sceneList = await obs.call('GetSceneList');
    availableScenes = sceneList.scenes.map(scene => scene.sceneName);
    
    console.log('Current OBS scene:', currentScene);
    console.log('Available scenes:', availableScenes);
    
    // Broadcast updated info to clients
    broadcastSceneChange();
  } catch (error) {
    console.error('Error updating OBS scene info:', error.message);
  }
}

// Broadcast scene change to all clients
function broadcastSceneChange() {
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify({
        type: 'obsSceneChanged',
        scene: currentScene
      }));
      
      // Also send detailed OBS info
      client.send(JSON.stringify({
        type: 'obsInfo',
        data: {
          connected: obsConnected,
          currentScene,
          availableScenes
        }
      }));
    }
  });
}

// Broadcast microphone state to all clients
function broadcastMicrophoneState() {
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify({
        type: 'microphoneStatus',
        status: microphoneState
      }));
    }
  });
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
  
  // Disconnect from OBS
  if (obsConnected) {
    obs.disconnect();
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
try {
    const configPath = path.join(process.cwd(), 'config.json');
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
} catch (error) {
    console.error('Error loading config.json. Please ensure config.json exists in the same directory as the executable.');
    console.error('Error details:', error);
    process.exit(1);
}

const app = express();

// Add authentication middleware for HTTP routes
app.use((req, res, next) => {
  const query = url.parse(req.url, true).query;
  if (!config.serverPassword || query.password === config.serverPassword) {
    next();
  } else {
    res.status(401).send('Unauthorized: Invalid password');
  }
});

const server = http.createServer(app);

// Custom WebSocket server with authentication
const wss = new WebSocketServer({ 
  noServer: true // Don't attach to server automatically
});

// Handle upgrade requests with authentication
server.on('upgrade', (request, socket, head) => {
  const pathname = url.parse(request.url).pathname;
  const query = url.parse(request.url, true).query;
  
  // Check password
  if (!config.serverPassword || query.password === config.serverPassword) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    console.log('WebSocket connection rejected: Invalid password');
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
  }
});

const XML_PATH = config.xmlPath;
let currentVerse = null;
let verses = [];
let microphoneState = 'off'; // Add microphone state

// OBS WebSocket state
const obs = new OBSWebSocket();
let obsConnected = false;
let currentScene = null;
let availableScenes = [];

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

    if(!data.VerseNumber || !data.ChapterNumber || !data.BookName) {
        console.error('Verse data is missing:', data);
        return null;
    }
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
  
  // Send initial microphone state
  ws.send(JSON.stringify({
    type: 'microphoneStatus',
    status: microphoneState
  }));
  
  // Send initial OBS information
  ws.send(JSON.stringify({
    type: 'obsInfo',
    data: {
      connected: obsConnected,
      currentScene,
      availableScenes
    }
  }));

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received message:', {data});
      
      if (data.type === 'refresh') {
        await handleVerseUpdate();
      }
      
      // Handle microphone control messages
      if (data.type === 'microphone') {
        microphoneState = data.action; // 'on', 'off', or 'other'
        console.log(`Microphone state changed to: ${microphoneState}`);
        
        // Change OBS scene based on microphone state
        if (obsConnected) {
          try {
            let sceneName = '';
            if (microphoneState === 'on') {
              sceneName = 'solo';
            } else if (microphoneState === 'off') {
              sceneName = 'tineri';
            } else if (microphoneState === 'other') {
              sceneName = 'sala';
            }
            
            if (sceneName && sceneName !== currentScene) {
              console.log(`Changing scene to ${sceneName} because microphone state is ${microphoneState}`);
              await obs.call('SetCurrentProgramScene', {
                sceneName: sceneName
              });
              
              // Update current scene
              currentScene = sceneName;
              
              // Broadcast the scene change
              broadcastSceneChange();
            }
          } catch (error) {
            console.error('Error changing OBS scene:', error.message);
          }
        }
        
        // Broadcast the new microphone state to all clients
        broadcastMicrophoneState();
      }
      
      // Handle microphone status request
      if (data.type === 'getMicrophoneStatus') {
        ws.send(JSON.stringify({
          type: 'microphoneStatus',
          status: microphoneState
        }));
      }
      
      // Handle ping request (for connection verification)
      if (data.type === 'ping') {
        ws.send(JSON.stringify({
          type: 'pong',
          timestamp: Date.now()
        }));
      }
      
      // Handle OBS scene change request
      if (data.type === 'changeObsScene' && data.scene && obsConnected) {
        try {
          const sceneName = data.scene;
          await obs.call('SetCurrentProgramScene', {
            sceneName: sceneName
          });
          console.log(`Changed OBS scene to: ${sceneName}`);
          
          // Update current scene
          currentScene = sceneName;
          
          // Broadcast the scene change to all clients
          broadcastSceneChange();
        } catch (error) {
          console.error('Error changing OBS scene:', error.message);
        }
      }
      
      // Handle OBS info request
      if (data.type === 'getOBSInfo' || data.type === 'getObsSceneStatus') {
        console.log(`Sending scene status: ${currentScene}`);
        
        // Send OBS info
        ws.send(JSON.stringify({
          type: data.type === 'getObsSceneStatus' ? 'sceneStatus' : 'obsInfo',
          scene: currentScene,
          data: {
            connected: obsConnected,
            currentScene,
            availableScenes
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
  console.log(`\nServer password protection is ${config.serverPassword ? 'ENABLED' : 'DISABLED'}`);
  if (config.serverPassword) {
    console.log(`Connect with: ws://${ip.address()}:${PORT}/?password=${config.serverPassword}`);
  }
  
  // Connect to OBS WebSocket
  connectToOBS();
});
