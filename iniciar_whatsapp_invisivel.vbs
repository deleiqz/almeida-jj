Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd.exe /c cd ""%~dp0whatsapp-bridge"" && npm start", 0
Set WshShell = Nothing
