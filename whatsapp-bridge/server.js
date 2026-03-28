const express = require('express');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const imageQr = require('qrcode');

const app = express();
app.use(cors());
app.use(express.json());

let isReady = false;
let lastQr = '';
let messageCount = 0;

// Helper para encontrar o Chrome no Windows automaticamente
const findChromeOnWindows = () => {
    const fs = require('fs');
    if (process.platform !== 'win32') return null;
    
    const paths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
    ];

    for (const path of paths) {
        if (fs.existsSync(path)) return path;
    }
    return null;
};

const chromePath = process.env.PUPPETEER_EXECUTABLE_PATH || findChromeOnWindows();

// Configuração do Cliente WhatsApp
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "almeida-jj-session"
    }),
    puppeteer: {
        headless: true, // Use true ou "new" para versões recentes
        executablePath: chromePath,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--hide-scrollbars',
            '--disable-notifications',
            '--disable-extensions',
            '--disable-background-networking',
            '--disable-default-apps',
            '--mute-audio'
        ]
    },
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
    }
});

client.on('qr', async (qr) => {
    console.log('\n👇 ESCANEIE O QR CODE ABAIXO PARA CONECTAR:');
    qrcodeTerminal.generate(qr, { small: true });
    
    // Gera versão para web para facilitar na nuvem
    try {
        lastQr = await imageQr.toDataURL(qr);
    } catch (err) {
        console.error('Erro ao gerar QR para web:', err);
    }
});

client.on('ready', () => {
    console.log('\n✅ WhatsApp CONECTADO e pronto para uso!');
    isReady = true;
});

client.on('authenticated', () => {
    console.log('\n👍 Autenticado com sucesso!');
});

client.on('auth_failure', msg => {
    console.error('\n❌ Falha na autenticação:', msg);
});

client.on('disconnected', (reason) => {
    console.log('\n🚪 WhatsApp desconectado:', reason);
    isReady = false;
});

client.initialize();

// Helper para delay
const delay = ms => new Promise(res => setTimeout(res, ms));

// Rota de Boas-vindas / Raiz
app.get('/', (req, res) => {
    res.send(`
        <div style="text-align:center; padding: 50px; font-family: sans-serif; background: #111; color: white; min-height: 100vh;">
            <h1 style="color: #25D366;">🟢 Ponte Almeida JJ Online</h1>
            <p>Conexão WhatsApp: <strong>${isReady ? 'CONECTADO ✅' : 'DESCONECTADO ❌'}</strong></p>
            <p>Mensagens enviadas nesta sessão: <strong>${messageCount}</strong></p>
            <hr style="border: 1px solid #333; width: 300px; margin: 20px auto;" />
            ${!isReady ? '<a href="/qr" style="color: #25D366; text-decoration: none; font-weight: bold;">Ver QR Code para Conectar</a>' : '<p style="color: #888;">Tudo pronto para os disparos!</p>'}
        </div>
    `);
});

// Rota de Status (API)
app.get('/status', (req, res) => {
    res.json({ 
        connected: isReady,
        messageCount: messageCount,
        platform: process.platform,
        uptime: process.uptime()
    });
});

// Rota para ver o QR Code via Web
app.get('/qr', (req, res) => {
    if (isReady) {
        return res.send('<h3>WhatsApp já está conectado!</h3>');
    }
    if (!lastQr) {
        return res.send('<h3>Gerando QR Code... Aguarde alguns segundos e atualize a página.</h3>');
    }
    res.send(`
        <div style="text-align:center; padding: 50px; font-family: sans-serif;">
            <h2>Escaneie para Conectar</h2>
            <img src="${lastQr}" style="border: 10px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.1)" />
            <p>Após escanear, aguarde a confirmação no terminal ou atualize esta página.</p>
        </div>
    `);
});

// Rota de Envio de Mensagem Individual
app.post('/send-message', async (req, res) => {
    const { phone, message } = req.body;

    if (!isReady) {
        return res.status(503).json({ error: 'WhatsApp não está conectado ainda.' });
    }

    try {
        // Verifica se a conexão ainda está ativa antes de cada envio
        let state;
        try {
            state = await client.getState();
        } catch (e) {
            isReady = false;
            throw new Error('Conexão interna do WhatsApp falhou. Por favor, reinicie o terminal.');
        }

        if (state !== 'CONNECTED') {
            isReady = false;
            throw new Error('WhatsApp desconectado do celular.');
        }

        if (!phone || !message) {
            return res.status(400).json({ error: 'Telefone ou mensagem ausentes.' });
        }

        // Pequena pausa de preparação
        await delay(500);

        // Formata o número (garantindo que tenha @c.us)
        const chatId = phone.includes('@c.us') ? phone : `${phone}@c.us`;
        
        await client.sendMessage(chatId, message);
        messageCount++;
        console.log(`✔️ [${messageCount}] Mensagem enviada para: ${phone}`);
        
        // Delay solicitado pelo usuário: Mínimo 10 segundos
        // Vamos usar 10 a 15 segundos aleatórios para maior segurança
        const waitTime = Math.floor(Math.random() * (15000 - 10000 + 1) + 10000);
        console.log(`⏳ Aguardando ${waitTime/1000} segundos para o próximo...`);
        await delay(waitTime);

        res.json({ success: true });
    } catch (error) {
        console.error(`❌ Erro ao enviar para ${phone}:`, error.message);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🖥️  Ponte WhatsApp rodando em http://localhost:${PORT}`);
    console.log('--------------------------------------------------');
});
