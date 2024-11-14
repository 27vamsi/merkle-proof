const { expect } = require("chai");
const { ethers } = require("hardhat");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

describe("MerkleProofVerifier", function () {
  let merkleProofVerifier;
  let owner;
  let addr1;
  let transactions;
  let merkleTree;

  beforeEach(async function () {
    // Deploy contract
    const MerkleProofVerifier = await ethers.getContractFactory("MerkleProofVerifier");
    [owner, addr1] = await ethers.getSigners();
    merkleProofVerifier = await MerkleProofVerifier.deploy();
    await merkleProofVerifier.deployed();

    // Create sample transactions and Merkle tree
    transactions = [
      "0x1234567890123456789012345678901234567890123456789012345678901234",
      "0x2345678901234567890123456789012345678901234567890123456789012345",
      "0x3456789012345678901234567890123456789012345678901234567890123456"
    ];

    const leaves = transactions.map(tx => keccak256(tx));
    merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  });

  it("Should set merkle root correctly", async function () {
    const root = merkleTree.getRoot();
    await merkleProofVerifier.connect(owner).setMerkleRoot(root);
    expect(await merkleProofVerifier.getMerkleRoot()).to.equal(root);
  });

  it("Should verify valid proof correctly", async function () {
    const root = merkleTree.getRoot();
    await merkleProofVerifier.connect(owner).setMerkleRoot(root);

    const leaf = keccak256(transactions[0]);
    const proof = merkleTree.getProof(leaf);
    const proofHex = proof.map(p => '0x' + p.data.toString('hex'));

    expect(
      await merkleProofVerifier.verifyProof(proofHex, root, leaf)
    ).to.be.true;
  });

  it("Should reject invalid proof", async function () {
    const root = merkleTree.getRoot();
    await merkleProofVerifier.connect(owner).setMerkleRoot(root);

    const leaf = keccak256("invalid transaction");
    const proof = merkleTree.getProof(keccak256(transactions[0]));
    const proofHex = proof.map(p => '0x' + p.data.toString('hex'));

    expect(
      await merkleProofVerifier.verifyProof(proofHex, root, leaf)
    ).to.be.false;
  });

  it("Should only allow owner to set merkle root", async function () {
    const root = merkleTree.getRoot();
    await expect(
      merkleProofVerifier.connect(addr1).setMerkleRoot(root)
    ).to.be.revertedWith("Only owner can call this function");
  });
});