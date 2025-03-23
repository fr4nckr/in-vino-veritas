// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 */
contract IVVProject is Ownable {

    IERC20 ivv;

    //Surface in m2 of the land
    string name;
    uint surface;

    uint numberOfPiecesBought;
    uint numberOfTotalPieces;
    uint nbTokensPerPieces;

    mapping (address => Investor) investors;

    ProjectStatus projectStatus;

    struct Investor {
        bool isRegistered; 
        uint nbTokensToSend;
    }
    
    enum ProjectStatus {
        ToCome,
        OnSale,
        SoldOut
    }

    constructor(address _ivvAddress, string memory _name, uint _surface, uint _tokenPerPieces) Ownable(msg.sender) {   
         ivv = IERC20(_ivvAddress);
         nbTokensPerPieces = _tokenPerPieces;
         name = _name;
         surface = _surface;
    }
    
    modifier onlyRegisteredInvestors() {
        require(investors[msg.sender].isRegistered, "You're not a registered investor");
        _;
    }
    

    function startProjectSale () external onlyOwner {
        projectStatus = ProjectStatus.OnSale;        
    }
    
    function endProjectSale () external onlyOwner {
        projectStatus = ProjectStatus.SoldOut;        
    }
/*
    function validateInvestor(address _investorAddress) external {
        investors[_investorAddress].isValidated = true;
    }

    
    function buyProjectPiece() external onlyRegisteredInvestors payable{
        
        //msg.signer is the person who is trying to buy 
        numberOfPiecesBought++;
        investors[msg.signer].nbTokensToSend+=nbTokensPerPieces;
    }


    function distributeToInvestors() external onlyOwner {

    }*/

}