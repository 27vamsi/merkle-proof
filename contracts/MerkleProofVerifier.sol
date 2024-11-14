// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MerkleProofVerifier {
    bytes32 private merkleRoot;
    address public owner;
    
    event MerkleRootSet(bytes32 indexed root);
    event ProofVerified(bytes32 indexed leaf, bool result);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function setMerkleRoot(bytes32 _root) external onlyOwner {
        merkleRoot = _root;
        emit MerkleRootSet(_root);
    }

    function getMerkleRoot() external view returns (bytes32) {
        return merkleRoot;
    }

    function verifyProof(
        bytes32[] calldata proof,
        bytes32 root,
        bytes32 leaf
    ) public pure returns (bool) {
        bytes32 computedHash = leaf;

        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];

            if (computedHash <= proofElement) {
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }

        return computedHash == root;
    }

    function verifyTransaction(
        bytes32[] calldata proof,
        bytes32 leaf
    ) external returns (bool) {
        bool result = verifyProof(proof, merkleRoot, leaf);
        emit ProofVerified(leaf, result);
        return result;
    }
}