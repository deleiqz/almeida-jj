@echo off
title SISTEMA ALMEIDA JJ
echo ================================================================
echo               INICIANDO SISTEMA ALMEIDA JJ
echo ================================================================
echo.
echo [1/2] Iniciando Motor do WhatsApp (Porta 3005)...
start "MOTOR WHATSAPP" cmd /k "cd whatsapp-bridge && node server.js"
echo Aguardando 5 segundos para o motor aquecer...
timeout /t 5 >nul
echo.
echo [2/2] Iniciando Site/Dashboard (Porta 5173)...
start "DASHBOARD" cmd /k "npm run dev"
echo.
echo ================================================================
echo ACESSE O SISTEMA AQUI: http://127.0.0.1:5173
echo ================================================================
echo.
echo Mantenha esta e as outras duas janelas abertas enquanto estiver
echo usando o sistema. Fechar as janelas desliga o sistema.
echo.
pause
