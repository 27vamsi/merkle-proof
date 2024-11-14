const { ethers } = require('ethers');
require('dotenv').config();

class BlockchainService {
  constructor() {
    // Set up the provider and contract
    this.provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    this.contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      require('../contracts/MerkleProofVerifier.json').abi,
      this.provider
    );
  }

  // Fetch transactions for a specific block number
  async getBlockTransactions(blockNumber) {
    try {
      const block = await this.provider.getBlockWithTransactions(blockNumber);
      
      if (!block || !block.transactions) {
        throw new Error("No transactions found for this block");
      }

      return block.transactions.map(tx => tx.hash);
    } catch (error) {
      // Log the error for debugging
      console.error("Error in getBlockTransactions:", error);
      throw new Error(`Failed to fetch block transactions: ${error.message}`);
    }
  }

  // Store Merkle root on the blockchain
  async storeMerkleRoot(root) {
    try {
      const signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
      const contractWithSigner = this.contract.connect(signer);
      const tx = await contractWithSigner.setMerkleRoot(root);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      // Log the error and throw a custom message
      console.error("Error in storeMerkleRoot:", error);
      throw new Error(`Failed to store Merkle root: ${error.message}`);
    }
  }

  // Verify transaction inclusion using Merkle proof and root
  async verifyTransactionProof(txHash, proof, root) {
    try {
      return await this.contract.verifyProof(proof, root, txHash);
    } catch (error) {
      // Log the error and throw a custom message
      console.error("Error in verifyTransactionProof:", error);
      throw new Error(`Failed to verify proof: ${error.message}`);
    }
  }
}

module.exports = BlockchainService;
