import hre from "hardhat";

async function main() {
 
  //Deploy ERC 20 token
  const ivvContract = await hre.ethers.getContractFactory('IVVProjectFactory');
  const ivvContractDeployed = await ivvContract.deploy();
  await ivvContractDeployed.waitForDeployment();
  console.log(ivvContractDeployed.target);
  const tokenAddress = await ivvContractDeployed.deployProject('TST', 'Test Project', 1000);
  console.log(tokenAddress);
  const tokenAddress2 = await ivvContractDeployed.deployProject('TST2', 'Test Project 2', 2000);
  console.log(tokenAddress2);
}

main().catch(console.error);