---
name: Gym Management System (Almeida JJ)
description: Full-stack gym/academy management platform with Supabase, WhatsApp automation, digital contracts, and public student registration.
---

# Almeida JJ Master Ecosystem Skill 🏛️🛡️

Esta skill documenta o ecossistema completo de gestão e automação para a **Almeida JJ** (Brazilian Jiu-Jitsu). Ela serve como o "DNA" do projeto, permitindo que qualquer sessão futura entenda, mantenha ou replique o sistema inteiro de forma "Inquebrável".

O império está dividido em quatro **Módulos de Poder**:
1.  **📡 Módulo ORÁCULO (Comunicação)**: Automação de WhatsApp para engajamento e cobrança.
2.  **📜 Módulo HERMES (Sincronia & Contratos)**: Onboarding SaaS, PDFs multi-página e espelhamento no Airtable.
3.  **🥋 Módulo DOJO (Gestão Técnica)**: Controle de alunos, faixas, presenças e registros públicos.
4.  **💰 Módulo TESOURARIA (Analítico)**: Dashboards financeiros, controle de gastos e faturamento.

---

## Folder Structure

```
AG/                                  # Project root
├── .agent/skills/                   # Antigravity skills (this file)
├── contratos/                       # Source PDF contracts from the gym owners
│   ├── CONTRATO ALMEIDA JJ ADULTO.pdf
│   ├── CONTRATO ALMEIDA JJ INFANTIL.pdf
│   └── TERMO DE RESPONSABILIDADE 11.pdf
├── src/
│   ├── App.jsx                      # Main app: routing, sidebar, role logic
│   ├── main.jsx                     # React entry point
│   ├── index.css                    # Global dark theme styles
│   ├── App.css                      # Component-level styles
│   ├── assets/                      # Logo (logo.jpg) and background (jj-bg.png)
│   ├── components/
│   │   ├── Dashboard.jsx            # Financial dashboard with Recharts graphs
│   │   ├── StudentList.jsx          # Student CRUD, share modal, contract link
│   │   ├── RegistrationForm.jsx     # Public self-registration form (/?registro)
│   │   ├── ContractView.jsx         # Renders signed contracts (/?contrato=ID)
│   │   ├── BeltControl.jsx          # Belt promotion based on attendance
│   │   ├── Attendance.jsx           # Daily attendance tracking
│   │   ├── ClassList.jsx            # Class management (CRUD)
│   │   ├── Notifications.jsx        # WhatsApp messaging UI (3 modes)
│   │   ├── ExpenseList.jsx          # Financial expense tracking
│   │   ├── Login.jsx                # Supabase Auth login screen
│   │   ├── Maintenance.jsx          # System utilities panel
│   │   ├── Modal.jsx                # Reusable modal component
│   │   └── ErrorBoundary.jsx        # React error boundary wrapper
│   ├── hooks/
│   │   └── useStore.js              # Central data store (Supabase CRUD)
│   └── lib/
│       ├── supabase.js              # Supabase client initialization
│       └── contractTemplates.js     # Legal contract text templates
├── whatsapp-bridge/                 # Standalone WhatsApp server
│   ├── server.js                    # Express + whatsapp-web.js bridge
│   ├── package.json                 # Bridge dependencies
│   ├── .wwebjs_auth/                # Persistent WhatsApp session data
│   └── ngrok.exe                    # Optional tunnel for remote access
├── iniciar_whatsapp_invisivel.vbs   # Runs bridge silently in background
├── LIGAR_MOTOR_WHATSAPP.bat         # Manual bridge launcher
├── CONFIGURAR_SISTEMA.bat           # System setup script
├── vercel.json                      # SPA rewrite rules for Vercel
├── vite.config.js                   # Vite configuration
└── package.json                     # Frontend dependencies
```

---

## Critical Rules

### Always Do
- **Run `npm install`** in both `AG/` and `AG/whatsapp-bridge/` before any dev work.
- **Use environment variables** for Supabase credentials (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` in `.env`).
- **Maintain the dark theme** with gold accents (`#ffd700`) throughout all UI changes.
- **Keep RLS enabled** on all Supabase tables. Never disable it.
- **Use `isDevMaster`** check for any admin-only features. The master developer email is `vaandias@gmail.com`.
- **Test the public registration** (`/?registro`) on mobile after any form changes.
- **Commit and push** after each meaningful change — auto-deploys via Vercel.

### Never Do
- **Never expose the Supabase service_role key** in frontend code. Only use the anon key.
- **Never remove the `agreedToTerms` checkbox** — it's a legal requirement.
- **Never change contract template text** without explicit approval from the gym owners.
- **Never auto-run `git push`** without confirming the build succeeds locally first.
- **Never install TailwindCSS** — the project uses vanilla CSS by design choice.

### User Approval Checkpoints
1. **Database schema changes** — Always show the SQL script and get approval before running.
2. **Contract text modifications** — The gym owners must approve any legal text changes.
3. **WhatsApp bridge changes** — Warn that restarting the bridge disconnects the current session.
4. **RLS policy changes** — Show the exact SQL and explain the impact before executing.

### Cost Warnings
- **Supabase**: Free tier covers this project. Warn if approaching 500MB database or 1GB storage.
- **Vercel**: Free tier covers the frontend. Warn if build minutes exceed limits.
- **Image generation**: Always show estimated cost before generating any images.

---

## Step-by-Step Process

### 1. Initial Setup (New Machine)
```bash
# Clone the repository
git clone https://github.com/deleiqz/almeida-jj.git AG
cd AG

# Install frontend dependencies
npm install

# Install WhatsApp bridge dependencies
cd whatsapp-bridge
npm install
cd ..
```

### 2. Environment Configuration
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=https://dospnbzzcjrmwpakldmy.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

### 3. Local Development
```bash
# Start the frontend dev server
npm run dev
# → Opens at http://localhost:5173

# In a separate terminal, start the WhatsApp bridge
cd whatsapp-bridge
npm start
# → Runs at http://localhost:3000
# → Scan the QR code with WhatsApp on first run
```

### 4. WhatsApp Bridge (Background Mode on Windows)
```bash
# Option A: Double-click the VBS script
iniciar_whatsapp_invisivel.vbs
# → Starts the bridge invisibly (no terminal window)

# Option B: Use Windows Task Scheduler
# Create a task that runs the VBS script "At log on"
# This ensures the bridge restarts automatically after reboots
```

### 5. Deployment
```bash
# Build for production
npm run build

# Deploy (auto-deploys on git push to main)
git add .
git commit -m "feat: description"
git push origin main
# → Vercel auto-deploys from GitHub
```

### 6. Public Registration URL
```
https://almeida-jj.vercel.app/?registro
```
This renders the `RegistrationForm.jsx` component directly (no login required).

### 7. Contract View URL
```
https://almeida-jj.vercel.app/?contrato=<STUDENT_ID>
```
This renders the `ContractView.jsx` component with the student's signed contract.

---

## Available Tools & Scripts

| Tool / Script | Location | Purpose |
|---|---|---|
| `iniciar_whatsapp_invisivel.vbs` | Root | Launches WhatsApp bridge silently in background |
| `LIGAR_MOTOR_WHATSAPP.bat` | Root | Manual WhatsApp bridge launcher (visible terminal) |
| `CONFIGURAR_S## Módulos de Poder e Padrões Técnicos

### 1. 📡 Módulo ORÁCULO (WhatsApp Bridge)
- **Motor**: Node.js + `whatsapp-web.js`.
- **Modo de Operação**: Roda como um servidor local (`port 3000`) em uma máquina Windows dedicada.
- **Resiliência**: Utiliza `iniciar_whatsapp_invisivel.vbs` para persistência em segundo plano.
- **Segurança**: Intervalo aleatório de 10-15s entre envios para evitar banimentos.

### 2. 📜 Módulo HERMES (Onboarding & Sincronia)
- **Auto-Scanner (PDF)**: Implementa um loop que picota o canvas HTML em fatias A4, suportando contratos de 3+ páginas via `jsPDF`.
- **Blindagem de Assinatura**: Uso de filtro `brightness(0)` nas assinaturas PNG para garantir tinta preta no PDF branco.
- **Sincronia Mestra**: Trigger SQL `AFTER INSERT OR UPDATE` que utiliza o método `PATCH` com `performUpsert` no Airtable, usando `Link ID` como âncora.
- **Recuperação de Link**: Lógica no frontend que detecta `link_id` na URL e recupera automaticamente o estado de pagamento/sucesso do usuário.

### 3. 🥋 Módulo DOJO (Gestão de Alunos)
- **Registro Público**: URL `/?registro` acessível sem senha para novos alunos.
- **Sistema de Faixas**: Promoção visual e lógica baseada no histórico de frequência (`Attendance.jsx`).
- **RLS (Security)**: Políticas públicas para `INSERT` na tabela `students` e polícias restritas para o dashboard.

### 4. 💰 Módulo TESOURARIA (Financeiro)
- **Analíticos**: Gráficos dinâmicos via `Recharts` integrados diretamente com a tabela `expenses` e `students`.
- **Controle de Acesso**: Aba "Financeiro" visível apenas para usuários com permissão `admin` ou `dono`.

---

## Passo a Passo: O Setup Lendário

1.  **Clone e Instalação**: Seguir a estrutura de pastas descrita acima.
2.  **Configuração Supabase**: Criar o bucket `documents` (público) e as tabelas conforme o schema.
3.  **Segredo do Airtable**: Salvar o `AIRTABLE_PAT` e `BASE_ID` no script SQL do gatilho `tr_sync_airtable`.
4.  **Ligar o Oráculo**: Executar `LIGAR_MOTOR_WHATSAPP.bat` e escanear o QR Code.
5.  **Deploy**: Puxar para a `main` para atualização automática via Vercel.

---

## Checklist de Estabilização (Sempre Verificar)
- [ ] O arquivo `consolidated_sql.sql` foi rodado no Supabase?
- [ ] O `Link ID` está definido como único no banco?
- [ ] O redirecionamento de SPAs (`vercel.json`) está correto?
- [ ] O Oráculo está rodando na máquina local com conexão ativa?

---

**Ecossistema Almeida JJ: Blindado, Automatizado e Lendário.** 🛡️🚀🏆
`vite` | ^8.0.0 | Build tool |

### WhatsApp Bridge (`whatsapp-bridge/package.json`)
| Package | Version | Purpose |
|---|---|---|
| `express` | ^4.18.2 | HTTP server |
| `cors` | ^2.8.5 | Cross-origin requests |
| `whatsapp-web.js` | ^1.23.0 | WhatsApp Web automation |
| `qrcode` | ^1.5.3 | QR code generation (web) |
| `qrcode-terminal` | ^0.12.0 | QR code in terminal |
