const fetch = require('node-fetch');

const AIRTABLE_PAT = 'patKV3AcK9gDHNvg7.38645088e5ab443298c6091ab2b3801aef1792de655cc0e6c9365d512464b822';
const AIRTABLE_BASE_ID = 'app4o6LoQEhgWFGz1';

async function addAttachmentField() {
    console.log("🛠️  Adicionando campo de anexo no Airtable...");

    const baseRes = await fetch(`https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`, {
        headers: { 'Authorization': `Bearer ${AIRTABLE_PAT}` }
    });
    const baseData = await baseRes.json();
    const table = baseData.tables.find(t => t.name === "Contratos_SaaS");

    if (!table) return console.log("❌ Tabela Contratos_SaaS não encontrada.");

    const fieldName = "Anexo Contrato";
    if (table.fields.find(f => f.name === fieldName)) {
        return console.log(`✅ Campo '${fieldName}' já existe.`);
    }

    const res = await fetch(`https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables/${table.id}/fields`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${AIRTABLE_PAT}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: fieldName,
            type: "multipleAttachments"
        })
    });

    if (res.status === 200) {
        console.log(`✨ Campo '${fieldName}' (Anexo) adicionado com sucesso!`);
    } else {
        console.log(`⚠️  Erro ao adicionar campo: ${res.status}`);
        const errorData = await res.json();
        console.log(JSON.stringify(errorData));
    }
}

addAttachmentField();
