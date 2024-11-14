const express = require('express');
const router = express.Router();
const merkleController = require('../controllers/merkleController');

// Route to get transactions for a specific block
router.get('/block/:blockNumber/transactions', merkleController.getBlockTransactions.bind(merkleController));

// Route to generate a Merkle proof
router.post('/proof', merkleController.generateMerkleProof.bind(merkleController));

// Route to store Merkle root in the contract
router.post('/root', merkleController.storeMerkleRoot.bind(merkleController));

// Route to verify transaction proof
router.post('/verify', merkleController.verifyTransaction.bind(merkleController));

module.exports = router;
