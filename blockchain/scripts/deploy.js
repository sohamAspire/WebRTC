const hre = require("hardhat");

async function main() {
  // Compile contracts (optional but recommended)
  await hre.run("compile");

  // Deploy contracts concurrently
  const [MyContract , TransferToken] = await Promise.all([
    hre.ethers.getContractFactory("MyContract"),
    hre.ethers.getContractFactory("TransferToken"),
  ]);

  const [myContract , transferToken] = await Promise.all([
    MyContract.deploy("Hello, Hardhat!"),
    TransferToken.deploy()
  ]);

  // Log deployed contract addresses
  console.log("MyContract deployed to:", myContract.address);
  console.log("Transfer Tokens deployed to:", transferToken.address);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
