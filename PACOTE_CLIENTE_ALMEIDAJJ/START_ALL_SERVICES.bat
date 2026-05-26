@echo off
cd %~dp0
echo Iniciando todos os servicos em segundo plano...

:: Inicia o Motor WhatsApp
start /b cmd /c "cd whatsapp-bridge && node server.js"

:: Inicia o Dashboard (Frontend)
start /b cmd /c "npm run dev"

:: Inicia o Tunel (Opcional, se o cliente usar acesso externo)
start /b cmd /c "cd whatsapp-bridge && node tunnel.js"

echo Sistema iniciado! Ja pode fechar esta janela se desejar, 
echo mas os processos continuarao rodando por baixo.
timeout /t 5
exit
