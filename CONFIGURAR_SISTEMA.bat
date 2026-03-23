@echo off
title CONFIGURAR PONTE WHATSAPP - ALMEIDA JJ
echo ==================================================
echo   INSTALACAO AUTOMATICA DAS DEPENDENCIAS
echo ==================================================
echo.
echo [1/3] Verificando Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado! Por favor, instale o Node.js primeiro.
    pause
    exit
)
echo [OK] Node.js detectado.
echo.
echo [2/3] Instalando bibliotecas do motor...
cd whatsapp-bridge
call npm install
echo [OK] Bibliotecas instaladas.
echo.
echo [3/3] Quase pronto! 
echo Agora voce so precisa configurar o seu Token do ngrok.
echo Se ja fez isso, pode fechar esta janela.
echo.
pause
