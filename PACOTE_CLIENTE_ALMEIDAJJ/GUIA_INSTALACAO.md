# 🥋 Guia de Instalação: Sistema Almeida JJ (Ponte WhatsApp)

Siga estes passos para configurar o servidor de WhatsApp e o Tunel Seguro no computador do cliente.

## 📋 Pré-requisitos
1. **Node.js v20 ou superior** instalado.
2. **Conexão com a Internet** estável.
3. Permissões de **Administrador** no Windows.

---

## 🚀 Passo-a-Passo

### 1. Configurar o Ambiente
Abra a pasta `PACOTE_CLIENTE_ALMEIDAJJ` e execute o arquivo:
👉 **`1_CONFIGURAR_SISTEMA.bat`**
*   *O que ele faz:* Instala as bibliotecas (`node_modules`) necessárias para o motor do WhatsApp funcionar.

### 2. Ativar a Blindagem (Background)
Execute o arquivo:
👉 **`2_BLINDAGEM_E_AUTOSTART.bat`**
*   *O que ele faz:* 
    *   Instala o PM2 (gerenciador de processos).
    *   Configura o motor para rodar "invisível" (em segundo plano).
    *   Configura o computador para **iniciar tudo sozinho quando o Windows ligar**.
    *   Evita que o PC entre em hibernação.

### 3. Verificar se está OK
Execute o arquivo:
👉 **`3_VERIFICAR_STATUS.bat`**
*   *O que ele faz:* Testa se o motor está "Online" e respondendo.

---

## 📲 Escaneando o QR Code
Como o sistema roda escondido, para conectar o WhatsApp pela primeira vez (ou se desconectar):
1. Execute o arquivo `3_VERIFICAR_STATUS.bat`.
2. Se o status for `online`, digite no terminal (ou no prompt):
   `pm2 logs whatsapp-motor`
3. O QR Code aparecerá no terminal. Escaneie-o com o WhatsApp do cliente (Aparelhos Conectados).
4. Pressione `Ctrl+C` para sair dos logs (o motor continuará rodando).

---

## 🛠️ Manutenção e Atalhos
*   Use o script **`CRIAR_ATALHO_DESKTOP.ps1`** (Botão direito -> Executar com PowerShell) para criar um ícone de acesso rápido na Área de Trabalho do cliente.
*   O domínio fixo configurado é: `conspicuously-semiconventional-daw.ngrok-free.dev`.

**Sistema Blindado. Boas vendas!** 🥊
