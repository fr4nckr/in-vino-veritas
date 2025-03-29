const {loadFixture} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

const { parseUnits, formatUnits } = require("ethers");




describe("In Vino Veritas tests", function () {

  async function deployUSDCFixture() {
    // Deploy mock USDC token
    const MockUSDC = await ethers.getContractFactory("MockERC20");
    const mockUSDC = await MockUSDC.deploy("USD Coin", "USDC", 6); // USDC has 6 decimals
    return { mockUSDC };
  }

  async function deployTokenFixture() {
    const [owner, user1, user2] = await ethers.getSigners();
    const ivvTokenContract = await ethers.getContractFactory("IVV");
    const ivvToken = await ivvTokenContract.deploy('IVV_TST', 1000);
    return { ivvToken, owner, user1, user2};
  }

  async function deployProjectFixture() {
    const [owner, user1, user2] = await ethers.getSigners();
    const ivvProjectContract = await ethers.getContractFactory("InVinoVeritasProject");
    // Deploy mock USDC token
    const { mockUSDC } = await loadFixture(deployUSDCFixture);
    const ivvProject = await ivvProjectContract.deploy('IVV_PRJ1', mockUSDC.target, 'Project 1', 1000);

    return { ivvProject, owner, user1, user2, mockUSDC };
  }

  async function deployAndStartProjectFixture() {
    const {ivvProject, owner, user1, user2, mockUSDC } = await loadFixture(deployProjectFixture);
    
    // Mint some mock USDC to the user
    await mockUSDC.mint(user1.address, 1000 ); // Mint 1000 USDC
    
    await ivvProject.startProjectSale();

    return {ivvProject, owner, user1, user2, mockUSDC };
  }

  describe("IVV Token Tests", function () {
    it("Should be able to deploy the token", async function () {
      const { ivvToken, owner } = await loadFixture(deployTokenFixture);
      expect(await ivvToken.symbol()).to.equal('IVV_TST');
      expect(await ivvToken.totalSupply()).to.equal(1000);
      expect(await ivvToken.name()).to.equal('In Vino Veritas');
      expect(await ivvToken.balanceOf(owner)).to.equal(1000);
    });
  });

  describe("IVV Project tests", function () {
      it("Should be able to deploy the IVVProject Contract", async function () {
        const { ivvProject, owner, mockUSDC} = await loadFixture(deployProjectFixture);
        expect(await ivvProject.projectName()).to.equal('Project 1');
        expect(await ivvProject.projectValue()).to.equal(1000);
        expect(await ivvProject.projectStatus()).to.equal(0);
        expect(await ivvProject.usdcAddress()).to.equal(mockUSDC.target);
        expect(await ivvProject.owner()).to.equal(owner.address);
      
        const ivvToken = await ethers.getContractAt(
          "IVV",
          await ivvProject.ivv(),
        );
        
        expect(await ivvToken.symbol()).to.equal('IVV_PRJ1');
        expect(await ivvToken.totalSupply()).to.equal(20);
        expect(await ivvToken.name()).to.equal('In Vino Veritas');
        expect(await ivvToken.balanceOf(ivvProject.target)).to.equal(20);

      });

      it("Should be able to start the project sale", async function () {
        const { ivvProject } = await loadFixture(deployProjectFixture);
        await ivvProject.startProjectSale();
        expect(await ivvProject.projectStatus()).to.equal(1);
      });

      it("Should be able to buy a piece of the project", async function () {
        const { ivvProject, user1, mockUSDC } = await loadFixture(deployAndStartProjectFixture);

        const ivvToken = await ethers.getContractAt(
          "IVV",
          await ivvProject.ivv(),
        );
        
        console.log(await ivvToken.balanceOf(ivvProject.target));
        console.log(await mockUSDC.balanceOf(user1.address));

        expect(await mockUSDC.balanceOf(user1.address)).to.equal(1000);

        //Register the user1 to the project
        await ivvProject.registerInvestor(user1.address);
        
        //user connect to the contract and buy a piece of the project
        await mockUSDC.connect(user1).approve(ivvProject.target, 50);

        await ivvProject.connect(user1).buyProjectPiece(50);

        expect(await mockUSDC.balanceOf(user1.address)).to.equal(950);
        expect(await ivvToken.balanceOf(user1.address)).to.equal(1);
        expect(await ivvToken.balanceOf(ivvProject.target)).to.equal(19);
      });

      it("Should be able to end the project sale", async function () {
        const { ivvProject } = await loadFixture(deployAndStartProjectFixture);
        await ivvProject.endProjectSale();
        expect(await ivvProject.projectStatus()).to.equal(2);
      });
    });

    
    describe("IVVProjectFactory Deployment", function () {
      it("Should be able to deploy the contract factory ", async function () {
        const { mockUSDC } = await loadFixture(deployUSDCFixture);
        const ivvProjectFactory = await ethers.getContractFactory("InVinoVeritasProjectFactory");
        const ivvProjectFactoryDeployed = await ivvProjectFactory.deploy(mockUSDC.target);
        expect(await ivvProjectFactoryDeployed.usdcAddress()).to.equal(mockUSDC.target);

      });

      it("Should be able to deploy a new project contract", async function () {
        const { mockUSDC } = await loadFixture(deployUSDCFixture);
        const ivvProjectFactory = await ethers.getContractFactory("InVinoVeritasProjectFactory");
        const ivvProjectFactoryDeployed = await ivvProjectFactory.deploy(mockUSDC.target);
        await ivvProjectFactoryDeployed.deployProject('IVV_PRJ1', 'Project1',  1000000);
      });
  
    });

});
