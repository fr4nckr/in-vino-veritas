import hre from "hardhat";
import dotenv from 'dotenv';
dotenv.config();
async function main() {  
  
  const firstAccount = "0xdaF344B548E9258F1BF7053bce66381704828f4B";
  const secondAccount = "0x588dD264822E930dd5a4052f4BB7B891E167BEf9";
  const thirdAccount = "0x9eCFD836ADDC2FF2FBBCF6F48c7CC5829b2863d8";

  //Deploy a MockERC20 token that will be used as USDC for testing
  const erc20Contract = await hre.ethers.getContractFactory('MockERC20');
  const erc20 = await erc20Contract.deploy('IVV USDC', 'USDC', 6);
  await erc20.waitForDeployment();
  console.log("ERC20 (mock USDC) Contract deployed at address: ", erc20.target);

  //Mint the fake USDC and send it to testnet account that will be used for testing 
  await erc20.mint(firstAccount, ethers.parseUnits('1000000', 6));
  await erc20.mint(secondAccount, ethers.parseUnits('1000000', 6));
  await erc20.mint(thirdAccount, ethers.parseUnits('1000000', 6));

  console.log("ERC20 token minted and sent to first test account at address: ", firstAccount);
  console.log("ERC20 token minted and sent to secondAccount test account at address: ", secondAccount);
  console.log("ERC20 token minted and sent to thirdAccount test account at address: ", thirdAccount);
  
  //Deploy the factory contract with the fake USDC as parameter
  const ivvProjectFactoryContract = await hre.ethers.getContractFactory('InVinoVeritasProjectFactory');
  const ivvProjectFactory = await ivvProjectFactoryContract.deploy(erc20.target);
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