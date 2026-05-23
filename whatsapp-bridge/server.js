require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const imageQr = require('qrcode');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

// CONFIGURAÇÃO MERCADO PAGO
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

const clientMp = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });
const preference = new Preference(clientMp);

// CONFIGURAÇÃO AIRTABLE
const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const Airtable = require('airtable');
const airtableBase = new Airtable({ apiKey: AIRTABLE_PAT }).base(AIRTABLE_BASE_ID);

const app = express();
app.use(cors());
app.use(express.json());

// MIDDLEWARE DE SEGURANÇA (BLINDAGEM)
const securityMiddleware = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const validKey = process.env.SECURITY_KEY;

    if (!apiKey || apiKey !== validKey) {
        console.warn(`🚨 Tentativa de acesso não autorizado bloqueada! IP: ${req.ip}`);
        return res.status(401).json({ error: 'Acesso não autorizado. Chave de segurança inválida.' });
    }
    next();
};


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
    // Usando cache padrão para evitar o erro "Execution context was destroyed" associado a HTMLs antigos
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
app.post('/send-message', securityMiddleware, async (req, res) => {
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
app.post('/create-saas-payment', securityMiddleware, async (req, res) => {
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

// =========================================================================
// 🔔 ENVIO AUTOMÁTICO DE LEMBRETES E ANIVERSÁRIOS 🔔
// =========================================================================
const fs = require('fs');
const path = require('path');

const SENT_LOG_FILE = path.join(__dirname, 'sent_notifications.json');

// Helper para ler os logs de envios
const getSentLogs = () => {
    if (!fs.existsSync(SENT_LOG_FILE)) {
        return { birthday: {}, payment: {}, lastRunDate: '' };
    }
    try {
        return JSON.parse(fs.readFileSync(SENT_LOG_FILE, 'utf8'));
    } catch (e) {
        return { birthday: {}, payment: {}, lastRunDate: '' };
    }
};

// Helper para salvar os logs de envios
const saveSentLogs = (logs) => {
    fs.writeFileSync(SENT_LOG_FILE, JSON.stringify(logs, null, 2), 'utf8');
};

// Rotina Diária de Notificações Automáticas
async function runDailyNotifications() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.log("⚠️ [Notificações Automáticas] SUPABASE_URL ou SUPABASE_KEY não configurados no .env do bridge. Ignorando disparos automáticos.");
        return;
    }

    if (!isReady) {
        console.log("⚠️ [Notificações Automáticas] WhatsApp não conectado ainda. Tentará novamente mais tarde.");
        return;
    }

    try {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
        const currentHour = today.getHours();

        // Só executa se for entre 09:00 e 21:00 (evita disparar de madrugada caso o servidor reinicie)
        if (currentHour < 9 || currentHour > 21) {
            return;
        }

        const logs = getSentLogs();

        // Se já rodou hoje com sucesso, não executa novamente
        if (logs.lastRunDate === todayStr) {
            return;
        }

        console.log("🚀 [Notificações Automáticas] Iniciando verificação diária de cobranças e aniversariantes...");

        // Busca alunos no Supabase
        const url = `${supabaseUrl}/rest/v1/students?select=*`;
        const response = await fetch(url, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao buscar estudantes do Supabase: ${response.statusText}`);
        }

        const students = await response.json();
        console.log(`[Notificações Automáticas] ${students.length} alunos carregados do Supabase.`);

        // Inicializa logs para o dia de hoje
        if (!logs.birthday[todayStr]) logs.birthday[todayStr] = [];
        if (!logs.payment[todayStr]) logs.payment[todayStr] = [];

        let sentCount = 0;

        for (const student of students) {
            if (!student.phone) continue;

            const cleanPhone = student.phone.replace(/\D/g, '');
            if (!cleanPhone) continue;
            const fullPhone = `55${cleanPhone}`;

            // --- 🎂 VERIFICAÇÃO DE ANIVERSÁRIO ---
            if (student.birth_date) {
                const bDateParts = student.birth_date.split('-');
                if (bDateParts.length >= 3) {
                    const bMonth = parseInt(bDateParts[1], 10);
                    const bDay = parseInt(bDateParts[2], 10);

                    const tMonth = today.getMonth() + 1; // 0-11 -> 1-12
                    const tDay = today.getDate();

                    if (bMonth === tMonth && bDay === tDay) {
                        // É aniversariante de hoje! Verifica se já recebeu
                        if (!logs.birthday[todayStr].includes(student.id)) {
                            console.log(`🎂 [Notificações Automáticas] Aniversário hoje de: ${student.name}`);
                            const msg = `Parabéns, ${student.name}! 🎂🥋\n\nA família Almeida JJ te deseja um feliz aniversário! Que seu novo ciclo seja de muita saúde, paz, conquistas e evolução nos treinos. Oss!`;
                            
                            try {
                                await client.sendMessage(`${fullPhone}@c.us`, msg);
                                logs.birthday[todayStr].push(student.id);
                                saveSentLogs(logs);
                                sentCount++;
                                console.log(`✔️ Mensagem de aniversário enviada para ${student.name}`);
                                
                                // Delay de segurança
                                const waitTime = Math.floor(Math.random() * (15000 - 10000 + 1) + 10000);
                                await delay(waitTime);
                            } catch (err) {
                                console.error(`❌ Erro ao enviar parabéns para ${student.name}:`, err.message);
                            }
                        }
                    }
                }
            }

            // --- 💵 VERIFICAÇÃO DE LEMBRETE DE PAGAMENTO ---
            // Apenas cobramos se o status não for "pago"
            if (student.status !== 'pago' && student.next_due) {
                const nextDue = new Date(student.next_due + 'T00:00:00');
                
                // Zera horas para comparação precisa de dias
                const dToday = new Date(today);
                dToday.setHours(0, 0, 0, 0);
                nextDue.setHours(0, 0, 0, 0);

                const diffTime = nextDue.getTime() - dToday.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                let shouldRemind = false;
                let textTemplate = '';

                if (diffDays === 7) {
                    shouldRemind = true;
                    textTemplate = 'Olá, {nome}! Passando para lembrar que o vencimento da sua mensalidade do plano {plano} está próximo ({vencimento}). Você pode realizar o pagamento através do link: {link_pagamento} \n\nQualquer dúvida estamos à disposição! 🥋';
                } else if (diffDays === 0) {
                    shouldRemind = true;
                    textTemplate = 'Olá, {nome}! Passando para lembrar que a sua mensalidade do plano {plano} vence hoje ({vencimento}). Você pode realizar o pagamento através do link: {link_pagamento} \n\nNos vemos no tatame! Oss! 🥋';
                } else if (diffDays < 0 && Math.abs(diffDays) % 7 === 0) {
                    // Cobra semanalmente se estiver atrasado (para não ser invasivo)
                    shouldRemind = true;
                    textTemplate = 'Olá, {nome}! Constamos que a sua mensalidade do plano {plano} está pendente desde {vencimento}. Para regularizar e continuar treinando, você pode pagar pelo link: {link_pagamento} \n\nQualquer dúvida fale conosco! Oss! 🥋';
                }

                if (shouldRemind && !logs.payment[todayStr].includes(student.id)) {
                    console.log(`💵 [Notificações Automáticas] Lembrete de pagamento para: ${student.name} (${diffDays} dias de diferença)`);
                    
                    let formattedDueDate = '';
                    const d = new Date(student.next_due + 'T00:00:00');
                    if (!isNaN(d.getTime())) {
                        formattedDueDate = d.toLocaleDateString('pt-BR');
                    }

                    const formattedMsg = textTemplate
                        .replace(/{nome}/g, student.name || '')
                        .replace(/{plano}/g, student.plan || 'Mensal')
                        .replace(/{vencimento}/g, formattedDueDate)
                        .replace(/{link_pagamento}/g, student.payment_link || '');

                    try {
                        await client.sendMessage(`${fullPhone}@c.us`, formattedMsg);
                        logs.payment[todayStr].push(student.id);
                        saveSentLogs(logs);
                        sentCount++;
                        console.log(`✔️ Lembrete de pagamento enviado para ${student.name}`);
                        
                        // Delay de segurança
                        const waitTime = Math.floor(Math.random() * (15000 - 10000 + 1) + 10000);
                        await delay(waitTime);
                    } catch (err) {
                        console.error(`❌ Erro ao enviar cobrança para ${student.name}:`, err.message);
                    }
                }
            }
        }

        // Atualiza a última data de execução
        logs.lastRunDate = todayStr;
        saveSentLogs(logs);
        console.log(`✅ [Notificações Automáticas] Verificação diária concluída. ${sentCount} mensagens automáticas enviadas hoje.`);

    } catch (error) {
        console.error("❌ [Notificações Automáticas] Erro durante o disparo automático diário:", error.message);
    }
}

// Verifica a cada 30 minutos
setInterval(runDailyNotifications, 30 * 60 * 1000);

// Executa também após iniciar o servidor e o cliente WhatsApp estar pronto
client.on('ready', () => {
    setTimeout(runDailyNotifications, 10000); // 10s após conexão
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🖥️  Ponte WhatsApp rodando em http://localhost:${PORT}`);
    console.log('--------------------------------------------------');
});
