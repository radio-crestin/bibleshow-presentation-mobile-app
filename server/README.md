# Bible Amvon Server

A WebSocket server for Bible verse synchronization.

## Windows Service Setup

To install the server as a Windows service:

1. Open Command Prompt as Administrator

2. Navigate to the directory containing the executable:
```cd C:\path\to\server```

3. Install the service:
```sc create "BibleAmvonServer" binPath= "C:\path\to\server\bible-amvon-server-win-x64.exe"```

4. Configure the service to restart on failure:
```sc failure "BibleAmvonServer" reset= 0 actions= restart/60000/restart/60000/restart/60000```

5. Start the service:
```sc start "BibleAmvonServer"```

The service will now start automatically when Windows boots.

To remove the service:
1. Stop the service:
```sc stop "BibleAmvonServer"```

2. Delete the service:
```sc delete "BibleAmvonServer"```

## Configuration

1. Copy `config.json.sample` to `config.json`
2. Edit `config.json` to set:
   - `xmlPath`: Path to BibleShow XML file
   - `port`: Server port (default 3000)
   - `bibleShowRemoteEndpoint`: Optional remote endpoint URL

## Logs

Service logs can be viewed in Windows Event Viewer under:
Windows Logs -> Application
