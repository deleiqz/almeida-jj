export const studentContractAdult = `
# CONTRATO DE PRESTAÇÃO DE SERVIÇOS - ALMEIDA JJ

**CONTRATANTE:** {{name}}, CPF nº {{cpf}}, nascido em {{birthDate}}, residente em {{address}}, doravante denominado ALUNO.

**CONTRATADA:** ALMEIDA CAMPANELLA LTDA (ALMEIDA JJ), CNPJ 10.123.456/0001-99, com sede na Av. Campanella, nº 1015 - Cidade AE Carvalho - São Paulo - SP.

### CLÁUSULA 1 - DO OBJETO
O presente contrato tem por objeto a prestação de serviços de ensino técnico, treinamento e prática de Brazilian Jiu-Jitsu nas dependências da CONTRATADA.

### CLÁUSULA 2 - DO PLANO E VALORES
O ALUNO optou pelo plano **{{plan}}**, com valor de **R$ {{payment_value}}**.
Os pagamentos deverão ser efetuados via **{{paymentMethod}}** até o dia {{dueDate}} de cada mês.

### CLÁUSULA 3 - DAS REGRAS DE CONVIVÊNCIA
O ALUNO compromete-se a zelar pela limpeza do tatame, usar quimono limpo e respeitar os professores e colegas. A CONTRATADA reserva-se o direito de rescindir o contrato em caso de conduta inadequada.

### CLÁUSULA 4 - DO CANCELAMENTO
O cancelamento deve ser solicitado com 30 dias de antecedência. Planos anuais ou trimestrais podem estar sujeitos a multas por quebra de contrato conforme regulamento interno.

### CLÁUSULA 5 - DO USO DE IMAGEM
O ALUNO autoriza a utilização de sua imagem em fotos e vídeos capturados durante os treinos para fins de divulgação da academia em redes sociais.
`;

export const studentContractMinor = `
# CONTRATO DE PRESTAÇÃO DE SERVIÇOS (INFANTIL) - ALMEIDA JJ

**ALUNO (MENOR):** {{name}}, nascido em {{birthDate}}, doravante denominado ALUNO.

**RESPONSÁVEL LEGAL:** {{parent_name}}, CPF nº {{parent_cpf}}, residente em {{address}}, doravante denominado RESPONSÁVEL.

**CONTRATADA:** ALMEIDA CAMPANELLA LTDA (ALMEIDA JJ), CNPJ 10.123.456/0001-99, com sede na Av. Campanella, nº 1015 - Cidade AE Carvalho - São Paulo - SP.

### CLÁUSULA 1 - DO OBJETO
O presente contrato tem por objeto a prestação de serviços de ensino técnico e treinamento de Brazilian Jiu-Jitsu para o MENOR acima identificado.

### CLÁUSULA 2 - DO PLANO E VALORES
O RESPONSÁVEL optou pelo plano **{{plan}}** para o menor, com valor de **R$ {{payment_value}}**.

### CLÁUSULA 3 - DA RESPONSABILIDADE
O RESPONSÁVEL compromete-se a deixar e buscar o menor nos horários estipulados e a zelar pela integridade física e conduta do mesmo.

### CLÁUSULA 4 - DO CANCELAMENTO E REGRAS
Aplicam-se as mesmas regras de cancelamento e uso de imagem do contrato padrão adulto, sob responsabilidade do signatário legal.
`;

export const responsibilityTerm = `
# TERMO DE RESPONSABILIDADE E DECLARAÇÃO DE SAÚDE

Eu, **{{name}}** (ou seu responsável legal), declaro para os devidos fins que:

1. Estou em plenas condições de saúde física e mental para a prática de Brazilian Jiu-Jitsu.
2. Não possuo restrições médicas conhecidas que me impeçam de realizar atividades de alta intensidade.
3. Em caso de qualquer incidente, autorizo a equipe da ALMEIDA JJ a prestar os primeiros socorros ou encaminhar para o pronto-atendimento médico.

**Restrições Informadas no Cadastro:**
{{address}}

**CONTATO DE EMERGÊNCIA:** {{phone}}
`;
