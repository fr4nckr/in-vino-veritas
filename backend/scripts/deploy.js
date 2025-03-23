import hre from "hardhat";

async function main() {
 
  //Deploy ERC 20 token
  const ivvContract = await hre.ethers.getContractFactory('IVVProjectFactory');
  const ivvContractDeployed = await ivvContract.deploy();
  await ivvContractDeployed.waitForDeployment();
  console.log(ivvContractDeployed.target);
  const tokenAddress = await ivvContractDeployed.deployNewProject('TST', 1000);
  console.log(tokenAddress);
}

main().catch(console.error);