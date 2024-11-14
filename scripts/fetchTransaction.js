require('dotenv').config();
const { ethers } = require('ethers');
const sha256 = require('crypto-js/sha256');
const MerkleTree = require('merkletreejs').default;

const provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`);

async function fetchBlockTransactions(blockNumber) {
  const block = await provider.getBlock(blockNumber);
  return block.transactions;
}

async function createMerkleTreeFromBlock(blockNumber) {
  const transactions = await fetchBlockTransactions(blockNumber);
  const leaves = transactions.map(tx => sha256(tx).toString());
  const tree = new MerkleTree(leaves, sha256);
  const root = tree.getRoot().toString('hex');
  const exampleTxHash = transactions[0];
  const proof = tree.getProof(sha256(exampleTxHash).toString());

  return { root, proof, exampleTxHash };
}

(async () => {
  const blockNumber = 7031052; // Replace with the desired block number
  const { root, proof, exampleTxHash } = await createMerkleTreeFromBlock(blockNumber);

  console.log('Merkle Root:', root);
  console.log('Example Transaction Hash:', exampleTxHash);
  console.log('Merkle Proof:', proof.map(p => p.data.toString('hex')));
})();
