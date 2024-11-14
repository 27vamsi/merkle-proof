const { ethers } = require('ethers');
const sha256 = require('crypto-js/sha256');
const { MerkleTree } = require('merkletreejs');

// Setup the provider
const provider = new ethers.providers.JsonRpcProvider("https://sepolia.infura.io/v3/12a8bd8d4877453fad20e1380e96ef84");

async function getLatestBlockTransactions() {
    const blockNumber = await provider.getBlockNumber();
    console.log('Latest Block Number:', blockNumber); // Print the latest block number

    const block = await provider.getBlock(blockNumber);
    console.log('Transactions in Latest Block:', block.transactions); // Print all transactions in the block

    return block.transactions;
}

async function generateMerkleTree() {
    const transactions = await getLatestBlockTransactions();

    // Hash each transaction to create the Merkle tree leaves
    const leaves = transactions.map((tx) => sha256(tx).toString());

    // Create the Merkle tree using SHA-256 hash function
    const tree = new MerkleTree(leaves, sha256);
    const root = tree.getRoot().toString('hex');
    console.log('Merkle Root:', root); // Print the Merkle root

    return { tree, root, transactions };
}

// Generate a Merkle proof for a specific transaction
async function generateMerkleProof(transaction) {
    const { tree, transactions } = await generateMerkleTree();

    // Hash the transaction to get its leaf node
    const txHash = sha256(transaction).toString();

    // Get the Merkle proof for the specified transaction
    const proof = tree.getProof(txHash).map((leaf) => leaf.data.toString('hex'));

    console.log('Merkle Proof:', proof); // Print the Merkle proof

    return proof;
}

async function main() {
    const { root, transactions } = await generateMerkleTree();
    console.log('Merkle Root:', root);

    // Pick a valid transaction from the block's transactions array to get proof for
    const transactionHash = transactions[0]; // Replace with any valid transaction hash
    console.log('Transaction Hash for Proof:', transactionHash);

    const proof = await generateMerkleProof(transactionHash);
    console.log('Merkle Proof for Transaction:', proof);
}

main().catch(console.error);
