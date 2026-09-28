import pytest
from app.services.hash_service import HashService

def test_hash_service_deterministic():
    content = "Synthetic Fraud Evidence INC-001"
    hash1 = HashService.generate_sha256(content)
    hash2 = HashService.generate_sha256(content)
    assert hash1 == hash2
    assert len(hash1) == 64

def test_hash_service_different_content():
    content_a = "Evidence Version A"
    content_b = "Evidence Version B"
    hash_a = HashService.generate_sha256(content_a)
    hash_b = HashService.generate_sha256(content_b)
    assert hash_a != hash_b

def test_hash_service_empty_content():
    empty_hash = HashService.generate_sha256("")
    assert len(empty_hash) == 64
    assert empty_hash == "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"

def test_hash_service_verify():
    content = "Sample Evidence Text"
    expected = HashService.generate_sha256(content)
    assert HashService.verify_sha256(content, expected) is True
    assert HashService.verify_sha256(content + " modified", expected) is False
