const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const usdcAddress = '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8';

describe("In Vino Veritas tests", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployIVV(symbol, totalSupply) {
    // Contracts are deployed using the first signer/account by default
    const [owner] = await ethers.getSigners();

    const IVV = await ethers.getContractFactory("IVV");
    const ivvToken = await IVV.deploy(symbol, totalSupply);

    return { ivvToken, owner };
  }

  async function deployProject(projectName, symbol, totalSupply) {
    const [owner, user1, user2] = await ethers.getSigners();
    const IVV = await ethers.getContractFactory("IVV");
    const ivvToken = await IVV.deploy(symbol, totalSupply);

    const IVVProject = await ethers.getContractFactory("IVVProject");
    // deployed from scratch
    //const usdc = await ethers.deployContract("USDCMockCoin", [owner]);
    const ivvProject = await IVVProject.deploy(symbol, usdcAddress, projectName, 100);
    console.log(ivvProject.target);
    return { ivvToken, ivvProject, owner, user1, user2 };
  }

  describe("IVV Token Deployment", function () {
    it("Should be able to deploy the token", async function () {
      const symbol = 'IVVTST';
      const totalSupply = 100;
      const { ivvToken, owner } = await deployIVV(symbol, totalSupply);

      expect(await ivvToken.symbol()).to.equal('IVVTST');
      expect(await ivvToken.totalSupply()).to.equal(100);
      expect(await ivvToken.name()).to.equal('In Vino Veritas');
    });


  });

  describe("IVVProject tests", function () {
      it("Should be able to deploy the contract", async function () {
        const { ivvToken, ivvProject, owner } = await deployProject('Project 1', 'IVV_PRJ1', 1000);
        expect(await ivvProject.projectName()).to.equal('Project 1');
        expect(await ivvToken.symbol()).to.equal('IVV_PRJ1');
        expect(await ivvToken.totalSupply()).to.equal(1000);

      });

      it("Should be able to start the project sale", async function () {
        const { ivvToken, ivvProject, owner } = await deployProject('Project 1', 'IVV_PRJ1', 1000);
        expect(await ivvProject.projectName()).to.equal('Project 1');
        expect(await ivvToken.symbol()).to.equal('IVV_PRJ1');
        expect(await ivvToken.totalSupply()).to.equal(1000);

        await ivvProject.startProjectSale();
        expect(await ivvProject.projectStatus()).to.equal(1);
      });

      it("Should be able to buy a piece of the project", async function () {
        const { ivvToken, ivvProject, owner, user1, user2 } = await deployProject('Project 1', 'IVV_PRJ1', 1000);

        
        expect(await ivvProject.projectName()).to.equal('Project 1');
        expect(await ivvToken.symbol()).to.equal('IVV_PRJ1');
        expect(await ivvToken.totalSupply()).to.equal(1000);

        await ivvProject.startProjectSale();
        expect(await ivvProject.projectStatus()).to.equal(1);
    
        await ivvProject.connect(owner).registerInvestor(user1.address);

        //await ivvProject.connect(user1).buyProjectPiece(10);
       
        await ivvProject.endProjectSale();
        expect(await ivvProject.projectStatus()).to.equal(2);
      });

      it("Should be able to end the project sale", async function () {
        const { ivvToken, ivvProject, owner } = await deployProject('Project 1', 'IVV_PRJ1', 1000);
        expect(await ivvProject.projectName()).to.equal('Project 1');
        expect(await ivvToken.symbol()).to.equal('IVV_PRJ1');
        expect(await ivvToken.totalSupply()).to.equal(1000);

        await ivvProject.startProjectSale();
        expect(await ivvProject.projectStatus()).to.equal(1);

        await ivvProject.endProjectSale();
        expect(await ivvProject.projectStatus()).to.equal(2);
      });
      
  
    });

    
    describe("IVVProjectFactory Deployment", function () {
      it("Should be able to deploy the contract factory ", async function () {

        //const { ivvToken, owner } = await deployIVV();
        
        const ivvProjectFactory = await ethers.getContractFactory("IVVProjectFactory");
        const ivvProjectFactoryDeployed = await ivvProjectFactory.deploy(usdcAddress);

      });

      it("Should be able to deploy a new project contract", async function () {

        const ivvProjectFactory = await ethers.getContractFactory("IVVProjectFactory");
        const ivvProjectFactoryDeployed = await ivvProjectFactory.deploy(usdcAddress);
        await expect (ivvProjectFactoryDeployed.deployProject('IVV_PRJ1', 'Project 1', 100000)).to.emit(ivvProjectFactoryDeployed, 'ProjectDeployed');
      });



  
  
  
    });

});
