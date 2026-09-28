from typing import Literal

SourceType = Literal[
    "threat", "dark_web", "fraud_event", "entity", "account", "transaction", "device", "wallet"
]
RelationshipType = Literal[
    "same_entity", "same_account", "same_device", "same_transaction", "same_wallet", "related_threat"
]

class RelationshipModel:
    COLLECTION_NAME = "relationships"
