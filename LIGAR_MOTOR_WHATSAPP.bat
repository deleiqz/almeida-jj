@echo off
title MOTOR WHATSAPP - ALMEIDA JJ
echo ==================================================
echo   INICIANDO MOTOR E TUNEL NGROK...
echo ==================================================
echo.
echo [1/2] Abrindo Motor em segundo plano...
cd whatsapp-bridge
start /min cmd /c "node server.js"
echo [OK] Motor iniciado.
echo.
echo [2/2] Abrindo Tunel Seguro (ngrok)...
echo COPIE O LINK "Forwarding" QUE APARECERA ABAIXO!
echo (Ele comeca com https://...)
echo.
ngrok http 3000
pause
