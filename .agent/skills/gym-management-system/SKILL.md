---
name: Gym Management System (Almeida JJ)
description: Full-stack gym/academy management platform with Supabase, WhatsApp automation, digital contracts, and public student registration.
---

# Gym Management System Skill

## Overview

This skill documents a complete gym/academy management SaaS platform built for **Almeida JJ** (Brazilian Jiu-Jitsu). It enables a future Antigravity session to understand, maintain, extend, or replicate the entire system without any additional context.

The system provides:
- **Dashboard** with real-time financial analytics (revenue, expenses, profit)
- **Student Management** (CRUD, belt tracking, attendance, payment status)
- **Public Registration Form** with digital signature capture
- **Dynamic Legal Contracts** (Adult/Minor) and a Responsibility Term
- **WhatsApp Automation** via a local bridge server for mass messaging
- **Role-Based Access Control** (Developer Master, Dono Master, Funcionário)
- **Supabase Row Level Security (RLS)** for database protection

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
| `CONFIGURAR_SISTEMA.bat` | Root | System setup automation |
| `gerar_contrato_abnt.py` | Root | Python script to generate ABNT-formatted contracts |
| `whatsapp-bridge/server.js` | `whatsapp-bridge/` | Express server that bridges WhatsApp Web to the frontend |
| `whatsapp-bridge/ngrok.exe` | `whatsapp-bridge/` | Optional tunnel for exposing bridge to the internet |

---

## API / Integration Details

### Supabase (Backend-as-a-Service)
- **Project ID**: `dospnbzzcjrmwpakldmy`
- **Auth**: Email/password login via `supabase.auth.signInWithPassword()`
- **Storage Bucket**: `documents` (public, stores digital signatures)
- **Client Init**: `src/lib/supabase.js` using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### WhatsApp Bridge (Local REST API)

**Base URL**: `http://localhost:3000` (configurable in Notifications.jsx)

#### `GET /status`
Returns the bridge connection status.
```json
{
  "connected": true,
  "messageCount": 42,
  "platform": "win32",
  "uptime": 3600
}
```

#### `GET /qr`
Returns an HTML page with the QR code image for WhatsApp Web authentication.

#### `POST /send-message`
Sends a WhatsApp message to a single phone number.
```json
// Request
{
  "phone": "5511999999999",
  "message": "Olá! Sua mensalidade vence dia 24."
}

// Success Response
{ "success": true }

// Error Response (503 - Not Connected)
{ "error": "WhatsApp não está conectado ainda." }
```

**Important**: Each message has a built-in random delay of 10-15 seconds between sends to avoid WhatsApp bans.

### Vercel (Frontend Hosting)
- **Domain**: `almeida-jj.vercel.app`
- **Config**: `vercel.json` — SPA rewrite rule sends all routes to `index.html`
- **Auto-deploy**: Pushes to `main` branch trigger automatic builds

---

## Database / Storage Schema

### Supabase Tables

#### `students`
| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Auto-generated |
| `name` | text | Full name |
| `phone` | text | WhatsApp number |
| `email` | text | Email address |
| `address` | text | Full address |
| `cpf` | text | Brazilian tax ID |
| `birth_date` | date | Date of birth |
| `belt` | text | Current belt (Branca, Azul, etc.) |
| `status` | text | Payment status (ativo, pendente, inativo) |
| `plan` | text | Subscription plan (Mensal, Trimestral, Anual) |
| `sub_plan` | text | Training tier (evolucao, performance) |
| `payment_value` | text | Monthly amount (e.g., "120") |
| `payment_method` | text | Payment method (pix, debito, credito, dinheiro) |
| `next_due` | date | Next payment due date |
| `last_payment` | date | Last payment date |
| `parent_name` | text | Guardian name (if minor) |
| `parent_cpf` | text | Guardian CPF (if minor) |
| `medical_info` | text | Medical restrictions |
| `has_authorization` | boolean | Image rights authorization |
| `marketing_auth` | boolean | Marketing/WhatsApp message consent |
| `document_url` | text | URL to uploaded digital signature image |
| `created_at` | timestamptz | Auto-generated creation timestamp |

#### `expenses`
| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Auto-generated |
| `description` | text | Expense description |
| `amount` | numeric | Expense value |
| `category` | text | Category (Aluguel, Material, etc.) |
| `due_date` | date | Due date |
| `paid` | boolean | Whether paid |
| `payment_method` | text | How it was paid |

#### `classes`
| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Auto-generated |
| `name` | text | Class name |
| `day` | text | Day of week |
| `time` | text | Class time |
| `instructor` | text | Instructor name |

#### `attendance`
| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Auto-generated |
| `student_id` | uuid (FK) | References students.id |
| `class_id` | uuid (FK) | References classes.id |
| `date` | date | Attendance date |

#### `class_enrollments`
| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Auto-generated |
| `student_id` | uuid (FK) | References students.id |
| `class_id` | uuid (FK) | References classes.id |

### Row Level Security (RLS) Policies
All tables have RLS enabled with these policies:
- **`students`**: Public `INSERT` allowed (for registration form). Authenticated users have full access.
- **All other tables**: Only authenticated users have access (full CRUD).

### Storage Bucket: `documents`
- **Public read/write** for signature uploads during registration
- Stores files at path: `registration-docs/signature_<timestamp>.png`

---

## Role-Based Access Control

Roles are determined by the `role` field in the Supabase `users_metadata` table and the user's email:

| Role | Access | Determined By |
|---|---|---|
| **Desenvolvedor Master** | Everything + all WhatsApp modes + server config | Email = `vaandias@gmail.com` |
| **Dono Master** | All tabs including Financeiro | `role` contains 'admin' or 'dono' |
| **Funcionário** | All tabs except Financeiro; only "WhatsApp" send mode | Default role |

**Implementation**: See `App.jsx` lines 132-136 for the role normalization logic:
```javascript
const isDevMaster = safeUserEmail === 'vaandias@gmail.com' || safeUserEmail.includes('vaandias');
const isAdmin = normalizedRole.includes('admin') || normalizedRole.includes('master') || normalizedRole.includes('dono') || isDevMaster;
```

### WhatsApp Notification Modes
| Mode | Tab Label | Who Can See | Description |
|---|---|---|---|
| `manual` | Modo Manual (Abas) | Dev Master only | Opens individual WhatsApp tabs |
| `api` | Modo Profissional (Z-API) | Dev Master only | Uses Z-API cloud service |
| `local` | WhatsApp | Everyone | Uses local bridge server |

---

## Contract Templates

Located in `src/lib/contractTemplates.js`. Three exports:

1. **`studentContractAdult`** — Adult student contract
2. **`studentContractMinor`** — Minor student contract (includes guardian fields)
3. **`responsibilityTerm`** — Health/liability waiver (matches official PDF from gym owners)

### Template Placeholders
| Placeholder | Source Field | Description |
|---|---|---|
| `{{name}}` | `student.name` | Student full name |
| `{{cpf}}` | `student.cpf` | Student CPF |
| `{{email}}` | `student.email` | Student email |
| `{{birthDate}}` | `student.birth_date` | Formatted birth date |
| `{{address}}` | `student.address` | Full address |
| `{{phone}}` | `student.phone` | Phone/WhatsApp |
| `{{plan}}` | `student.plan` | Subscription plan |
| `{{sub_plan}}` | `student.sub_plan` | Training tier |
| `{{payment_value}}` | `student.payment_value` | Monthly amount |
| `{{paymentMethod}}` | `student.payment_method` | Payment method |
| `{{parent_name}}` | `student.parent_name` | Guardian name |
| `{{parent_cpf}}` | `student.parent_cpf` | Guardian CPF |
| `{{image_auth}}` | `student.has_authorization` | AUTORIZADO / NÃO AUTORIZADO |
| `{{parent_name_or_self}}` | Conditional | Guardian if minor, self if adult |
| `{{parent_cpf_or_self}}` | Conditional | Guardian CPF if minor, self if adult |
| `{{day}}` | `Date.getDate()` | Current day number |
| `{{month}}` | Portuguese month name | Current month in Portuguese |

---

## Design System

### Theme
- **Background**: `#0a0a0a` (near-black)
- **Primary Accent**: `#ffd700` (gold)
- **Success**: `#10b981` (emerald green)
- **Danger**: `#ef4444` (red)
- **Text Primary**: `#ffffff`
- **Text Secondary**: `#a1a1aa`
- **Glass Effect**: `rgba(255, 255, 255, 0.03)` background with subtle borders

### Typography
- **Primary Font**: `'Outfit'` (Google Fonts)
- **Fallback**: `sans-serif`

### UI Patterns
- Dark glassmorphism panels (`.glass` class)
- Gold accent borders on active states
- Smooth transitions on hover (0.2s ease)
- Responsive sidebar navigation
- Custom-styled dropdowns (no native appearance)

### Branding Footer
The sidebar includes a subtle "Desenvolvido por VANDERLEI DIAS" credit at the bottom, styled in gold with 50% opacity.

---

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/deleiqz/almeida-jj.git AG
cd AG && npm install
cd whatsapp-bridge && npm install && cd ..

# 2. Create .env file with Supabase credentials
# VITE_SUPABASE_URL=https://dospnbzzcjrmwpakldmy.supabase.co
# VITE_SUPABASE_ANON_KEY=<key>

# 3. Start development
npm run dev

# 4. (Optional) Start WhatsApp bridge
cd whatsapp-bridge && npm start

# 5. Access the app
# Admin Panel: http://localhost:5173
# Public Registration: http://localhost:5173/?registro
# Contract View: http://localhost:5173/?contrato=<STUDENT_UUID>
```

### Production URLs
- **Admin Panel**: `https://almeida-jj.vercel.app`
- **Public Registration**: `https://almeida-jj.vercel.app/?registro`
- **Contract View**: `https://almeida-jj.vercel.app/?contrato=<UUID>`

---

## Dependencies

### Frontend (`package.json`)
| Package | Version | Purpose |
|---|---|---|
| `react` | ^19.2.4 | UI framework |
| `react-dom` | ^19.2.4 | DOM rendering |
| `@supabase/supabase-js` | ^2.99.2 | Supabase client |
| `lucide-react` | ^0.577.0 | Icon library |
| `recharts` | ^3.8.0 | Dashboard charts |
| `framer-motion` | ^12.38.0 | Animations |
| `vite` | ^8.0.0 | Build tool |

### WhatsApp Bridge (`whatsapp-bridge/package.json`)
| Package | Version | Purpose |
|---|---|---|
| `express` | ^4.18.2 | HTTP server |
| `cors` | ^2.8.5 | Cross-origin requests |
| `whatsapp-web.js` | ^1.23.0 | WhatsApp Web automation |
| `qrcode` | ^1.5.3 | QR code generation (web) |
| `qrcode-terminal` | ^0.12.0 | QR code in terminal |
