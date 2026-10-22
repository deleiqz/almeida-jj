### AlmeidaJJ — Gestão & CRM para Academias

O **AlmeidaJJ** é uma plataforma robusta de Software as a Service (SaaS) focada na gestão administrativa, financeira e de relacionamento (CRM) para academias de artes marciais. O sistema centraliza desde o controle de fluxo de alunos até automações complexas de cobrança e notificações, reduzindo a inadimplência e eliminando processos manuais dos gestores. 

### 🚀 Funcionalidades Principais

* **Gestão Administrativa & CRM completo:** Cadastro integrado de alunos, planos customizáveis, controle de status de matrícula e histórico de evolução técnica.
* **Controle de Presenças & Graduação:** Módulo de chamada digital simplificado que rastreia a assiduidade dos alunos para automação do sistema de troca de faixas e graus.
* **Faturamento Automático (Mercado Pago API):** Integração para automação de cobranças recorrentes via Pix e Cartão de Crédito, controle financeiro em tempo real e atualização instantânea de fluxo de caixa.
* **Contratos Dinâmicos Client-Side:** Geração automatizada de contratos de adesão em formato PDF processados diretamente no navegador do usuário, economizando infraestrutura de servidor.
* **Bridge de Notificações para WhatsApp:** Motor integrado de mensageria que automatiza o envio de alertas de cobrança, lembretes de renovação de plano e interações de engajamento via WhatsApp.

### 🛠️ Tecnologias Utilizadas

Este ecossistema foi construído utilizando práticas modernas de desenvolvimento web: 

* **Frontend:** React.js / Next.js / Tailwind CSS / TypeScript
* **Gerenciamento de Estado & Hooks:** Context API / Custom Hooks estruturados
* **Geração de Documentos:** Client-Side PDF Generation Engine
* **Integrações de API:** Mercado Pago SDK / WhatsApp Gateway Bridge

### 🔒 Segurança e Boas Práticas

Este repositório é público, e todas as camadas de segurança necessárias para o ambiente de produção foram aplicadas: 

* **Proteção de Credenciais:** Nenhuma chave secreta, token ou URL de banco de dados está exposta no código-fonte. Toda a configuração sensitiva é gerenciada via variáveis de ambiente (.env) mapeadas no arquivo .gitignore.
* **Identidade Criptográfica (Commits Verificados):** Todos os commits oficiais feitos neste repositório são assinados digitalmente através de chaves GPG, garantindo a autoria legítima do desenvolvedor e prevenindo falsificação de identidade (commit spoofing).
* **Bloqueio de Acesso Malicioso:** Componentes dedicados à validação de acessos garantem a integridade das rotas internas do ecossistema.

### 📦 Como Instalar e Rodar o Projeto Localmente

1. Clone o repositório em sua máquina: 

bash

git clone https://github.com/deleiqz/almeida-jj.git

Use code with caution.
2. Acesse a pasta do projeto: 

bash

cd almeida-jj

Use code with caution.
3. Instale todas as dependências necessárias: 

bash

npm install

Use code with caution.
4. Crie e configure o arquivo de variáveis de ambiente com base no modelo fornecido: 

bash

cp .env.example .env

Use code with caution.

*(Abra o arquivo .env criado e preencha com as suas chaves de testes do Mercado Pago e do provedor de WhatsApp).*
5. Inicie o servidor de desenvolvimento local: 

bash

npm run dev

Use code with caution.

### 📄 Licença

Este projeto está licenciado sob a **Licença MIT** - consulte o arquivo [LICENSE](LICENSE) para obter mais detalhes. Seu uso para estudo e portfólio é totalmente livre.