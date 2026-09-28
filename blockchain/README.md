# ThreatLink AI Blockchain Evidence Registry

This module provides Solidity smart contracts and Web3 integration for immutable evidence integrity anchoring.

## Architecture

- **`contracts/EvidenceRegistry.sol`**: Solidity contract for storing evidence SHA-256 hashes and block timestamps.
- **`deployment/contract_address.json`**: Records the active deployed contract address and network metadata.
- **`backend/app/blockchain/EvidenceRegistry.json`**: Compiled contract ABI artifact used by `Web3Service`.

## Smart Contract Design

The `EvidenceRegistry` contract stores:
- `evidenceId` (string)
- `evidenceHash` (64-character SHA-256 hex string)
- `evidenceType` (string)
- `timestamp` (uint256 block timestamp)
- `exists` (bool flag)

> **Security Note:** Sensitive data (passwords, PII, credentials, raw contents) is **never** committed to the blockchain. Only SHA-256 cryptographic hashes and minimal metadata are anchored.

## Deployment & Verification

1. Run the local EVM node or test suite.
2. Compile `EvidenceRegistry.sol` using `py-solc-x` / `solc` (solc 0.8.20).
3. Deploy to local EVM.
4. Interact via ThreatLink AI REST API endpoints:
   - `GET /api/v1/blockchain/status`
   - `POST /api/v1/evidence/{id}/anchor`
   - `POST /api/v1/evidence/{id}/verify-blockchain`
