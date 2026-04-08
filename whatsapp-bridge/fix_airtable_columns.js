const fetch = require('node-fetch');

const AIRTABLE_PAT = 'patKV3AcK9gDHNvg7.38645088e5ab443298c6091ab2b3801aef1792de655cc0e6c9365d512464b822';
const AIRTABLE_BASE_ID = 'app4o6LoQEhgWFGz1';

async function fixColumns() {
    console.log("🛠️  Iniciando atualização de colunas no Airtable...");

    // Precisamos primeiro pegar o ID da tabela Contratos_SaaS para adicionar colunas nela
    const baseRes = await fetch(`https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`, {
        headers: { 'Authorization': `Bearer ${AIRTABLE_PAT}` }
    });
    const baseData = await baseRes.json();
    const table = baseData.tables.find(t => t.name === "Contratos_SaaS");

    if (!table) {
        console.log("❌ Tabela não encontrada.");
        return;
    }

    const missingFields = [
        { name: "Responsavel 1", type: "singleLineText" },
        { name: "CPF Proprietário", type: "singleLineText" },
        { name: "Endereço Sede", type: "multilineText" },
        { name: "Dia Vencimento", type: "singleLineText" },
        { name: "Valor Setup", type: "currency", options: { symbol: "R$", precision: 2 } },
        { name: "Mensalidade", type: "currency", options: { symbol: "R$", precision: 2 } },
        { name: "Data Assinatura", type: "date", options: { dateFormat: { name: "iso", format: "YYYY-MM-DD" } } },
        { name: "Status", type: "singleSelect", options: { choices: [{name: "Aguardando Pagamento Setup"}, {name: "Ativo"}, {name: "Inativo"}] } },
        { name: "Anexo Contrato", type: "multipleAttachments" }
    ];

    for (const field of missingFields) {
        if (table.fields.find(f => f.name === field.name)) {
            console.log(`✅ Campo '${field.name}' já existe.`);
            continue;
        }

        console.log(`➕ Adicionando campo: ${field.name}...`);
        const res = await fetch(`https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables/${table.id}/fields`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AIRTABLE_PAT}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(field)
        });

        if (res.status === 200) {
            console.log(`✨ Campo '${field.name}' adicionado!`);
        } else {
            console.log(`⚠️  Erro ao adicionar campo '${field.name}': ${res.status}`);
        }
    }

    console.log("\n🚀 TUDO PRONTO! Agora os contratos vão cair certinho.");
}

fixColumns();
