const express = require('express');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const imageQr = require('qrcode');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

// CONFIGURAÇÃO MERCADO PAGO - ADICIONE SEU ACCESS TOKEN DE PRODUÇÃO AQUI
const MP_ACCESS_TOKEN = 'APP_USR-941031687557097-040713-68cec6df2e1b1705c30cec5e71899475-402502578';

const clientMp = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });
const preference = new Preference(clientMp);

// CONFIGURAÇÃO AIRTABLE
const AIRTABLE_PAT = 'patKV3AcK9gDHNvg7.38645088e5ab443298c6091ab2b3801aef1792de655cc0e6c9365d512464b822';
const AIRTABLE_BASE_ID = 'app4o6LoQEhgWFGz1';
const Airtable = require('airtable');
const airtableBase = new Airtable({ apiKey: AIRTABLE_PAT }).base(AIRTABLE_BASE_ID);

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

// Configuração do Cliente WhatsApp - MODO DE SEGURANÇA ATIVADO
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "almeida-jj-session"
    }),
    puppeteer: {
        headless: true,
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
            '--mute-audio',
            '--no-default-browser-check',
            '--no-pings',
            '--disable-client-side-phishing-detection'
        ]
    },
    // Desativando cache remoto problemático para evitar o erro "Execution context was destroyed"
    webVersionCache: {
        type: 'local'
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
        console.log(`⏳ Aguardando ${waitTime / 1000} segundos para o próximo...`);
        await delay(waitTime);

        res.json({ success: true });
    } catch (error) {
        console.error(`❌ Erro ao enviar para ${phone}:`, error.message);
        res.status(500).json({ error: error.message });
    }
});

// Rota para Criar Link de Pagamento Mercado Pago (SaaS Setup)
app.post('/create-saas-payment', async (req, res) => {
    const { gymName, amountSetup, amountMonthly } = req.body;

    if (MP_ACCESS_TOKEN === 'COLOQUE_SEU_TOKEN_AQUI') {
        return res.status(500).json({ error: 'Mercado Pago não configurado. Por favor, adicione seu Access Token no arquivo server.js da ponte.' });
    }

    try {
        const totalAmount = (Number(amountSetup) || 3250.00) + (Number(amountMonthly) || 200.00);
        
        const body = {
            items: [
                {
                    id: "saas-setup-mensalidade",
                    title: `Setup + 1ª Mensalidade - ${gymName}`,
                    description: "Taxa de implementação do sistema e licenciamento do primeiro mês.",
                    picture_url: "https://almeida-jj.vercel.app/logo.jpg",
                    category_id: "services",
                    quantity: 1,
                    unit_price: totalAmount,
                    currency_id: 'BRL'
                }
            ],
            back_urls: {
                success: 'https://almeida-jj.vercel.app/',
                failure: 'https://almeida-jj.vercel.app/',
                pending: 'https://almeida-jj.vercel.app/'
            },
            auto_return: 'approved',
            notification_url: 'https://almeidajj-mp.loca.lt/webhook-mp'
        };

        const result = await preference.create({ body });
        res.json({ init_point: result.init_point });
    } catch (error) {
        console.error('Erro ao criar preferência MP:', error);
        res.status(500).json({ error: 'Erro ao gerar link de pagamento.' });
    }
});

// Rota de Escuta para Webhook do Mercado Pago (Recebimento PIX e Cartão)
app.post('/webhook-mp', async (req, res) => {
    console.log("🔔 [Webhook MP] Evento Recebido:", req.query);
    res.sendStatus(200); // 1. Confirma recebimento rápido pro Mercado Pago não repetir envio

    // Identificar ID e Type do evento de acordo com a doc do MP
    const type = req.query.type || req.query.topic || req.body?.type;
    const id = req.query['data.id'] || req.body?.data?.id || (type === 'payment' ? req.query.id : null);

    if (type === 'payment' && id) {
        try {
            console.log(`🔍 [Webhook MP] Validando status do pagamento ID: ${id}...`);
            const paymentClient = new Payment(clientMp);
            const paymentData = await paymentClient.get({ id });

            if (paymentData.status === 'approved') {
                console.log(`✅ [Webhook MP] Pagamento ${id} APROVADO! Enviando WhatsApp...`);
                
                // Extrai nome do pagador se tiver
                let payerName = paymentData.payer?.first_name || 'Cliente';
                if (payerName === 'Cliente' && paymentData.payer?.email) {
                     payerName = paymentData.payer.email.split('@')[0];
                }

                const zapMsg = `💰 *PIX RECEBIDO COM SUCESSO!*\n\n✅ *Status:* Aprovado\n👤 *Pagador:* ${payerName}\n💵 *Valor:* R$ ${paymentData.transaction_amount}\n📅 *Data:* ${new Date(paymentData.date_approved).toLocaleString('pt-BR')}\n\nO Serviço B2B SaaS já foi comissionado!`;

                // Dispara o WhatsApp pelo número do dono da Academia (Seu número)
                const chatId = '5511951313866@c.us'; 
                await client.sendMessage(chatId, zapMsg);
                console.log(`📲 [Webhook MP] WhatsApp enviado para o Administrador!`);
            }
        } catch (error) {
            console.error("❌ [Webhook MP] Erro ao buscar dados do pagamento ou enviar ZAP:", error.message);
        }
    }
});

// --- A SINCRONIZAÇÃO DO AIRTABLE FOI MIGRADA PARA A NUVEM (SUPABASE) PARA INDEPENDÊNCIA TOTAL ---

// Função para Garantir que as Tabelas existam no Airtable

// Função para Garantir que as Tabelas existam no Airtable
// (Utiliza a Meta API do Airtable - Requer Scopes de schema.bases:write)
async function initAirtableSchema() {
    console.log("🛠️ [Airtable] Verificando estrutura de tabelas...");
    
    const headers = {
        'Authorization': `Bearer ${AIRTABLE_PAT}`,
        'Content-Type': 'application/json'
    };

    try {
        // Criar Tabela Contratos_SaaS
        const res1 = await fetch(`https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                name: "Contratos_SaaS",
                description: "Registro de academias que assinaram o contrato B2B",
                fields: [
                    { name: "Nome Academia", type: "singleLineText" },
                    { name: "CNPJ/CPF", type: "singleLineText" },
                    { name: "Responsavel 1", type: "singleLineText" },
                    { name: "CPF Proprietário", type: "singleLineText" },
                    { name: "Endereço Sede", type: "multilineText" },
                    { name: "Dia Vencimento", type: "singleLineText" },
                    { name: "Valor Setup", type: "currency", options: { symbol: "R$", precision: 2 } },
                    { name: "Mensalidade", type: "currency", options: { symbol: "R$", precision: 2 } },
                    { name: "Data Assinatura", type: "date", options: { dateFormat: { name: "iso", format: "YYYY-MM-DD" } } },
                    { name: "Status", type: "singleSelect", options: { choices: [{name: "Aguardando Pagamento Setup"}, {name: "Ativo"}, {name: "Inativo"}] } }
                ]
            })
        });
        if (res1.status === 200) console.log("✅ [Airtable] Tabela Contratos_SaaS criada!");
    } catch (err) { console.log("ℹ️ [Airtable] Tabela Contratos_SaaS já existe ou erro na criação."); }

    try {
        // Criar Tabela Pagamentos_Mensais
        const res2 = await fetch(`https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                name: "Pagamentos_Mensais",
                description: "Controle de faturamento recorrente",
                fields: [
                    { name: "Nome Academia", type: "singleLineText" },
                    { name: "Mês/Ano", type: "singleLineText" },
                    { name: "Valor", type: "currency", options: { symbol: "R$", precision: 2 } },
                    { name: "Status", type: "singleSelect", options: { choices: [{name: "Pendente"}, {name: "Pago"}] } },
                    { name: "Tipo", type: "singleLineText" },
                    { name: "Data Pagamento", type: "date", options: { dateFormat: { name: "iso", format: "YYYY-MM-DD" } } }
                ]
            })
        });
        if (res2.status === 200) console.log("✅ [Airtable] Tabela Pagamentos_Mensais criada!");
    } catch (err) { console.log("ℹ️ [Airtable] Tabela Pagamentos_Mensais já existe ou erro na criação."); }
}

// Inicializa o Schema ao ligar o servidor
initAirtableSchema();


const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🖥️  Ponte WhatsApp rodando em http://localhost:${PORT}`);
    console.log('--------------------------------------------------');
});
