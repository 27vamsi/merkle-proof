const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

class MerkleUtils {
  static createMerkleTree(transactions) {
    const leaves = transactions.map(tx => keccak256(tx));
    return new MerkleTree(leaves, keccak256, { sortPairs: true });
  }

  static getMerkleRoot(tree) {
    return tree.getRoot().toString('hex');
  }

  static getMerkleProof(tree, transaction) {
    const leaf = keccak256(transaction);
    return tree.getProof(leaf).map(x => '0x' + x.data.toString('hex'));
  }

  static verifyProof(proof, root, leaf) {
    return MerkleTree.verify(proof, leaf, root);
  }

  static bufferToHex(buffer) {
    return '0x' + buffer.toString('hex');
  }
}

module.exports = MerkleUtils;
