const MerkleUtils = require('../utils/merkleUtils');
const BlockchainService = require('../services/blockchainService');

class MerkleController {
  constructor() {
    this.blockchainService = new BlockchainService();
  }

  // Fetch transactions from a specific block
  async getBlockTransactions(req, res) {
    try {
      const { blockNumber } = req.params;
      const transactions = await this.blockchainService.getBlockTransactions(blockNumber);

      if (!transactions || transactions.length === 0) {
        return res.status(404).json({ success: false, error: 'No transactions found for this block' });
      }

      res.json({ success: true, transactions });
    } catch (error) {
      console.error("Error in getBlockTransactions:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Generate Merkle proof and root for a specified transaction
  async generateMerkleProof(req, res) {
    try {
      const { transactions, targetTx } = req.body;
      const merkleTree = MerkleUtils.createMerkleTree(transactions);
      const proof = MerkleUtils.getMerkleProof(merkleTree, targetTx);
      const root = MerkleUtils.getMerkleRoot(merkleTree);

      res.json({
        success: true,
        proof,
        root: '0x' + root // Return the root with '0x' prefix
      });
    } catch (error) {
      console.error("Error in generateMerkleProof:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Store the Merkle root in the smart contract
  async storeMerkleRoot(req, res) {
    try {
      const { root } = req.body;
      const txHash = await this.blockchainService.storeMerkleRoot(root);
      res.json({ success: true, txHash });
    } catch (error) {
      console.error("Error in storeMerkleRoot:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Verify a transaction's inclusion using a Merkle proof and root
  async verifyTransaction(req, res) {
    try {
      const { txHash, proof, root } = req.body;
      const isValid = await this.blockchainService.verifyTransactionProof(txHash, proof, root);
      res.json({ success: true, isValid });
    } catch (error) {
      console.error("Error in verifyTransaction:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new MerkleController();
