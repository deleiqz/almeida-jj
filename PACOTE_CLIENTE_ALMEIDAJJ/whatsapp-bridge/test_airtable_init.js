const AIRTABLE_PAT = 'patKV3AcK9gDHNvg7.38645088e5ab443298c6091ab2b3801aef1792de655cc0e6c9365d512464b822';
const AIRTABLE_BASE_ID = 'app4o6LoQEhgWFGz1';

async function testInit() {
    console.log("🚀 Iniciando teste de criação de tabelas...");
    
    const headers = {
        'Authorization': `Bearer ${AIRTABLE_PAT}`,
        'Content-Type': 'application/json'
    };

    try {
        const response = await fetch(`https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                name: "Contratos_SaaS",
                description: "Registro de academias",
                fields: [
                    { name: "Nome Academia", type: "singleLineText" },
                    { name: "CNPJ/CPF", type: "singleLineText" }
                ]
            })
        });

        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Resposta:", JSON.stringify(data, null, 2));
        // Criar Tabela Pagamentos_Mensais
        const response2 = await fetch(`https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`, {
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
                    { name: "Data Pagamento", type: "date", options: { format: "YYYY-MM-DD" } }
                ]
            })
        });

        const data2 = await response2.json();
        console.log("Status Pagamentos:", response2.status);
        console.log("Resposta Pagamentos:", JSON.stringify(data2, null, 2));

    } catch (err) {
        console.error("ERRO FATAL:", err);
    }
}

testInit();
