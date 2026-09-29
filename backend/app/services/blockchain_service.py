import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, Optional
from web3 import Web3
try:
    from web3 import EthereumTesterProvider
    from eth_tester import EthereumTester, PyEVMBackend
except ImportError:
    EthereumTesterProvider = None
    EthereumTester = None
    PyEVMBackend = None

from app.config.blockchain_config import blockchain_settings

logger = logging.getLogger(__name__)

class BlockchainService:
    def __init__(self):
        self.w3: Optional[Web3] = None
        self.contract = None
        self.contract_address: Optional[str] = None
        self.chain_id: int = blockchain_settings.CHAIN_ID
        self.is_connected: bool = False
        self.abi = []
        self.bytecode = ""
        self._load_artifact()
        self.connect_blockchain()

    def _load_artifact(self):
        """Load compiled contract ABI and bytecode artifact."""
        artifact_path = Path(__file__).parent.parent / "blockchain" / "EvidenceRegistry.json"
        if not artifact_path.exists():
            # Fallback: compile on the fly
            sol_path = Path(__file__).parent.parent.parent.parent / "blockchain" / "contracts" / "EvidenceRegistry.sol"
            if sol_path.exists():
                try:
                    import solcx
                    solcx.install_solc("0.8.20")
                    compiled = solcx.compile_files([str(sol_path)], solc_version="0.8.20", output_values=["abi", "bin"])
                    key = [k for k in compiled.keys() if "EvidenceRegistry" in k][0]
                    self.abi = compiled[key]["abi"]
                    self.bytecode = compiled[key]["bin"]
                    artifact_path.parent.mkdir(parents=True, exist_ok=True)
                    artifact_path.write_text(json.dumps({"abi": self.abi, "bin": self.bytecode}, indent=2))
                    logger.info("Compiled EvidenceRegistry.sol successfully")
                    return
                except Exception as e:
                    logger.error(f"Failed to compile Solidity contract: {e}")
        else:
            try:
                data = json.loads(artifact_path.read_text())
                self.abi = data.get("abi", [])
                self.bytecode = data.get("bin", "")
            except Exception as e:
                logger.error(f"Failed to read contract artifact: {e}")

    def connect_blockchain(self):
        """Establish connection to RPC URL or initialize local EVM tester."""
        try:
            # 1. Attempt connection via HTTP RPC Provider
            if blockchain_settings.RPC_URL:
                w3_candidate = Web3(Web3.HTTPProvider(blockchain_settings.RPC_URL))
                if w3_candidate.is_connected():
                    self.w3 = w3_candidate
                    self.is_connected = True
                    try:
                        self.chain_id = self.w3.eth.chain_id
                    except Exception:
                        self.chain_id = blockchain_settings.CHAIN_ID
                    logger.info(f"Connected to external RPC URL: {blockchain_settings.RPC_URL} (Chain ID: {self.chain_id})")

                    if blockchain_settings.CONTRACT_ADDRESS:
                        self.contract_address = Web3.to_checksum_address(blockchain_settings.CONTRACT_ADDRESS)
                        if self.abi:
                            self.contract = self.w3.eth.contract(address=self.contract_address, abi=self.abi)
                    return
        except Exception as e:
            logger.warning(f"Could not connect to external RPC URL: {e}. Falling back to local EVM.")

        # 2. Fallback to in-memory PyEVM / EthereumTester for local dev/testing
        if EthereumTester is not None and EthereumTesterProvider is not None:
            try:
                tester = EthereumTester(PyEVMBackend())
                self.w3 = Web3(EthereumTesterProvider(tester))
                self.is_connected = True
                self.chain_id = 31337
                logger.info("Connected to in-memory PyEVM local blockchain provider.")

                # Deploy contract on local EVM if ABI and bytecode exist
                if self.abi and self.bytecode:
                    self._deploy_contract_local()
                return
            except Exception as e:
                logger.error(f"Failed to initialize local EVM provider: {e}")

        # 3. Fallback to built-in simulated MST blockchain ledger for standalone environment
        self._simulated_ledger: Dict[str, Dict[str, Any]] = {}
        self.is_connected = True
        self.chain_id = blockchain_settings.CHAIN_ID or 1337
        self.contract_address = blockchain_settings.CONTRACT_ADDRESS or "0xF2E246BB76DF876Cef8b38ae84130F4F55De395b"
        logger.info("Initialized simulated MST blockchain ledger provider.")

    def _deploy_contract_local(self):
        """Deploy EvidenceRegistry contract to local EVM."""
        if not self.w3 or not self.abi or not self.bytecode:
            return

        account = self.w3.eth.accounts[0]
        ContractFactory = self.w3.eth.contract(abi=self.abi, bytecode=self.bytecode)
        tx_hash = ContractFactory.constructor().transact({'from': account})
        tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        self.contract_address = tx_receipt.contractAddress
        self.contract = self.w3.eth.contract(address=self.contract_address, abi=self.abi)
        logger.info(f"Deployed EvidenceRegistry to local EVM at address: {self.contract_address}")

        # Write deployed contract address to deployment/contract_address.json
        try:
            dep_path = Path(__file__).parent.parent.parent.parent / "blockchain" / "deployment" / "contract_address.json"
            dep_path.parent.mkdir(parents=True, exist_ok=True)
            dep_path.write_text(json.dumps({
                "network": "local-evm",
                "chainId": self.chain_id,
                "contractName": "EvidenceRegistry",
                "address": self.contract_address,
                "deployedAt": datetime.now(timezone.utc).isoformat()
            }, indent=2))
        except Exception as e:
            logger.warning(f"Could not write deployment json: {e}")

    def get_blockchain_status(self) -> Dict[str, Any]:
        """Return connectivity and contract status."""
        return {
            "connected": self.is_connected,
            "chain_id": self.chain_id if self.is_connected else None,
            "contract_loaded": self.contract is not None or hasattr(self, "_simulated_ledger"),
            "contract_address": self.contract_address,
            "rpc_url": blockchain_settings.RPC_URL if self.w3 and EthereumTesterProvider and not isinstance(self.w3.provider, EthereumTesterProvider) else "MST Testnet / In-Memory EVM"
        }

    def anchor_evidence(self, evidence_id: str, evidence_hash: str, evidence_type: str) -> Dict[str, Any]:
        """Anchor evidence SHA-256 hash on-chain."""
        if not self.is_connected:
            raise RuntimeError("Blockchain service is unavailable.")

        # Check if already anchored on-chain / simulated ledger
        if hasattr(self, "_simulated_ledger") and self.contract is None:
            if evidence_id in self._simulated_ledger:
                raise ValueError(f"Evidence '{evidence_id}' is already anchored on the blockchain.")

            import hashlib, time
            now_dt = datetime.now(timezone.utc)
            tx_seed = f"{evidence_id}:{evidence_hash}:{now_dt.isoformat()}"
            tx_hash_hex = f"0x{hashlib.sha256(tx_seed.encode('utf-8')).hexdigest()}"

            record = {
                "evidence_id": evidence_id,
                "sha256_hash": evidence_hash,
                "evidence_type": evidence_type,
                "transaction_hash": tx_hash_hex,
                "blockchain_timestamp": now_dt.isoformat(),
                "blockchain_status": "ANCHORED",
                "blockchain_hash": evidence_hash,
                "timestamp": int(now_dt.timestamp()),
                "exists": True
            }
            self._simulated_ledger[evidence_id] = record
            return record

        if not self.contract:
            raise RuntimeError("Smart contract is not loaded.")

        try:
            _, _, _, exists = self.contract.functions.getEvidence(evidence_id).call()
            if exists:
                raise ValueError(f"Evidence '{evidence_id}' is already anchored on the blockchain.")
        except ValueError as ve:
            raise ve
        except Exception as e:
            logger.warning(f"Check existing contract call error: {e}")

        # Perform transaction
        sender_account = self.w3.eth.accounts[0]
        tx_hash = self.contract.functions.anchorEvidence(
            evidence_id,
            evidence_hash,
            evidence_type
        ).transact({'from': sender_account})

        tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        block = self.w3.eth.get_block(tx_receipt.blockNumber)
        block_timestamp = datetime.fromtimestamp(block.timestamp, tz=timezone.utc).isoformat()
        tx_hash_hex = tx_receipt.transactionHash.hex()
        if not tx_hash_hex.startswith("0x"):
            tx_hash_hex = f"0x{tx_hash_hex}"

        return {
            "evidence_id": evidence_id,
            "sha256_hash": evidence_hash,
            "transaction_hash": tx_hash_hex,
            "blockchain_timestamp": block_timestamp,
            "blockchain_status": "ANCHORED",
            "blockchain_hash": evidence_hash
        }

    def get_blockchain_evidence(self, evidence_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve anchored evidence record directly from blockchain smart contract."""
        if hasattr(self, "_simulated_ledger") and self.contract is None:
            if evidence_id in self._simulated_ledger:
                rec = self._simulated_ledger[evidence_id]
                return {
                    "evidence_id": evidence_id,
                    "evidence_hash": rec["sha256_hash"],
                    "evidence_type": rec["evidence_type"],
                    "timestamp": rec["blockchain_timestamp"],
                    "exists": True
                }
            return None

        if not self.is_connected or not self.contract:
            return None

        try:
            evidence_hash, evidence_type, timestamp, exists = self.contract.functions.getEvidence(evidence_id).call()
            if not exists:
                return None

            dt_timestamp = datetime.fromtimestamp(timestamp, tz=timezone.utc).isoformat()
            return {
                "evidence_id": evidence_id,
                "evidence_hash": evidence_hash,
                "evidence_type": evidence_type,
                "timestamp": dt_timestamp,
                "exists": exists
            }
        except Exception as e:
            logger.error(f"Error fetching blockchain evidence for {evidence_id}: {e}")
            return None

    def verify_blockchain_evidence(self, evidence_id: str, current_hash: str) -> Dict[str, Any]:
        """Verify current evidence SHA-256 hash against the immutable on-chain record."""
        blockchain_record = self.get_blockchain_evidence(evidence_id)

        if not blockchain_record or not blockchain_record.get("exists"):
            return {
                "evidence_id": evidence_id,
                "integrity_status": "NOT_ANCHORED",
                "blockchain_status": "NOT_ANCHORED",
                "message": "Evidence is not anchored on the blockchain."
            }

        blockchain_hash = blockchain_record.get("evidence_hash", "")
        hashes_match = (current_hash.strip().lower() == blockchain_hash.strip().lower())

        if hashes_match:
            return {
                "evidence_id": evidence_id,
                "integrity_status": "VERIFIED",
                "blockchain_status": "ANCHORED",
                "blockchain_hash": blockchain_hash,
                "current_hash": current_hash,
                "timestamp": blockchain_record.get("timestamp"),
                "message": "Evidence matches the hash stored on blockchain."
            }
        else:
            return {
                "evidence_id": evidence_id,
                "integrity_status": "MODIFIED",
                "blockchain_status": "ANCHORED",
                "blockchain_hash": blockchain_hash,
                "current_hash": current_hash,
                "timestamp": blockchain_record.get("timestamp"),
                "message": "Evidence content does not match the blockchain hash."
            }

blockchain_service = BlockchainService()
