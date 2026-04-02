# Backup e Segurança dos Dados - Almeida JJ

O sistema Almeida JJ possui múltiplas camadas de proteção para garantir que nenhum dado seja perdido. Aqui está como o backup funciona e como você pode fazer um backup manual.

## 1. Backups Automáticos (Servidor)
Como o sistema utiliza o **Supabase** (Google/AWS) como banco de dados:
*   **Backups Diários:** O Supabase realiza backups automáticos dos dados. Em caso de qualquer falha catastrófica no servidor, os dados podem ser restaurados.
*   **Point-in-Time Recovery (PITR):** Dependendo do plano, é possível voltar o banco de dados para um minuto específico do passado.

## 2. Backup do Código (GitHub)
Todo o código-fonte, interface e lógica do WhatsApp estão salvos no seu **GitHub**. 
* Mesmo que você delete a pasta do seu computador, o projeto está seguro na nuvem do GitHub.
* O Vercel mantém o histórico de todas as versões anteriores do site que já funcionaram.

## 3. Backup Manual (Exportação de Dados)
Adicionei agora no sistema a função de **Exportar Dados**.
* Na sua **Dashboard (como Master/Dono)**, você verá um botão chamado "Exportar Backup (CSV)".
* Ao clicar, o sistema gera instantaneamente uma planilha Excel (CSV) com todos os nomes, CPFs, status de pagamento e telefones dos alunos.
* **Recomendação:** Faça essa exportação uma vez por mês e guarde em um Pen Drive ou Google Drive pessoal por segurança extra.

## 4. Segurança de Acesso
* **Criptografia:** Todas as senhas são criptografadas pelo Supabase Auth. Nem o desenvolvedor nem o dono conseguem ver a senha real dos alunos ou funcionários.
* **RLS (Row Level Security):** O banco de dados tem regras que impedem que uma pessoa sem login consiga ler qualquer dado, mesmo que ela descubra o link do servidor.
