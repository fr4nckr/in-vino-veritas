const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("IVV Token", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployIVV() {
    // Contracts are deployed using the first signer/account by default
    const [owner] = await ethers.getSigners();

    const IVV = await ethers.getContractFactory("IVV");
    const ivvToken = await IVV.deploy();

    return { ivvToken, owner };
  }

  describe("ERC20 Deployment", function () {
    it("Should be able to deploy the token", async function () {
      const totalSupply = 100;
      const { ivvToken, owner } = await deployIVV(totalSupply);

      expect(await ivvToken.symbol()).to.equal('IVV');
      expect(await ivvToken.name()).to.equal('In Vino Veritas');
    });


  });

  describe("IVVProject tests", function () {
    describe("IVVProject Deployment", function () {
      it("Should be able to deploy the contract", async function () {

        const { ivvToken, owner } = await deployIVV();
        
        const IVVProject = await ethers.getContractFactory("IVVProject");
        const ivvProject = await IVVProject.deploy(ivv.target);

      });
      
  
  
    });
    });

    
    describe("IVVProjectFactory Deployment", function () {
      it("Should be able to deploy the contract factory ", async function () {

        //const { ivvToken, owner } = await deployIVV();
        
        const ivvProjectFactory = await ethers.getContractFactory("IVVProjectFactory");
        const ivvProjectFactoryDeployed = await ivvProjectFactory.deploy();

      });
      it.only("Should be able to deploy a new project contract", async function () {

        const ivvProjectFactory = await ethers.getContractFactory("IVVProjectFactory");
        const ivvProjectFactoryDeployed = await ivvProjectFactory.deploy();

        await expect (ivvProjectFactoryDeployed.deployNewProject('TST',100)).to.emit(ivvProjectFactoryDeployed, 'TokenDeployed');
      });
  
  
  
    });

});
