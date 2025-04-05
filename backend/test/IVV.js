const {loadFixture} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { parseUnits, formatUnits } = require("ethers");
const startUSDCBalance = parseUnits("1000000", 6).toString();

describe("In Vino Veritas tests", function () {

  //Fixture to deploy a mock USDC token
  async function deployUSDCFixture() {
    const [owner, user1] = await ethers.getSigners();
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const mockUSDC = await MockERC20.deploy("USD Coin", "USDC", 6); // USDC has 6 decimals
    return { mockUSDC, owner, user1 };
  }

  //Fixture to deploy an IVV token
  async function deployTokenFixture() {
    const [owner, user1, user2] = await ethers.getSigners();
    const ivvTokenContract = await ethers.getContractFactory("IVV");
    const ivvToken = await ivvTokenContract.deploy("IVV_TST", 1000);
    return { ivvToken, owner, user1, user2};
  }

  //Fixture to deploy an IVV project factory
  async function deployFactoryFixture() {
    const { mockUSDC, owner, user1} = await loadFixture(deployUSDCFixture);
    const ivvProjectFactory = await ethers.getContractFactory("InVinoVeritasProjectFactory");
    const ivvProjectFactoryDeployed = await ivvProjectFactory.deploy(mockUSDC.target);
    return { ivvProjectFactoryDeployed, mockUSDC, owner, user1 };
  }

  //Fixture to deploy an IVV project
  async function deployProjectContractFixture() {
    const [owner, user1, user2, user3] = await ethers.getSigners();
    const ivvProjectContract = await ethers.getContractFactory("InVinoVeritasProject");
    const { mockUSDC } = await loadFixture(deployUSDCFixture);
    const ivvProject = await ivvProjectContract.deploy(owner.address, 'IVV_PRJ1', mockUSDC.target, 'Project 1', 143330 );
    return { ivvProject, owner, user1, user2, user3, mockUSDC };
  }

  //Fixture to deploy and start an IVV 
  async function deployAndStartProjectFixture() {
    const {ivvProject, owner, user1, user2, user3, mockUSDC } = await loadFixture(deployProjectContractFixture);
    await ivvProject.startProjectSale();
    return {ivvProject, owner, user1, user2, user3, mockUSDC };
  }

  async function deployAndStartProjectWithValidatedInvestorsFixture() {
    const {ivvProject, owner, user1, user2, user3, mockUSDC } = await loadFixture(deployProjectContractFixture);
    
    // Mint some mock USDC to the user1 and user2
    await mockUSDC.mint(user1.address, startUSDCBalance ); // Mint 100 000 USDC
    await mockUSDC.mint(user2.address, startUSDCBalance ); // Mint 100 000 USDC

    //Register the user1 to the project
    await ivvProject.connect(user1).askForRegistration();
    await ivvProject.validateInvestor(user1.address);

    //Register the user2 to the project
    await ivvProject.connect(user2).askForRegistration();
    await ivvProject.validateInvestor(user2.address);
    // Start the project sale
    await ivvProject.startProjectSale();

    return {ivvProject, owner, user1, user2, user3, mockUSDC };
  }

  async function deployStartAndTriggerBuysFixture() {
    const {ivvProject, owner, user1, user2, user3, mockUSDC } = await loadFixture(deployProjectContractFixture);
    
    // Mint some mock USDC to the user1 and user2
    await mockUSDC.mint(user1.address, startUSDCBalance ); // Mint 100 000 USDC
    await mockUSDC.mint(user2.address, startUSDCBalance ); // Mint 100 000 USDC

    //Register the user1 to the project
    await ivvProject.connect(user1).askForRegistration();
    await ivvProject.validateInvestor(user1.address);

    //Register the user2 to the project
    await ivvProject.connect(user2).askForRegistration();
    await ivvProject.validateInvestor(user2.address);
    // Start the project sale
    await ivvProject.startProjectSale();

    // Buy the entire token supply
    await mockUSDC.connect(user1).approve(ivvProject.target, parseUnits("500", 6));
    await ivvProject.connect(user1).buyLandPiece(parseUnits("500", 6));

    return {ivvProject, owner, user1, user2, user3, mockUSDC };
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

  
  describe("InVinoVeritas Project tests", function () {
      it("Deployment - Should be able to deploy the InVinoVeritasProject contract", async function () {
        const { ivvProject, owner, mockUSDC} = await loadFixture(deployProjectContractFixture);
        expect(await ivvProject.projectName()).to.equal('Project 1');
        expect(await ivvProject.projectValue()).to.equal(143330);
        expect(await ivvProject.projectStatus()).to.equal(0);
        expect(await ivvProject.USDC_TOKEN()).to.equal(mockUSDC.target);
        expect(await ivvProject.owner()).to.equal(owner.address);
      
        const ivvToken = await ethers.getContractAt("IVV", await ivvProject.IVV_TOKEN());
        
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

      it("Deployment - Should revert if the mandatory fields are not provided nor valid", async function () {
        const [owner] = await ethers.getSigners();
        const ivvProjectContract = await ethers.getContractFactory("InVinoVeritasProject");
        const { mockUSDC } = await loadFixture(deployUSDCFixture);
        await expect(ivvProjectContract.deploy(ethers.ZeroAddress, 'IVV_PRJ1', mockUSDC.target, 'Project 1', 143330 )).to.be.revertedWithCustomError(ivvProjectContract, "OwnableInvalidOwner");
        await expect(ivvProjectContract.deploy(owner.address, '', mockUSDC.target, 'Project 1', 143330 )).to.be.revertedWith('Symbol is required');
        await expect(ivvProjectContract.deploy(owner.address, 'IVV_PRJ1', ethers.ZeroAddress, 'Project 1', 143330 )).to.be.revertedWith('USDC address is not set');
        await expect(ivvProjectContract.deploy(owner.address, 'IVV_PRJ1', mockUSDC.target, '', 143330 )).to.be.revertedWith('Project name is required');
        await expect(ivvProjectContract.deploy(owner.address, 'IVV_PRJ1', mockUSDC.target, 'Project 1', 0 )).to.be.revertedWith('Project value must be greater than 0');
      });

      it("Start project sale - Owner should be able to start the project sale", async function () {
        const { ivvProject } = await loadFixture(deployProjectContractFixture);
        await expect(await ivvProject.startProjectSale()).to.emit(ivvProject, 'ProjectStatusChange').withArgs(0, 1);
        expect(await ivvProject.projectStatus()).to.equal(1);
      });

      it("Start project sale - Project should be to come", async function () {
        const { ivvProject } = await loadFixture(deployProjectContractFixture);
        await ivvProject.startProjectSale();
        await expect(ivvProject.startProjectSale()).to.be.revertedWith('Project cannot be started');
      });

      it("Start project sale - Ownership verification", async function () {
        const { ivvProject, user1 } = await loadFixture(deployProjectContractFixture);
        await expect(ivvProject.connect(user1).startProjectSale()).to.be.revertedWithCustomError(ivvProject, 'OwnableUnauthorizedAccount');
      });

      it("End project sale - Owner should be able to end a project sale", async function () {
        const { ivvProject } = await loadFixture(deployAndStartProjectFixture);
        await expect(await ivvProject.endProjectSale()).to.emit(ivvProject, 'ProjectStatusChange').withArgs(1, 2);
        expect(await ivvProject.projectStatus()).to.equal(2);
      });

      it("End project sale - Project should be on sale", async function () {
        const { ivvProject } = await loadFixture(deployProjectContractFixture);
        await expect(ivvProject.endProjectSale()).to.be.revertedWith('Project is not on sale');
      });

      it("End project sale - Ownership verification", async function () {
        const { ivvProject, user1 } = await loadFixture(deployProjectContractFixture);
        await expect(ivvProject.connect(user1).endProjectSale()).to.be.revertedWithCustomError(ivvProject, 'OwnableUnauthorizedAccount');
      });

      it("Validate investor - Owner should be able to validate an investor", async function () {
        const { ivvProject, user1 } = await loadFixture(deployProjectContractFixture);
        await ivvProject.connect(user1).askForRegistration();
        await expect(ivvProject.validateInvestor(user1.address)).to.emit(ivvProject, 'InvestorValidated').withArgs(user1.address);
        expect(await ivvProject.getInvestorStatus(user1.address)).to.equal(2);
      });

      it("Validate investor - Owner shouldn't be able to validate if the project is not on sale", async function () {
        const { ivvProject, user1, user2, user3 } = await loadFixture(deployAndStartProjectWithValidatedInvestorsFixture);
        await ivvProject.endProjectSale();
        await expect(ivvProject.validateInvestor(user3.address)).to.be.revertedWith('Project is already Soldout');
      });

      it("Validate investor - Owner shouldn't be able to validate if the investor has not the right status", async function () {
        const { ivvProject, user1, user2, user3 } = await loadFixture(deployAndStartProjectWithValidatedInvestorsFixture);
        await expect(ivvProject.validateInvestor(user3.address)).to.be.revertedWith('You\'re not registered');
      });

      it("Validate investor - Ownership verification", async function () {
        const { ivvProject, user1, user2, user3 } = await loadFixture(deployAndStartProjectWithValidatedInvestorsFixture);
        await expect(ivvProject.connect(user2).validateInvestor(user3.address)).to.be.revertedWithCustomError(ivvProject, 'OwnableUnauthorizedAccount');
      });

      it("Deny investor - Owner should be able to deny an investor", async function () {
        const { ivvProject, user1 } = await loadFixture(deployProjectContractFixture);
        await ivvProject.connect(user1).askForRegistration();
        await expect(ivvProject.denyInvestor(user1.address)).to.emit(ivvProject, 'InvestorDenied').withArgs(user1.address);
        expect(await ivvProject.getInvestorStatus(user1.address)).to.equal(3);
      });

      it("Deny investor - Project shouldn't be SoldOut", async function () {
        const { ivvProject, user3 } = await loadFixture(deployAndStartProjectWithValidatedInvestorsFixture);
        await ivvProject.connect(user3).askForRegistration();
        await ivvProject.endProjectSale();
        await expect(ivvProject.denyInvestor(user3.address)).to.be.revertedWith('Project is already Soldout');
      });

      it("Deny investor - Owner shouldn't be able to deny an investor if he has not the right status", async function () {
        const { ivvProject, user3 } = await loadFixture(deployAndStartProjectWithValidatedInvestorsFixture);
        await expect(ivvProject.denyInvestor(user3.address)).to.be.revertedWith('You\'re not registered');
      });

      it("Deny investor - Ownership verification", async function () {
        const { ivvProject, user2, user3 } = await loadFixture(deployAndStartProjectWithValidatedInvestorsFixture);
        await expect(ivvProject.connect(user2).denyInvestor(user3.address)).to.be.revertedWithCustomError(ivvProject, 'OwnableUnauthorizedAccount');
      });

      it("Ask for registration - Investor should be able to ask for registration or or ask again for registration even if he got denied", async function () {
        const { ivvProject, user1 } = await loadFixture(deployProjectContractFixture);
        await expect(ivvProject.connect(user1).askForRegistration()).to.emit(ivvProject, 'InvestorRegistered').withArgs(user1.address);
        expect(await ivvProject.getInvestorStatus(user1.address)).to.equal(1);
        await expect(ivvProject.denyInvestor(user1.address)).to.emit(ivvProject, 'InvestorDenied').withArgs(user1.address);
        expect(await ivvProject.getInvestorStatus(user1.address)).to.equal(3);
        await expect(ivvProject.connect(user1).askForRegistration()).to.emit(ivvProject, 'InvestorRegistered').withArgs(user1.address);
        expect(await ivvProject.getInvestorStatus(user1.address)).to.equal(1);
      });

      it("Ask for registration - Investor shouldn't be able to ask for registration on a SoldOut project", async function () {
        const { ivvProject, user3 } = await loadFixture(deployAndStartProjectWithValidatedInvestorsFixture);
        await ivvProject.endProjectSale();
        await expect(ivvProject.connect(user3).askForRegistration()).to.be.revertedWith('Project is already Soldout');
      });

      it("Ask for registration - Investor shouldn't be able to ask he has been validated or if he already asked for registration", async function () {
        const { ivvProject, user2, user3 } = await loadFixture(deployAndStartProjectWithValidatedInvestorsFixture);
        await expect(ivvProject.connect(user2).askForRegistration()).to.be.revertedWith('You\'re already registered or validated');
        await ivvProject.connect(user3).askForRegistration();
        await expect(ivvProject.connect(user3).askForRegistration()).to.be.revertedWith('You\'re already registered or validated');
      });

      it("Buy land piece - Should be able to buy a piece of the project", async function () {
        const { ivvProject, user1, user2, mockUSDC } = await loadFixture(deployAndStartProjectWithValidatedInvestorsFixture);
        const ivvToken = await ethers.getContractAt("IVV", await ivvProject.IVV_TOKEN());
        
        expect(await mockUSDC.balanceOf(user1.address)).to.equal(startUSDCBalance);
        expect(await mockUSDC.balanceOf(user2.address)).to.equal(startUSDCBalance);

        await mockUSDC.connect(user1).approve(ivvProject.target, parseUnits("50", 6));
        await expect(ivvProject.connect(user1).buyLandPiece(parseUnits("50", 6))).to.emit(ivvProject, 'LandPieceBought').withArgs(user1.address, parseUnits("50", 6), parseUnits("1", 18));

        expect(await mockUSDC.balanceOf(user1.address)).to.equal(parseUnits("999950", 6));
        expect(await ivvToken.balanceOf(user1.address)).to.equal(parseUnits("1", 18));
        expect(await ivvToken.balanceOf(ivvProject.target)).to.equal(parseUnits("2865.6", 18));
      });

      it("Buy land piece - Investor should be validated", async function () {
        const { ivvProject, user1 } = await loadFixture(deployProjectContractFixture);
        await expect(ivvProject.connect(user1).buyLandPiece(parseUnits("50", 6))).to.be.revertedWith('You are not a validated investor');
      });

      it("Buy land piece - Project should be on sale", async function () {
        const { ivvProject, user1 } = await loadFixture(deployAndStartProjectWithValidatedInvestorsFixture);
        await ivvProject.endProjectSale();
        await expect(ivvProject.connect(user1).buyLandPiece(parseUnits("50", 6))).to.be.revertedWith('Project is not on sale');
      });

      it("Buy land piece - Amount buy should greater than 0", async function () {
        const { ivvProject, user1 } = await loadFixture(deployAndStartProjectWithValidatedInvestorsFixture);
        await expect(ivvProject.connect(user1).buyLandPiece(parseUnits("0", 6))).to.be.revertedWith('You have to send a positive USDC amount');
      });

      it("Buy land piece - Investor should have enough USDC", async function () {
        const { ivvProject, user3 } = await loadFixture(deployAndStartProjectWithValidatedInvestorsFixture);
        await ivvProject.connect(user3).askForRegistration();
        await ivvProject.validateInvestor(user3.address);
        await expect(ivvProject.connect(user3).buyLandPiece(parseUnits("100", 6))).to.be.revertedWith('Not enough USDC to buy');
      });

      it("Buy land piece - Investor should have given enough allowance to buy", async function () {
        const { ivvProject, user3, mockUSDC } = await loadFixture(deployAndStartProjectWithValidatedInvestorsFixture);
        await ivvProject.connect(user3).askForRegistration();
        await ivvProject.validateInvestor(user3.address);
        await mockUSDC.mint(user3.address, parseUnits("100", 6));
        await expect(ivvProject.connect(user3).buyLandPiece(parseUnits("100", 6))).to.be.revertedWith('You have not given enough allowance to buy');
      });

      it("Buy land piece - Investor shouldn't be able to buy more than the left supply", async function () {
        const { ivvProject, user3, mockUSDC } = await loadFixture(deployAndStartProjectWithValidatedInvestorsFixture);
        await ivvProject.connect(user3).askForRegistration();
        await ivvProject.validateInvestor(user3.address);
        await mockUSDC.mint(user3.address, parseUnits("100000000000", 6));
        await mockUSDC.connect(user3).approve(ivvProject.target, parseUnits("100000000000", 6));
        await expect(ivvProject.connect(user3).buyLandPiece(parseUnits("100000000000", 6))).to.be.revertedWith('Not enough project pieces available for sale');
      });



      it("Widthraw usdc - Should be able to close a project and widthraw usdc collected to a treasury wallet", async function () {
        const { ivvProject, user1, user2, user3, mockUSDC } = await loadFixture(deployAndStartProjectWithValidatedInvestorsFixture);
        const ivvToken = await ethers.getContractAt("IVV", await ivvProject.IVV_TOKEN());
        
        expect(await mockUSDC.balanceOf(user1.address)).to.equal(startUSDCBalance);
        expect(await mockUSDC.balanceOf(user2.address)).to.equal(startUSDCBalance);

        await mockUSDC.connect(user1).approve(ivvProject.target, parseUnits("50", 6));
        await ivvProject.connect(user1).buyLandPiece(parseUnits("50", 6));

        expect(await mockUSDC.balanceOf(user1.address)).to.equal(parseUnits("999950", 6));
        expect(await mockUSDC.balanceOf(ivvProject.target)).to.equal(parseUnits("50", 6));
        expect(await ivvToken.balanceOf(user1.address)).to.equal(parseUnits("1", 18));
        expect(await ivvToken.balanceOf(ivvProject.target)).to.equal(parseUnits("2865.6", 18));
      
        await ivvProject.endProjectSale();
        expect(await ivvProject.projectStatus()).to.equal(2);

        await expect(ivvProject.withdrawUsdc(user3.address)).to.emit(ivvProject, 'TreasuryCollected').withArgs(user3.address);
        expect(await mockUSDC.balanceOf(ivvProject.target)).to.equal(0);
        expect(await mockUSDC.balanceOf(user3.address)).to.equal(parseUnits("50", 6));
      });

      it("Widthraw usdc - Should revert if project is not sold out", async function () {
        const { ivvProject, user1, user2, user3, mockUSDC } = await loadFixture(deployStartAndTriggerBuysFixture);
        await expect(ivvProject.withdrawUsdc(user3.address)).to.be.revertedWith('Project is not sold out');
      });

      it("Widthraw usdc - Ownership verification", async function () {
        const { ivvProject, user1, user2, user3, mockUSDC } = await loadFixture(deployStartAndTriggerBuysFixture);
        await ivvProject.endProjectSale();
        await expect(ivvProject.connect(user2).withdrawUsdc(user3.address)).to.be.revertedWithCustomError(ivvProject, 'OwnableUnauthorizedAccount');
      });

      it("Widthraw usdc - Should revert on a null treasury wallet", async function () {
        const { ivvProject, user1, user2, user3, mockUSDC } = await loadFixture(deployStartAndTriggerBuysFixture);
        await ivvProject.endProjectSale();
        await expect(ivvProject.withdrawUsdc(ethers.ZeroAddress)).to.be.revertedWith('Treasury wallet is not set');
      });

      it("Widthraw usdc - Should revert if there is no USDC to withdraw", async function () {
        const { ivvProject, user1, user2, user3, mockUSDC } = await loadFixture(deployAndStartProjectFixture);
        await ivvProject.endProjectSale();
        await expect(ivvProject.withdrawUsdc(user3.address)).to.be.revertedWith('No USDC to withdraw');
      });
      
    });

  describe("Contract Factory tests", function () {
      it("Deployment - Should be able to deploy the InVinoVeritasProjectFactory ", async function () {
        const { ivvProjectFactoryDeployed, mockUSDC, owner } = await loadFixture(deployFactoryFixture);
        expect(await ivvProjectFactoryDeployed.USDC_ADDRESS()).to.equal(mockUSDC.target);
        expect(await ivvProjectFactoryDeployed.owner()).to.equal(owner);
        expect(await ivvProjectFactoryDeployed.target).to.not.equal(ethers.ZeroAddress);
      });

      it("Deployment - Should revert if usdc address is not set during the deployment", async function () {
        const ivvProjectFactory = await ethers.getContractFactory("InVinoVeritasProjectFactory");
        await expect(ivvProjectFactory.deploy(ethers.ZeroAddress)).to.be.revertedWith('USDC address is not set');
      });

      it("Create project - Should be able to create projects", async function () {
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

      it("Create project - Should revert if mandatory fields are not set", async function () {
        const { ivvProjectFactoryDeployed, mockUSDC, owner } = await loadFixture(deployFactoryFixture);
        await expect(ivvProjectFactoryDeployed.createProject('IVV_PRJ1', '',  1000000)).to.be.revertedWith('Project Name is required');
        await expect(ivvProjectFactoryDeployed.createProject('', 'Project1',  1000000)).to.be.revertedWith('Symbol is required');
        await expect(ivvProjectFactoryDeployed.createProject('IVV_PRJ1', 'Project1',  0)).to.be.revertedWith('Project value must be greater than 0');
      });

      it("Create project - Owner access verification", async function () {
        const { ivvProjectFactoryDeployed, user1 } = await loadFixture(deployFactoryFixture);
        await expect(ivvProjectFactoryDeployed.connect(user1).createProject('IVV_PRJ1', 'Project1',  1000000)).to.be.revertedWithCustomError(ivvProjectFactoryDeployed, 'OwnableUnauthorizedAccount');
      });

     
    });

  describe("Functional test - Test a whole sale process until sold out", function () {
    it("Should be able to buy the entire token supply", async function () {
      const { ivvProject, user1, user2, mockUSDC } = await loadFixture(deployAndStartProjectWithValidatedInvestorsFixture);
      const ivvToken = await ethers.getContractAt("IVV", await ivvProject.IVV_TOKEN());
        
      // Get initial balances
      const user1BalanceAtStart = await mockUSDC.balanceOf(user1.address);
      const user2BalanceAtStart = await mockUSDC.balanceOf(user2.address);
      
      // Some variables to follow the buying process
      let user1AmountUsdcSpent = 0;
      let user2AmountUsdcSpent = 0;
      let user1AmountIVVReceived = 0;
      let user2AmountIVVReceived = 0;

      const totalSupply = await ivvToken.totalSupply();
      const totalSupplyFormatted = Number(formatUnits(totalSupply, 18));
        
      // Calculate fixed purchase amounts
      const fixedPurchaseAmount = 500; // 500 USDC per purchase
      const ivvTokensPerPurchase = fixedPurchaseAmount / 50; // 1 IVV token per 50 USDC as fixed rate 
      const expectedPurchases = Math.ceil(totalSupplyFormatted / ivvTokensPerPurchase);
              
      let totalPurchases = 0;
        
      // Alternate between users for purchases
      while (totalPurchases < expectedPurchases) {
        const user = totalPurchases % 2 === 0 ? user1 : user2;
        //If the contract has less than the fixed purchase amount, the user can buy the left supply directly
        if(await ivvToken.balanceOf(ivvProject.target) < (ivvTokensPerPurchase * 10**18)){
          const ivvAmountToBuy = formatUnits(await ivvToken.balanceOf(ivvProject.target), 18);
          const usdcAmountToSpent = ivvAmountToBuy * 50;
          await mockUSDC.connect(user).approve(ivvProject.target, parseUnits(usdcAmountToSpent.toString(),6));
          await ivvProject.connect(user).buyLandPiece(parseUnits(usdcAmountToSpent.toString(), 6));
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
          await ivvProject.connect(user).buyLandPiece(parseUnits(fixedPurchaseAmount.toString(), 6));
            if (user.address === user1.address) {
              user1AmountUsdcSpent+=fixedPurchaseAmount;
              user1AmountIVVReceived+=ivvTokensPerPurchase;
            } else {
              user2AmountUsdcSpent+=fixedPurchaseAmount;
              user2AmountIVVReceived+=ivvTokensPerPurchase;
            }
        }
        totalPurchases++;
      }
        
      // Verify final state
      const finalProjectIVV = await ivvToken.balanceOf(ivvProject.target);
      expect(finalProjectIVV).to.equal(0, "Project should have no IVV tokens left");
      expect(await mockUSDC.balanceOf(user1.address)).to.equal(
        parseUnits((Number(formatUnits(user1BalanceAtStart, 6)) - user1AmountUsdcSpent).toString(), 6)
      );
      expect(await mockUSDC.balanceOf(user2.address)).to.equal(
        parseUnits((Number(formatUnits(user2BalanceAtStart, 6)) - user2AmountUsdcSpent).toString(), 6)
      );
      expect(await ivvToken.balanceOf(user1.address)).to.equal(parseUnits(user1AmountIVVReceived.toString(), 18));
      expect(await ivvToken.balanceOf(user2.address)).to.equal(parseUnits(user2AmountIVVReceived.toString(), 18));  
      expect(totalPurchases).to.equal(expectedPurchases);
      });
    });

  describe("Testing the MockERC20 token", function () {
    it("Should be able to deploy the token", async function () {
        const { mockUSDC, owner } = await loadFixture(deployUSDCFixture);
        await mockUSDC.mint(owner.address, startUSDCBalance);
        expect(await mockUSDC.symbol()).to.equal('USDC');
        expect(await mockUSDC.decimals()).to.equal(6);
        expect(await mockUSDC.totalSupply()).to.equal(startUSDCBalance);
        expect(await mockUSDC.name()).to.equal('USD Coin');
        expect(await mockUSDC.balanceOf(owner)).to.equal(startUSDCBalance);
      });
    });

});
 