const {loadFixture} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

const { parseUnits, formatUnits } = require("ethers");

const startUSDCBalance = parseUnits("1000000", 6).toString();
describe("In Vino Veritas tests", function () {
  //Fixture to deploy a mock USDC token
  async function deployUSDCFixture() {
    const MockUSDC = await ethers.getContractFactory("MockERC20");
    const mockUSDC = await MockUSDC.deploy("USD Coin", "USDC", 6); // USDC has 6 decimals
    return { mockUSDC };
  }
  //Fixture to deploy an IVV token
  async function deployTokenFixture() {
    const [owner, user1, user2] = await ethers.getSigners();
    const ivvTokenContract = await ethers.getContractFactory("IVV");
    const ivvToken = await ivvTokenContract.deploy("IVV_TST", 1000);
    return { ivvToken, owner, user1, user2};
  }
  //Fixture to deploy an IVV project
  async function deployProjectContractFixture() {
    const [owner, user1, user2] = await ethers.getSigners();
    const ivvProjectContract = await ethers.getContractFactory("InVinoVeritasProject");
    // Deploy mock USDC token
    const { mockUSDC } = await loadFixture(deployUSDCFixture);
    const ivvProject = await ivvProjectContract.deploy('IVV_PRJ1', mockUSDC.target, 'Project 1', 143330 );

    return { ivvProject, owner, user1, user2, mockUSDC };
  }

  //Fixture to deploy and start an IVV 
  async function deployAndStartProjectFixture() {
    const {ivvProject, owner, user1, user2, mockUSDC } = await loadFixture(deployProjectContractFixture);
    
    // Mint some mock USDC to the user1 and user2
    await mockUSDC.mint(user1.address, startUSDCBalance ); // Mint 100000 USDC
    await mockUSDC.mint(user2.address, startUSDCBalance ); // Mint 100000 USDC

    //Register the user1 to the project
    await ivvProject.registerInvestor(user1.address);

    //Register the user2 to the project
    await ivvProject.registerInvestor(user2.address);

    // Start the project sale
    await ivvProject.startProjectSale();

    return {ivvProject, owner, user1, user2, mockUSDC };
  }

  describe("IVV Token Tests", function () {
    it("Should be able to deploy the token", async function () {
      const { ivvToken, owner } = await loadFixture(deployTokenFixture);
      expect(await ivvToken.symbol()).to.equal('IVV_TST');
      expect(await ivvToken.totalSupply()).to.equal("1000", 18);
      expect(await ivvToken.name()).to.equal('In Vino Veritas');
      expect(await ivvToken.balanceOf(owner)).to.equal("1000");
    });
  });

  describe("IVV Project tests", function () {
      it("Should be able to deploy the InVinoVeritasProject contract", async function () {
        const { ivvProject, owner, mockUSDC} = await loadFixture(deployProjectContractFixture);
        expect(await ivvProject.projectName()).to.equal('Project 1');
        expect(await ivvProject.projectValue()).to.equal(143330);
        expect(await ivvProject.projectStatus()).to.equal(0);
        expect(await ivvProject.usdc()).to.equal(mockUSDC.target);
        expect(await ivvProject.owner()).to.equal(owner.address);
      
        const ivvToken = await ethers.getContractAt(
          "IVV",
          await ivvProject.ivv(),
        );
        
        // Verify token supply calculation
        // Project value: 143330 USD
        // Exchange rate: 50 USD per IVV token
        // Expected supply: 143330 / 50 = 2866.6 IVV tokens
        const expectedSupply = ethers.parseUnits("2866.6", 18);
        
        expect(await ivvToken.symbol()).to.equal('IVV_PRJ1');
        expect(await ivvToken.totalSupply()).to.equal(expectedSupply);
        expect(await ivvToken.name()).to.equal('In Vino Veritas');
        expect(await ivvToken.balanceOf(ivvProject.target)).to.equal(expectedSupply);
      });


      it("Should be able to start the project sale", async function () {
        const { ivvProject } = await loadFixture(deployProjectContractFixture);
        await ivvProject.startProjectSale();
        expect(await ivvProject.projectStatus()).to.equal(1);
      });

      it("Should be able to buy a piece of the project", async function () {
        const { ivvProject, user1, user2, mockUSDC } = await loadFixture(deployAndStartProjectFixture);

        const ivvToken = await ethers.getContractAt(
          "IVV",
          await ivvProject.ivv(),
        );
        
        console.log(await ivvToken.balanceOf(ivvProject.target));
        console.log(await mockUSDC.balanceOf(user1.address));
        console.log(await mockUSDC.balanceOf(user2.address));

        expect(await mockUSDC.balanceOf(user1.address)).to.equal(startUSDCBalance);
        expect(await mockUSDC.balanceOf(user2.address)).to.equal(startUSDCBalance);

        //user connect to the contract and buy a piece of the project
        await mockUSDC.connect(user1).approve(ivvProject.target, parseUnits("50", 18));
        await ivvProject.connect(user1).buyLandPiece(50);

        expect(await mockUSDC.balanceOf(user1.address)).to.equal(parseUnits("999950", 6));
        expect(await ivvToken.balanceOf(user1.address)).to.equal(parseUnits("1", 18));
        expect(await ivvToken.balanceOf(ivvProject.target)).to.equal(parseUnits("2865.6", 18));
      });

      it("Should be able to end the project sale", async function () {
        const { ivvProject } = await loadFixture(deployAndStartProjectFixture);
        await ivvProject.endProjectSale();
        expect(await ivvProject.projectStatus()).to.equal(2);
      });
    });

    
    describe("Contract Factory tests", function () {
      it("Should be able to deploy the InVinoVeritasProjectFactory contract ", async function () {
        const { mockUSDC } = await loadFixture(deployUSDCFixture);
        const ivvProjectFactory = await ethers.getContractFactory("InVinoVeritasProjectFactory");
        const ivvProjectFactoryDeployed = await ivvProjectFactory.deploy(mockUSDC.target);
        expect(await ivvProjectFactoryDeployed.usdcAddress()).to.equal(mockUSDC.target);
      });

      it("Should be able to createProject a new project thanks the InVinoVeritasProjectFactory ", async function () {
        const { mockUSDC } = await loadFixture(deployUSDCFixture);
        const ivvProjectFactory = await ethers.getContractFactory("InVinoVeritasProjectFactory");
        const ivvProjectFactoryDeployed = await ivvProjectFactory.deploy(mockUSDC.target);
        await ivvProjectFactoryDeployed.createProject('IVV_PRJ1', 'Project1',  1000000);
      });

      it("Should be able to deploy a new project with the factory", async function () {
        const { mockUSDC } = await loadFixture(deployUSDCFixture);
        const ivvProjectFactory = await ethers.getContractFactory("InVinoVeritasProjectFactory");
        const ivvProjectFactoryDeployed = await ivvProjectFactory.deploy(mockUSDC.target);
        await ivvProjectFactoryDeployed.createProject('IVV_PRJ1', 'Project1',  1000000);
      });

      it("Should revert if usdc address is not set during the deployment", async function () {
        const ivvProjectFactory = await ethers.getContractFactory("InVinoVeritasProjectFactory");
        //Simulate the deployment of the factory with a zero address for the usdc address
        await expect(ivvProjectFactory.deploy(ethers.ZeroAddress)).to.be.revertedWith('USDC address is not set');
      });

      it("Should revert if the mandatory fields are not sent for the project creation", async function () {
        const { mockUSDC } = await loadFixture(deployUSDCFixture);
        const ivvProjectFactory = await ethers.getContractFactory("InVinoVeritasProjectFactory");
        const ivvProjectFactoryDeployed = await ivvProjectFactory.deploy(mockUSDC.target);
        
        await expect(ivvProjectFactoryDeployed.createProject('', 'Project 1',  1000000)).to.be.revertedWith('Symbol is required');
        await expect(ivvProjectFactoryDeployed.createProject('IVV_PRJ1', '',  1000000)).to.be.revertedWith('Project Name is required');
        await expect(ivvProjectFactoryDeployed.createProject('IVV_PRJ1', 'Project 1', 0)).to.be.revertedWith('Project value must be greater than 0');
      });
  
    });


    describe("Test a whole sale until sold out", function () {
      it("Should be able to buy the entire token supply", async function () {
        const { ivvProject, user1, user2, mockUSDC } = await loadFixture(deployAndStartProjectFixture);
        const ivvToken = await ethers.getContractAt("IVV", await ivvProject.ivv());
        
        // Get initial balances
        const user1BalanceAtStart = await mockUSDC.balanceOf(user1.address);
        const user2BalanceAtStart = await mockUSDC.balanceOf(user2.address);
        let user1AmountUsdcSpent = 0;
        let user2AmountUsdcSpent = 0;
        let user1AmountIVVReceived = 0;
        let user2AmountIVVReceived = 0;


        const totalSupply = await ivvToken.totalSupply();
        const totalSupplyFormatted = Number(formatUnits(totalSupply, 18));
        
        console.log(`Initial total supply: ${totalSupplyFormatted} IVV tokens`);
        
        // Calculate fixed purchase amounts
        const fixedPurchaseAmount = 500; // 50 USDC per purchase
        const ivvTokensPerPurchase = fixedPurchaseAmount / 50; // 1 IVV token per 50 USDC
        const expectedPurchases = Math.ceil(totalSupplyFormatted / ivvTokensPerPurchase);
        
        console.log(`Expected number of purchases: ${expectedPurchases}`);
        console.log(`Each purchase will be ${fixedPurchaseAmount} USDC for ${ivvTokensPerPurchase} IVV tokens`);
        
        let totalPurchases = 0;
        
        // Alternate between users for purchases
        while (totalPurchases < expectedPurchases) {
          const user = totalPurchases % 2 === 0 ? user1 : user2;
          
          // console.log(`\nPurchase ${totalPurchases + 1}/${expectedPurchases}`);
          // console.log(`User ${user.address === user1.address ? '1' : '2'} buying ${fixedPurchaseAmount} USDC`);
          
          //If the contract has less than the fixed purchase amount, the user can buy the left supply directly
          if(await ivvToken.balanceOf(ivvProject.target) < (ivvTokensPerPurchase * 10**18)){
            const ivvAmountToBuy = formatUnits(await ivvToken.balanceOf(ivvProject.target), 18);
            console.log(`IVV amount to buy: ${ivvAmountToBuy}`);
            const usdcAmountToSpent = ivvAmountToBuy * 50;
            await mockUSDC.connect(user).approve(ivvProject.target, parseUnits(usdcAmountToSpent.toString(),6));
            console.log(`User ${user.address === user1.address ? '1' : '2'} buying ${ivvAmountToBuy} IVV tokens for ${usdcAmountToSpent} USDC` );
            await ivvProject.connect(user).buyLandPiece(usdcAmountToSpent);
            if (user.address === user1.address) {
              user1AmountUsdcSpent+=usdcAmountToSpent;
              user1AmountIVVReceived+=parseFloat(ivvAmountToBuy);
            } else {
              user2AmountUsdcSpent+=usdcAmountToSpent;
              user2AmountIVVReceived+=parseFloat(ivvAmountToBuy);
            }
          } else {
            // Approve and buy
            await mockUSDC.connect(user).approve(ivvProject.target, parseUnits(fixedPurchaseAmount.toString(), 6));
            await ivvProject.connect(user).buyLandPiece(fixedPurchaseAmount);
              // Update counters
              if (user.address === user1.address) {
                user1AmountUsdcSpent+=fixedPurchaseAmount;
                user1AmountIVVReceived+=ivvTokensPerPurchase;
              } else {
                user2AmountUsdcSpent+=fixedPurchaseAmount;
                user2AmountIVVReceived+=ivvTokensPerPurchase;
              }
          }
          
        
          totalPurchases++;
          
          // // Log current state
          // console.log(`Current state:
          //   User1 USDC: ${formatUnits(await mockUSDC.balanceOf(user1.address), 6)}
          //   User2 USDC: ${formatUnits(await mockUSDC.balanceOf(user2.address), 6)}
          //   User1 IVV: ${formatUnits(await ivvToken.balanceOf(user1.address), 18)}
          //   User2 IVV: ${formatUnits(await ivvToken.balanceOf(user2.address), 18)}
          //   Project IVV: ${formatUnits(await ivvToken.balanceOf(ivvProject.target), 18)}`);
        }
        
        // Verify final state
        const finalProjectIVV = await ivvToken.balanceOf(ivvProject.target);
        expect(finalProjectIVV).to.equal(0, "Project should have no IVV tokens left");
        
        // console.log(`Expected user1 IVV: ${user1AmountIVVReceived}`);
        // console.log(`Expected user2 IVV: ${user2AmountIVVReceived}`);

        expect(await mockUSDC.balanceOf(user1.address)).to.equal(
          parseUnits((Number(formatUnits(user1BalanceAtStart, 6)) - user1AmountUsdcSpent).toString(), 6)
        );
        expect(await mockUSDC.balanceOf(user2.address)).to.equal(
          parseUnits((Number(formatUnits(user2BalanceAtStart, 6)) - user2AmountUsdcSpent).toString(), 6)
        );

        expect(await ivvToken.balanceOf(user1.address)).to.equal(parseUnits(user1AmountIVVReceived.toString(), 18));
        expect(await ivvToken.balanceOf(user2.address)).to.equal(parseUnits(user2AmountIVVReceived.toString(), 18));
        
        // Verify total purchases match expected
        expect(totalPurchases).to.equal(expectedPurchases);
      });
    });
});
