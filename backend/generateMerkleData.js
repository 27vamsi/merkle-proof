// backend/generateMerkleData.js
const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const sha256 = require('crypto-js/sha256');
const MerkleTree = require('merkletreejs').default;

const app = express();
app.use(cors());

const provider = new ethers.providers.JsonRpcProvider("https://sepolia.infura.io/v3/12a8bd8d4877453fad20e1380e96ef84");

async function getLatestBlockTransactions() {
    const blockNumber = await provider.getBlockNumber();
    const block = await provider.getBlock(blockNumber);
    return { blockNumber, transactions: block.transactions };
}

app.get('/merkle', async (req, res) => {
    try {
        const { blockNumber, transactions } = await getLatestBlockTransactions();
        const leaves = transactions.map((tx) => sha256(tx).toString());
        const tree = new MerkleTree(leaves, sha256);
        const merkleRoot = tree.getRoot().toString('hex');

        res.json({ blockNumber, transactions, merkleRoot });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.listen(3001, () => {
    console.log('Server running on http://localhost:3001');
});
