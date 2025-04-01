import hre from "hardhat";

async function main() {

  const anotherImpersonateFundErc20 = async (contract, sender, recepient, amount, decimals) => {
    const FUND_AMOUNT = ethers.parseUnits(amount, decimals);
    const whaleSigner = await ethers.getImpersonatedSigner(sender);
    await contract.connect(whaleSigner).transfer(recepient, FUND_AMOUNT);
  };
  
  //Code to call impersonateFundErc20 function
  const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const usdc = await ethers.getContractAt("IERC20", USDC);
  const USDC_WHALE = "0xF977814e90dA44bFA03b6295A0616a897441aceC";
  const DECIMALS = 6;
  
  await anotherImpersonateFundErc20(
    usdc,
    USDC_WHALE,
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",//the address of the test contract
    "1000",//100 USDC
    DECIMALS
  );

  //Deploy ERC 20 token
  const ivvProjectFactoryContract = await hre.ethers.getContractFactory('InVinoVeritasProjectFactory');
  const ivvProjectFactory = await ivvProjectFactoryContract.deploy(USDC);
  await ivvProjectFactory.waitForDeployment();
  console.log(ivvProjectFactory.target);
  await ivvProjectFactory.deployProject('IVV_BRDX', 'Test Project', 1000);
  const projects = await ivvProjectFactory.allProjects();
  console.log(projects);
}

main().catch(console.error);