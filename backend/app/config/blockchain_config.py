import os
from dotenv import load_dotenv

load_dotenv()

class BlockchainSettings:
    RPC_URL: str = os.getenv("BLOCKCHAIN_RPC_URL", "https://rpc.mstblockchain.com")
    CHAIN_ID: int = int(os.getenv("BLOCKCHAIN_CHAIN_ID", "1337"))
    CONTRACT_ADDRESS: str = os.getenv("BLOCKCHAIN_CONTRACT_ADDRESS", "0xF2E246BB76DF876Cef8b38ae84130F4F55De395b")
    PRIVATE_KEY: str = os.getenv("BLOCKCHAIN_PRIVATE_KEY", "0x3a19b8472910a84f3e2d1c0b9a8f7e6d5a4b3c2d1e0f98765432109876543210")

blockchain_settings = BlockchainSettings()
