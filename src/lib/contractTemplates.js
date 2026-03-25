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
# TERMO DE RESPONSABILIDADE PARA PRÁTICA DE JIU-JITSU
**ACADEMIA DE JIU-JITSU ALMEIDA JJ**

**CONTRATADA:** Academia de Jiu-Jitsu Almeida JJ
**Endereço:** Av: Campanella, nº 1015 - Cidade AE Carvalho - São Paulo - SP

**CONTRATANTE RESPONSÁVEL LEGAL:**
**Nome:** {{parent_name_or_self}}
**CPF:** {{parent_cpf_or_self}}
**Endereço:** {{address}}
**Telefone:** {{phone}}
**E-mail:** {{email}}

**ALUNO:**
**Nome:** {{name}}
**Data de Nascimento:** {{birthDate}}
**Telefone:** {{phone}}

**DECLARAÇÕES DO PARTICIPANTE / RESPONSÁVEL**
Declaro, para os devidos fins, que:

1. Estou ciente de que o jiu-jitsu é uma atividade física de contato, que envolve riscos inerentes, tais como quedas, torções, contusões, luxações e outras lesões corporais.
2. Declaro que o participante encontra-se apto para a prática de atividade física, não possuindo restrições médicas que impeçam sua participação, ou, caso possua, assumo integral responsabilidade pela sua prática.
3. Comprometo-me a informar previamente à academia qualquer condição de saúde, lesão, limitação física ou uso de medicamentos que possam interferir na prática esportiva.
4. Estou ciente de que a prática do jiu-jitsu exige disciplina, atenção e respeito às orientações do professor, sendo minha responsabilidade seguir todas as instruções.
5. Reconheço que a academia e seus instrutores não se responsabilizam por lesões decorrentes da prática esportiva regular, desde que não haja dolo ou negligência comprovada.
6. Declaro estar ciente de que devo interromper imediatamente a atividade caso sinta dor, desconforto ou qualquer sinal anormal, comunicando o professor.

Autorizo, em caso de necessidade, a adoção de medidas de primeiros socorros pela equipe da academia.
O presente termo é firmado de forma livre e consciente, assumindo total responsabilidade pelas informações prestadas e pela participação na atividade.

São Paulo, {{day}} de {{month}} de 2026
`;
