# Bible Amvon Server

A WebSocket server for Bible verse synchronization.

## Windows Service Setup

To install the server as a Windows service:

1. Open Command Prompt as Administrator

2. Remove existing service if it exists:
``` 
sc delete "BibleAmvonServer"
```

2. Navigate to the directory containing the executable:
```cd %~dp0```

3. Install the service with auto-start and working directory configuration:
```sc create "BibleAmvonServer" binPath= "\"%CD%\bible-amvon-server-win-x64.exe\"" start= auto DisplayName= "Bible Amvon Server" obj= LocalSystem```

4. Set the service description:
```sc description "BibleAmvonServer" "Bible verse synchronization WebSocket server"```

5. Configure working directory and logging:
```reg add "HKLM\SYSTEM\CurrentControlSet\Services\BibleAmvonServer" /v "ImagePath" /t REG_EXPAND_SZ /d "\"%CD%\bible-amvon-server-win-x64.exe\" --log \"%CD%\service.log\"" /f```

6. Configure the service to restart on failure (retry every minute, indefinitely):
```sc failure "BibleAmvonServer" reset= 86400 actions= restart/60000/restart/60000/restart/60000```

7. Start the service:
```sc start "BibleAmvonServer"```

The service will now:
- Start automatically when Windows boots
- Run in the same directory as the executable (for config.json access)
- Restart automatically on any failure
- Log output to service.log in the same directory

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
