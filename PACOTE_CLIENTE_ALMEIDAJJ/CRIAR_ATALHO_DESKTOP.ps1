$WshShell = New-Object -ComObject WScript.Shell
$ShortcutPath = "$([Environment]::GetFolderPath('Desktop'))\CENTRAL DE CONTROLE ALMEIDA JJ.lnk"
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "$PSScriptRoot\3_VERIFICAR_STATUS.bat"
$Shortcut.WorkingDirectory = $PSScriptRoot
$Shortcut.IconLocation = "shell32.dll, 164" # Ícone de engrenagem/ferramenta
$Shortcut.Save()

Write-Host "Atalho criado na Area de Trabalho com sucesso!" -ForegroundColor Green
