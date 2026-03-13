const hre = require(\"hardhat\");

async function main() {
  const CertNFT = await hre.ethers.getContractFactory(\"CertNFT\");
  const certNFT = await CertNFT.deploy(process.env.OWNER_ADDRESS || \"0xYourOwnerAddressHere\");

  await certNFT.waitForDeployment();

  console.log(\"CertNFT deployed to:\", await certNFT.getAddress());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

