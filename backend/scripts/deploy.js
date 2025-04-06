import hre from "hardhat";
import dotenv from 'dotenv';
dotenv.config();
async function main() {
  
  //Deploy a MockERC20 token that will be used as USDC for testing
  const erc20Contract = await hre.ethers.getContractFactory('MockERC20');
  const erc20 = await erc20Contract.deploy('IVV USDC', 'USDC', 6);
  await erc20.waitForDeployment();
  console.log("MockERC20 Contract deployed at address: ", erc20.target);

  const USDC_ADDRESS = erc20.target;

  //get signers
  const signers = await hre.ethers.getSigners();
  for (const signer of signers) {
    await erc20.mint(signer.address, ethers.parseUnits('1000000', 6));
  }

  //Deploy ERC 20 token
  const ivvProjectFactoryContract = await hre.ethers.getContractFactory('InVinoVeritasProjectFactory');
  const ivvProjectFactory = await ivvProjectFactoryContract.deploy(USDC_ADDRESS);
  await ivvProjectFactory.waitForDeployment();
  console.log("Factory Contract deployed at address: ", ivvProjectFactory.target);
  await ivvProjectFactory.createProject('IVV_BDX', 'Projet viticole à Bordeaux', 100000);
  await ivvProjectFactory.createProject('IVV_TLS', 'Projet agricole à Toulouse', 143000);
  await ivvProjectFactory.createProject('IVV_AIX', 'Projet viticole à Aix-en-Provence', 200000);
  const deployedProjectAddresses = await ivvProjectFactory.getAllProjects();
  for (const projectAddress of deployedProjectAddresses) {
    console.log("Deployed project address: ", projectAddress);
  }

}

main().catch(console.error);