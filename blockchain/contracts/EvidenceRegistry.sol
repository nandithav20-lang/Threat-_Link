// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EvidenceRegistry
 * @dev Anchors SHA-256 evidence integrity hashes on-chain for ThreatLink AI.
 * NO sensitive data (PII, credentials, passwords, raw data) is stored on-chain.
 */
contract EvidenceRegistry {

    struct EvidenceRecord {
        string evidenceId;
        string evidenceHash;
        string evidenceType;
        uint256 timestamp;
        bool exists;
    }

    // Mapping from evidenceId => EvidenceRecord
    mapping(string => EvidenceRecord) private registry;

    // Event emitted when evidence is anchored
    event EvidenceAnchored(
        string indexed evidenceIdIndex,
        string evidenceId,
        string evidenceHash,
        string evidenceType,
        uint256 timestamp
    );

    /**
     * @notice Anchor evidence SHA-256 hash on-chain.
     * @param _evidenceId Unique evidence identifier (e.g., EVD-001)
     * @param _evidenceHash 64-character hex SHA-256 string
     * @param _evidenceType Category of evidence (e.g., FRAUD, DARK_WEB)
     */
    function anchorEvidence(
        string memory _evidenceId,
        string memory _evidenceHash,
        string memory _evidenceType
    ) external {
        require(bytes(_evidenceId).length > 0, "Evidence ID cannot be empty");
        require(bytes(_evidenceHash).length > 0, "Evidence hash cannot be empty");
        require(!registry[_evidenceId].exists, "Evidence already anchored");

        uint256 currentTimestamp = block.timestamp;

        registry[_evidenceId] = EvidenceRecord({
            evidenceId: _evidenceId,
            evidenceHash: _evidenceHash,
            evidenceType: _evidenceType,
            timestamp: currentTimestamp,
            exists: true
        });

        emit EvidenceAnchored(
            _evidenceId,
            _evidenceId,
            _evidenceHash,
            _evidenceType,
            currentTimestamp
        );
    }

    /**
     * @notice Retrieve anchored evidence details from the blockchain registry.
     * @param _evidenceId Unique evidence identifier
     * @return evidenceHash Stored SHA-256 hash
     * @return evidenceType Category of evidence
     * @return timestamp Block timestamp when anchored
     * @return exists True if evidence exists on-chain
     */
    function getEvidence(string memory _evidenceId)
        external
        view
        returns (
            string memory evidenceHash,
            string memory evidenceType,
            uint256 timestamp,
            bool exists
        )
    {
        EvidenceRecord memory record = registry[_evidenceId];
        return (
            record.evidenceHash,
            record.evidenceType,
            record.timestamp,
            record.exists
        );
    }
}
