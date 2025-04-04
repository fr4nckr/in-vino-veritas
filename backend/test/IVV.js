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

  async function deployFactoryFixture() {
    const [owner] = await ethers.getSigners();
    const { mockUSDC } = await loadFixture(deployUSDCFixture);
    const ivvProjectFactory = await ethers.getContractFactory("InVinoVeritasProjectFactory");
    const ivvProjectFactoryDeployed = await ivvProjectFactory.deploy(mockUSDC.target);
    return { ivvProjectFactoryDeployed, mockUSDC, owner };
  }
  //Fixture to deploy an IVV project
  async function deployProjectContractFixture() {
    const [owner, user1, user2] = await ethers.getSigners();
    const ivvProjectContract = await ethers.getContractFactory("InVinoVeritasProject");
    // Deploy mock USDC token
    const { mockUSDC } = await loadFixture(deployUSDCFixture);
    const ivvProject = await ivvProjectContract.deploy(owner.address, 'IVV_PRJ1', mockUSDC.target, 'Project 1', 143330 );

    return { ivvProject, owner, user1, user2, mockUSDC };
  }

  //Fixture to deploy and start an IVV 
  async function deployAndStartProjectFixture() {
    const {ivvProject, owner, user1, user2, mockUSDC } = await loadFixture(deployProjectContractFixture);
    
    // Start the project sale
    await ivvProject.startProjectSale();

    return {ivvProject, owner, user1, user2, mockUSDC };
  }

  async function deployAndStartProjectWithValidatedInvestorsFixture() {
    const {ivvProject, owner, user1, user2, mockUSDC } = await loadFixture(deployProjectContractFixture);
    
    // Mint some mock USDC to the user1 and user2
    await mockUSDC.mint(user1.address, startUSDCBalance ); // Mint 100000 USDC
    await mockUSDC.mint(user2.address, startUSDCBalance ); // Mint 100000 USDC

    //Register the user1 to the project
    await ivvProject.connect(user1).askForRegistration();
    await ivvProject.validateInvestor(user1.address);

    //Register the user2 to the project
    await ivvProject.connect(user2).askForRegistration();
    await ivvProject.validateInvestor(user2.address);
    // Start the project sale
    await ivvProject.startProjectSale();

    return {ivvProject, owner, user1, user2, mockUSDC };
  }




  describe("IVV Token deployment Tests", function () {
    it("Should be able to deploy the token", async function () {
      const { ivvToken, owner } = await loadFixture(deployTokenFixture);
      expect(await ivvToken.symbol()).to.equal('IVV_TST');
      expect(await ivvToken.totalSupply()).to.equal("1000", 18);
      expect(await ivvToken.name()).to.equal('In Vino Veritas');
      expect(await ivvToken.balanceOf(owner)).to.equal("1000");
    });
  });

  describe("IVV Project deployment tests", function () {
      it("Should be able to deploy the InVinoVeritasProject contract", async function () {
        const { ivvProject, owner, mockUSDC} = await loadFixture(deployProjectContractFixture);
        expect(await ivvProject.projectName()).to.equal('Project 1');
        expect(await ivvProject.projectValue()).to.equal(143330);
        expect(await ivvProject.projectStatus()).to.equal(0);
        expect(await ivvProject.usdc()).to.equal(mockUSDC.target);
        expect(await ivvProject.owner()).to.equal(owner.address);
      
        const ivvToken = await ethers.getContractAt("IVV", await ivvProject.ivv());
        
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

      it("Should revert if the mandatory fields are not provided nor valid", async function () {
        const [owner] = await ethers.getSigners();
        const ivvProjectContract = await ethers.getContractFactory("InVinoVeritasProject");
        const { mockUSDC } = await loadFixture(deployUSDCFixture);
        await expect(ivvProjectContract.deploy(ethers.ZeroAddress, 'IVV_PRJ1', mockUSDC.target, 'Project 1', 143330 )).to.be.revertedWithCustomError(ivvProjectContract, "OwnableInvalidOwner");
        await expect(ivvProjectContract.deploy(owner.address, '', mockUSDC.target, 'Project 1', 143330 )).to.be.revertedWith('Symbol is required');
        await expect(ivvProjectContract.deploy(owner.address, 'IVV_PRJ1', ethers.ZeroAddress, 'Project 1', 143330 )).to.be.revertedWith('USDC address is not set');
        await expect(ivvProjectContract.deploy(owner.address, 'IVV_PRJ1', mockUSDC.target, '', 143330 )).to.be.revertedWith('Project name is required');
        await expect(ivvProjectContract.deploy(owner.address, 'IVV_PRJ1', mockUSDC.target, 'Project 1', 0 )).to.be.revertedWith('Project value must be greater than 0');
      });

      it("Should be able to start the project sale", async function () {
        const { ivvProject } = await loadFixture(deployProjectContractFixture);
        await ivvProject.startProjectSale();
        expect(await ivvProject.projectStatus()).to.equal(1);
      });
  });
  
  describe("IVV Project tests", function () {

      it("Owner shouldn't be able to start a project that is not to come", async function () {
        const { ivvProject } = await loadFixture(deployProjectContractFixture);
        await ivvProject.startProjectSale();
        await expect(ivvProject.startProjectSale()).to.be.revertedWith('Project cannot be started');
      });

      it("Owner should be able to end the project sale", async function () {
        const { ivvProject } = await loadFixture(deployAndStartProjectFixture);
        await ivvProject.endProjectSale();
        expect(await ivvProject.projectStatus()).to.equal(2);
      });

      it("Owner shouldn't be able to end a project that is not on sale", async function () {
        const { ivvProject } = await loadFixture(deployProjectContractFixture);
        await expect(ivvProject.endProjectSale()).to.be.revertedWith('Project is not on sale');
      });

      it("User should be able to ask for registration", async function () {
        const { ivvProject, user1, user2 } = await loadFixture(deployProjectContractFixture);
        await ivvProject.connect(user1).askForRegistration();
        await ivvProject.connect(user2).askForRegistration();
        expect(await ivvProject.getInvestorStatus(user1.address)).to.equal(1);
        expect(await ivvProject.getInvestorStatus(user2.address)).to.equal(1);
      });

      it("Owner should be able to validate an investor", async function () {
        const { ivvProject, owner, user1 } = await loadFixture(deployProjectContractFixture);
        await ivvProject.connect(user1).askForRegistration();
        await ivvProject.validateInvestor(user1.address);
        expect(await ivvProject.getInvestorStatus(user1.address)).to.equal(2);
      });

      it("Owner should be able to deny an investor", async function () {
        const { ivvProject, owner, user1 } = await loadFixture(deployProjectContractFixture);
        await ivvProject.connect(user1).askForRegistration();
        await ivvProject.denyInvestor(user1.address);
        expect(await ivvProject.getInvestorStatus(user1.address)).to.equal(3);
      });

      
      it("User should be able to ask again for registration even if he got denied", async function () {
        const { ivvProject, owner, user1 } = await loadFixture(deployProjectContractFixture);
        await ivvProject.connect(user1).askForRegistration();
        expect(await ivvProject.getInvestorStatus(user1.address)).to.equal(1);
        await ivvProject.denyInvestor(user1.address);
        expect(await ivvProject.getInvestorStatus(user1.address)).to.equal(3);
        await ivvProject.connect(user1).askForRegistration();
        expect(await ivvProject.getInvestorStatus(user1.address)).to.equal(1);
      });

      it("Buy land piece should revert if the user is not validated", async function () {
        const { ivvProject, user1 } = await loadFixture(deployProjectContractFixture);
        await expect(ivvProject.connect(user1).buyLandPiece(parseUnits("50", 6))).to.be.revertedWith('You are not a validated investor');
      });

      it("Should be able to buy a piece of the project", async function () {
        const { ivvProject, user1, user2, mockUSDC } = await loadFixture(deployAndStartProjectWithValidatedInvestorsFixture);

        const ivvToken = await ethers.getContractAt("IVV", await ivvProject.ivv());
        
        // console.log(await ivvToken.balanceOf(ivvProject.target));
        // console.log(await mockUSDC.balanceOf(user1.address));
        // console.log(await mockUSDC.balanceOf(user2.address));

        expect(await mockUSDC.balanceOf(user1.address)).to.equal(startUSDCBalance);
        expect(await mockUSDC.balanceOf(user2.address)).to.equal(startUSDCBalance);

        //user connect to the contract and buy a piece of the project
        await mockUSDC.connect(user1).approve(ivvProject.target, parseUnits("50", 6));
        await ivvProject.connect(user1).buyLandPiece(parseUnits("50", 6));

        expect(await mockUSDC.balanceOf(user1.address)).to.equal(parseUnits("999950", 6));
        expect(await ivvToken.balanceOf(user1.address)).to.equal(parseUnits("1", 18));
        expect(await ivvToken.balanceOf(ivvProject.target)).to.equal(parseUnits("2865.6", 18));
      });

    });

    
    describe("Contract Factory tests", function () {
      it("Should be able to deploy the InVinoVeritasProjectFactory ", async function () {
        const { ivvProjectFactoryDeployed, mockUSDC, owner } = await loadFixture(deployFactoryFixture);
        //Verify the usdc address is set
        expect(await ivvProjectFactoryDeployed.usdcAddress()).to.equal(mockUSDC.target);
        //Verify the owner is the deployer
        expect(await ivvProjectFactoryDeployed.owner()).to.equal(owner);
        //Verify the project factory is deployed
        expect(await ivvProjectFactoryDeployed.target).to.not.equal(ethers.ZeroAddress);
      });

      it("Should be able to create a new project thanks the InVinoVeritasProjectFactory ", async function () {
        const { ivvProjectFactoryDeployed, mockUSDC, owner } = await loadFixture(deployFactoryFixture);
        await ivvProjectFactoryDeployed.createProject('IVV_PRJ1', 'Project1',  1000000);
        await ivvProjectFactoryDeployed.createProject('IVV_PRJ2', 'Project2',  5000000);
        await ivvProjectFactoryDeployed.createProject('IVV_PRJ3', 'Project3',  10000000);
        
        // Verify the number of projects is 3
        const projectNumber = await ivvProjectFactoryDeployed.getAllProjects();
        expect(projectNumber.length).to.equal(3);

        //Retrieve the project
        const ivvProject = await ethers.getContractAt("InVinoVeritasProject", projectNumber[0]);
        //Verify the owner is the owner of the factory and not the factory contract address
        expect(await ivvProject.owner()).to.equal(owner);
      });

      it("Should revert if usdc address is not set during the deployment", async function () {
        const ivvProjectFactory = await ethers.getContractFactory("InVinoVeritasProjectFactory");
        //Simulate the deployment of the factory with a zero address for the usdc address
        await expect(ivvProjectFactory.deploy(ethers.ZeroAddress)).to.be.revertedWith('USDC address is not set');
      });

    
      // it("Should revert if the mandatory fields are not sent for the project creation", async function () {
    
        
      //   await expect(ivvProjectFactoryDeployed.createProject('', 'Project 1',  1000000)).to.be.revertedWith('Symbol is required');
      //   await expect(ivvProjectFactoryDeployed.createProject('IVV_PRJ1', '',  1000000)).to.be.revertedWith('Project Name is required');
      //   await expect(ivvProjectFactoryDeployed.createProject('IVV_PRJ1', 'Project 1', 0)).to.be.revertedWith('Project value must be greater than 0');
      // });
  
    });


    // describe("Test a whole sale until sold out", function () {
    //   it("Should be able to buy the entire token supply", async function () {
    //     const { ivvProject, user1, user2, mockUSDC } = await loadFixture(deployAndStartProjectFixture);
    //     const ivvToken = await ethers.getContractAt("IVV", await ivvProject.ivv());
        
    //     // Get initial balances
    //     const user1BalanceAtStart = await mockUSDC.balanceOf(user1.address);
    //     const user2BalanceAtStart = await mockUSDC.balanceOf(user2.address);
    //     let user1AmountUsdcSpent = 0;
    //     let user2AmountUsdcSpent = 0;
    //     let user1AmountIVVReceived = 0;
    //     let user2AmountIVVReceived = 0;


    //     const totalSupply = await ivvToken.totalSupply();
    //     const totalSupplyFormatted = Number(formatUnits(totalSupply, 18));
        
    //     //console.log(`Initial total supply: ${totalSupplyFormatted} IVV tokens`);
        
    //     // Calculate fixed purchase amounts
    //     const fixedPurchaseAmount = 500; // 50 USDC per purchase
    //     const ivvTokensPerPurchase = fixedPurchaseAmount / 50; // 1 IVV token per 50 USDC
    //     const expectedPurchases = Math.ceil(totalSupplyFormatted / ivvTokensPerPurchase);
        
    //     // console.log(`Expected number of purchases: ${expectedPurchases}`);
    //     // console.log(`Each purchase will be ${fixedPurchaseAmount} USDC for ${ivvTokensPerPurchase} IVV tokens`);
        
    //     let totalPurchases = 0;
        
    //     // Alternate between users for purchases
    //     while (totalPurchases < expectedPurchases) {
    //       const user = totalPurchases % 2 === 0 ? user1 : user2;
          
    //       // console.log(`\nPurchase ${totalPurchases + 1}/${expectedPurchases}`);
    //       // console.log(`User ${user.address === user1.address ? '1' : '2'} buying ${fixedPurchaseAmount} USDC`);
          
    //       //If the contract has less than the fixed purchase amount, the user can buy the left supply directly
    //       if(await ivvToken.balanceOf(ivvProject.target) < (ivvTokensPerPurchase * 10**18)){
    //         const ivvAmountToBuy = formatUnits(await ivvToken.balanceOf(ivvProject.target), 18);
    //         //console.log(`IVV amount to buy: ${ivvAmountToBuy}`);
    //         const usdcAmountToSpent = ivvAmountToBuy * 50;
    //         await mockUSDC.connect(user).approve(ivvProject.target, parseUnits(usdcAmountToSpent.toString(),6));
    //         //console.log(`User ${user.address === user1.address ? '1' : '2'} buying ${ivvAmountToBuy} IVV tokens for ${usdcAmountToSpent} USDC` );
    //         await ivvProject.connect(user).buyLandPiece(parseUnits(usdcAmountToSpent.toString(), 6));
    //         if (user.address === user1.address) {
    //           user1AmountUsdcSpent+=usdcAmountToSpent;
    //           user1AmountIVVReceived+=parseFloat(ivvAmountToBuy);
    //         } else {
    //           user2AmountUsdcSpent+=usdcAmountToSpent;
    //           user2AmountIVVReceived+=parseFloat(ivvAmountToBuy);
    //         }
    //       } else {
    //         // Approve and buy
    //         await mockUSDC.connect(user).approve(ivvProject.target, parseUnits(fixedPurchaseAmount.toString(), 6));
    //         await ivvProject.connect(user).buyLandPiece(parseUnits(fixedPurchaseAmount.toString(), 6));
    //           // Update counters
    //           if (user.address === user1.address) {
    //             user1AmountUsdcSpent+=fixedPurchaseAmount;
    //             user1AmountIVVReceived+=ivvTokensPerPurchase;
    //           } else {
    //             user2AmountUsdcSpent+=fixedPurchaseAmount;
    //             user2AmountIVVReceived+=ivvTokensPerPurchase;
    //           }
    //       }
          
        
    //       totalPurchases++;
          
    //       // // Log current state
    //       // console.log(`Current state:
    //       //   User1 USDC: ${formatUnits(await mockUSDC.balanceOf(user1.address), 6)}
    //       //   User2 USDC: ${formatUnits(await mockUSDC.balanceOf(user2.address), 6)}
    //       //   User1 IVV: ${formatUnits(await ivvToken.balanceOf(user1.address), 18)}
    //       //   User2 IVV: ${formatUnits(await ivvToken.balanceOf(user2.address), 18)}
    //       //   Project IVV: ${formatUnits(await ivvToken.balanceOf(ivvProject.target), 18)}`);
    //     }
        
    //     // Verify final state
    //     const finalProjectIVV = await ivvToken.balanceOf(ivvProject.target);
    //     expect(finalProjectIVV).to.equal(0, "Project should have no IVV tokens left");
        
    //     // console.log(`Expected user1 IVV: ${user1AmountIVVReceived}`);
    //     // console.log(`Expected user2 IVV: ${user2AmountIVVReceived}`);

    //     expect(await mockUSDC.balanceOf(user1.address)).to.equal(
    //       parseUnits((Number(formatUnits(user1BalanceAtStart, 6)) - user1AmountUsdcSpent).toString(), 6)
    //     );
    //     expect(await mockUSDC.balanceOf(user2.address)).to.equal(
    //       parseUnits((Number(formatUnits(user2BalanceAtStart, 6)) - user2AmountUsdcSpent).toString(), 6)
    //     );

    //     expect(await ivvToken.balanceOf(user1.address)).to.equal(parseUnits(user1AmountIVVReceived.toString(), 18));
    //     expect(await ivvToken.balanceOf(user2.address)).to.equal(parseUnits(user2AmountIVVReceived.toString(), 18));
        
    //     // Verify total purchases match expected
    //     expect(totalPurchases).to.equal(expectedPurchases);
    //   });
    // });

});
