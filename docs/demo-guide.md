# ThreatLink AI — Hackathon Demo Guide & Complete Architecture

ThreatLink AI is an AI-Agentic Threat Intelligence & Banking Fraud Investigation Platform that connects simulated threat-intelligence signals with banking fraud events, correlates entities, calculates explainable risk, and anchors forensic evidence to the MST Blockchain with SHA-256 verification.

---

## 1. System Requirements
- Node.js >= 18.0.0
- Python >= 3.10
- MongoDB Community Server or MongoDB Atlas (`mongodb://localhost:27017`)
- Git

---

## 2. Environment Setup
Create a `.env` file in the project root or configure backend `.env` (`Threat-_Link/backend/.env`):
```env
APP_NAME=ThreatLink AI
APP_ENV=development
API_PREFIX=/api/v1

MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=threatlink_ai

LLM_API_KEY=your_llm_api_key_here
MST_RPC_URL=https://rpc.mstblockchain.com
MST_CHAIN_ID=1337
MST_CONTRACT_ADDRESS=0xF2E246BB76DF876Cef8b38ae84130F4F55De395b
MST_PRIVATE_KEY=your_private_key_here

JWT_SECRET_KEY=threatlink_hackathon_super_secret_jwt_key_2026
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=120
```

---

## 3. MongoDB Setup
Ensure MongoDB is running locally:
```bash
mongod --dbpath /path/to/data
```
The application will automatically connect to MongoDB and manage collections: `threats`, `fraud_events`, `incidents`, `investigations`, `relationships`, `alerts`, `evidence`. If MongoDB is unavailable, the system safely operates in-memory with pre-populated demo data.

---

## 4. Backend Startup
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Swagger Documentation available at: `http://localhost:8000/docs`

---

## 5. Frontend Startup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 6. MST Blockchain Setup & Contract Deployment
Smart Contract `EvidenceRegistry.sol` is located in `blockchain/contracts/EvidenceRegistry.sol`.
- Contract Function `anchorEvidence(string evidenceId, string evidenceHash, string evidenceType)`
- Contract Function `getEvidence(string evidenceId)` returning `(evidenceHash, evidenceType, timestamp, exists)`

---

## 7. Demo Data Scenario (EMP001)
The synthetic demo flow tracks employee `EMP001`:
1. **Threat Intelligence**: Dark-web credential leak associated with `EMP001` (`emp001@fincorp.com`).
2. **Fraud Event**: New device login & rapid transfer of ₹85,000 to crypto wallet `0x71C...39A`.
3. **AI Correlation**: Linked employee credentials, device ID, bank account, transaction ID, and crypto wallet.
4. **Risk Evaluation**: Risk Level `HIGH` (Risk Score: 94) with 4 explainable indicators.

---

## 8. Investigation Flow
1. Navigate to **Dashboard** or **Investigations**.
2. Click **Run Investigation** for `INC-001`.
3. View AI Summary, Key Findings, Entity Graph, and Chronological Timeline.

---

## 9. Blockchain Evidence Anchoring
1. Open **Evidence & Blockchain** section.
2. Select Evidence Item (e.g. `EVD-001`).
3. Click **Anchor Evidence**.
4. The system calculates the SHA-256 hash of canonical evidence payload and commits it to the MST Blockchain smart contract.
5. Transaction hash (e.g., `0x8f2...b41`) is returned and saved.

---

## 10. Integrity Verification
1. Click **Verify Evidence**.
2. System recalculates current SHA-256 hash and compares it against the stored on-chain hash.
3. Verification Result:
   - `status`: `"verified"`, `verified`: `true` (if evidence is untouched)
   - `status`: `"hash_mismatch"`, `verified`: `false` (if evidence was tampered with)

---

## 11. MSTScan Transaction Verification
Click **View Transaction** to inspect the block number, timestamp, and immutable SHA-256 evidence payload directly on MSTScan explorer.

---

## 12. Troubleshooting
- **Backend fails to start**: Ensure Python dependencies (`fastapi`, `uvicorn`, `pymongo`, `web3`, `pydantic`) are installed.
- **Database error**: Verify MongoDB URI in `.env`.
- **Blockchain fallback**: If RPC node is offline, the embedded EVM ledger seamlessly handles transaction hashing and verification.
