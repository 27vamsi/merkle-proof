const hre = require("hardhat");

async function main() {
  // Deploy MerkleProofVerifier
  const MerkleProofVerifier = await hre.ethers.getContractFactory("MerkleProofVerifier");
  const merkleProofVerifier = await MerkleProofVerifier.deploy();

  await merkleProofVerifier.deployed();

  console.log("MerkleProofVerifier deployed to:", merkleProofVerifier.address);

  // Verify contract on Etherscan
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await merkleProofVerifier.deployTransaction.wait(6);
    
    await hre.run("verify:verify", {
      address: merkleProofVerifier.address,
      constructorArguments: [],
    });
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });