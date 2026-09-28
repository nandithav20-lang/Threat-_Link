import hashlib
import json
from typing import Any

class HashService:
    @staticmethod
    def generate_sha256(content: Any) -> str:
        """
        Generates a 64-character hexadecimal SHA-256 hash.
        Supports string content and dict/list structured JSON content using deterministic serialization.
        """
        if content is None:
            raw_str = ""
        elif isinstance(content, (dict, list)):
            raw_str = json.dumps(content, sort_keys=True, separators=(',', ':'))
        elif not isinstance(content, str):
            raw_str = str(content)
        else:
            raw_str = content

        utf8_bytes = raw_str.encode('utf-8')
        return hashlib.sha256(utf8_bytes).hexdigest()

    @staticmethod
    def verify_sha256(content: Any, expected_hash: str) -> bool:
        """
        Recalculates SHA-256 for current content and compares with expected hash in constant time.
        """
        if not expected_hash:
            return False
        current_hash = HashService.generate_sha256(content)
        # Constant time string comparison
        import hmac
        return hmac.compare_digest(current_hash.lower(), expected_hash.lower())
