# ThreatLink AI

AI-Agentic Dark Web Threat Intelligence & Banking Fraud Investigation Platform.

## Team
```text
Mytri      - Frontend
Ashik      - Backend
Nanditha   - AI / Agents
Yashwanth  - Blockchain
```

## Features & Authentication
- **Supabase Authentication**: Integrated `@supabase/ssr` & `@supabase/supabase-js` with real password authentication and domain validation.
- **Google OAuth 2.0**: Native single sign-on support via Supabase Auth.
- **Threat Intelligence Registry**: Real-time indicators management with persistent local and remote sync.
- **Blockchain Evidence Ledger**: Smart contract verification (`EvidenceRegistry.sol`) for immutable evidence anchoring.

## Main Concept Workflow
```text
Dark Web Threat ➔ Banking Activity ➔ AI Analysis ➔ Threat Correlation ➔ Risk Ranking ➔ Evidence Ledger ➔ Blockchain Verification
```

## Project Structure
```text
threatlink-ai/
│
├── frontend/        # Next.js 16 React App with Tailwind & Supabase Auth
├── backend/         # FastAPI Python Backend
├── blockchain/      # Solidity Smart Contracts & Verification
├── docs/            # Architecture & Supabase Auth Documentation
├── .gitignore
└── README.md
```

## Getting Started

### 1. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 2. Environment Configuration (`frontend/.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_<your-key>
```
