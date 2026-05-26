@echo off
title [3/3] VERIFICAR STATUS - ALMEIDA JJ
echo ==================================================
echo   VERIFICANDO SAUDE DO SISTEMA
echo ==================================================
echo.

echo [1/2] Status dos Processos (PM2):
call pm2 list
echo.

echo [2/2] Testando Conexao Local:
powershell -Command "try { $res = Invoke-RestMethod -Uri 'http://localhost:3000' -Method Get; echo '[OK] Motor respondendo localmente.' } catch { echo '[ERRO] Motor nao encontrado na porta 3000.' }"
echo.

echo ==================================================
echo   DICA: Se aparecer "online" no PM2, esta tudo OK!
echo   Se precisar ler o QR Code do WhatsApp, use:
echo   pm2 logs whatsapp-motor
echo ==================================================
echo.
echo Se tudo estiver verde, a instalacao foi um SUCESSO!
echo.
pause
