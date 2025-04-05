import hre from "hardhat";
import dotenv from 'dotenv';
dotenv.config();
async function main() {

  const anotherImpersonateFundErc20 = async (contract, sender, recepients, amount, decimals) => {
    const FUND_AMOUNT = ethers.parseUnits(amount, decimals);
    const whaleSigner = await ethers.getImpersonatedSigner(sender);
    for (const recepient of recepients) {
      await contract.connect(whaleSigner).transfer(recepient, FUND_AMOUNT);
    }
  };
  
  //Code to call impersonateFundErc20 function
  const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const usdc = await ethers.getContractAt("IERC20", USDC);
  const USDC_WHALE = "0xF977814e90dA44bFA03b6295A0616a897441aceC";
  const DECIMALS = 6;

  //Get signers
  const signers = await hre.ethers.getSigners();

  await anotherImpersonateFundErc20(
    usdc,
    USDC_WHALE,
    signers.map(signer => signer.address),
    "100000",
    DECIMALS
  );

  //Deploy ERC 20 token
  const ivvProjectFactoryContract = await hre.ethers.getContractFactory('InVinoVeritasProjectFactory');
  const ivvProjectFactory = await ivvProjectFactoryContract.deploy(USDC);
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