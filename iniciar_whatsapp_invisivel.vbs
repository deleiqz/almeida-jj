Set WshShell = CreateObject("WScript.Shell")
strPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
WshShell.Run "cmd.exe /c cd /d """ & strPath & "\whatsapp-bridge"" && npm start", 0
Set WshShell = Nothing
