@echo off
title [1/3] CONFIGURAR SISTEMA - ALMEIDA JJ
echo ==================================================
echo   INSTALACAO DAS DEPENDENCIAS (MOTOR WHATSAPP)
echo ==================================================
echo.

:: Verificando Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado! 
    echo Por favor, instale o Node.js v20+ antes de continuar.
    pause
    exit
)

echo [OK] Node.js detectado.
echo.
echo [INFO] Instalando bibliotecas necessarias...
echo Aguarde, isso pode levar alguns minutos...
echo.

cd whatsapp-bridge
call npm install

if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha ao instalar dependencias. Verifique sua internet.
    pause
    exit
)

echo.
echo [SUCESSO] Dependencias instaladas corretamente!
echo.
echo Proximo passo: Execute o script [2_BLINDAGEM_E_AUTOSTART.bat]
echo.
pause
