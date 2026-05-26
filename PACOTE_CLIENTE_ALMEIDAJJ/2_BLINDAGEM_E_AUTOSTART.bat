@echo off
title [2/3] BLINDAGEM E AUTOSTART - ALMEIDA JJ
echo ==================================================
echo   CONFIGURANDO MOTOR PARA RODAR EM SEGUNDO PLANO
echo ==================================================
echo.

:: 1. Impedir Hibernação
echo [1/4] Configurando Windows para nao dormir...
powercfg -change -standby-timeout-ac 0
powercfg -change -hibernate-timeout-ac 0
echo [OK]
echo.

:: 2. Instalar PM2 Globalmente
echo [2/4] Instalando Gerenciador de Processos (PM2)...
call npm install -g pm2 pm2-windows-startup
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao instalar PM2. Verifique se o Node.js esta instalado.
    pause
    exit
)
echo [OK]
echo.

:: 3. Configurar Startup do Windows
echo [3/4] Registrando inicializacao automatica com Windows...
call pm2-startup install
echo [OK]
echo.

:: 4. Iniciar Motores
echo [4/4] Ligando Motores (Modo Invisivel)...
cd whatsapp-bridge

:: Inicia o Servidor WhatsApp
call pm2 start server.js --name "whatsapp-motor"

call pm2 start "ngrok http --url=conspicuously-semiconventional-daw.ngrok-free.dev 3005" --name "ngrok-tunel"

:: Salva para iniciar no Reboot
call pm2 save

echo.
echo ==================================================
echo   SISTEMA BLINDADO E CONFIGURADO!
echo   O motor ja esta rodando em segundo plano.
echo ==================================================
echo.
echo Proximo passo: Execute o script [3_VERIFICAR_STATUS.bat]
echo.
pause
