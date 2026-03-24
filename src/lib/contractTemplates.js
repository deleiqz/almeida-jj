export const studentContractAdult = `
# CONTRATO DE PRESTAÇÃO DE SERVIÇOS - ALMEIDA JJ

**CONTRATANTE:** {{name}}, CPF nº {{cpf}}, nascido em {{birthDate}}, residente em {{address}}, e-mail {{email}}, doravante denominado ALUNO.

**CONTRATADA:** ALMEIDA CAMPANELLA LTDA (ALMEIDA JJ), CNPJ 10.123.456/0001-99, com sede na Av. Campanella, nº 1015 - Cidade AE Carvalho - São Paulo - SP.

### CLÁUSULA 1 - DO OBJETO
O presente contrato tem por objeto a prestação de serviços de ensino técnico, treinamento e prática de Brazilian Jiu-Jitsu nas dependências da CONTRATADA, sob a modalidade **{{sub_plan}}**.

### CLÁUSULA 2 - DO PLANO E VALORES
O ALUNO optou pelo plano de mensalidade **{{plan}}**, com valor de **R$ {{payment_value}}**.
Os pagamentos deverão ser efetuados via **{{paymentMethod}}** até o dia 24 de cada mês.

### CLÁUSULA 3 - DAS REGRAS DE CONVIVÊNCIA
O ALUNO compromete-se a zelar pela limpeza do tatame, usar quimono limpo e respeitar os professores e colegas.

### CLÁUSULA 4 - DO CANCELAMENTO
O cancelamento deve ser solicitado com 30 dias de antecedência.

### CLÁUSULA 5 - DIREITO DE IMAGEM
O ALUNO declarou estar: **{{image_auth}}** quanto ao uso de sua imagem para fins de divulgação.
`;

export const studentContractMinor = `
# CONTRATO DE PRESTAÇÃO DE SERVIÇOS (INFANTIL) - ALMEIDA JJ

**ALUNO (MENOR):** {{name}}, nascido em {{birthDate}}, doravante denominado ALUNO.

**RESPONSÁVEL LEGAL:** {{parent_name}}, CPF nº {{parent_cpf}}, residente em {{address}}, e-mail {{email}}, doravante denominado RESPONSÁVEL.

**CONTRATADA:** ALMEIDA CAMPANELLA LTDA (ALMEIDA JJ), CNPJ 10.123.456/0001-99, com sede na Av. Campanella, nº 1015 - Cidade AE Carvalho - São Paulo - SP.

### CLÁUSULA 1 - DO OBJETO
O presente contrato tem por objeto a prestação de serviços de ensino técnico e treinamento de Brazilian Jiu-Jitsu para o MENOR acima identificado, sob a modalidade **{{sub_plan}}**.

### CLÁUSULA 2 - DO PLANO E VALORES
O RESPONSÁVEL optou pelo plano **{{plan}}** para o menor, com valor de **R$ {{payment_value}}**.
Os pagamentos deverão ser efetuados via **{{paymentMethod}}** até o dia 24 de cada mês.

### CLÁUSULA 3 - DA RESPONSABILIDADE E IMAGEM
O RESPONSÁVEL compromete-se a zelar pela conduta do menor. O uso de imagem foi declarado como: **{{image_auth}}**.
`;

export const responsibilityTerm = `
# TERMO DE RESPONSABILIDADE E DECLARAÇÃO DE SAÚDE

Eu, **{{name}}**, declaro para os devidos fins que:

1. Estou em plenas condições de saúde física e mental para a prática de Brazilian Jiu-Jitsu.
2. Não possuo restrições médicas conhecidas que me impeçam de realizar atividades de alta intensidade.
3. Em caso de qualquer incidente, autorizo a equipe da ALMEIDA JJ a prestar os primeiros socorros ou encaminhar para o pronto-atendimento médico.

**Informações Médicas Adicionais:**
{{medicalInfo}}

**CONTATO DE EMERGÊNCIA:** {{phone}}
`;
