import os
from dotenv import load_dotenv

load_dotenv()

class BlockchainSettings:
    RPC_URL: str = os.getenv("BLOCKCHAIN_RPC_URL", "http://127.0.0.1:8545")
    CHAIN_ID: int = int(os.getenv("BLOCKCHAIN_CHAIN_ID", "31337"))
    CONTRACT_ADDRESS: str = os.getenv("BLOCKCHAIN_CONTRACT_ADDRESS", "")
    PRIVATE_KEY: str = os.getenv("BLOCKCHAIN_PRIVATE_KEY", "")

blockchain_settings = BlockchainSettings()
