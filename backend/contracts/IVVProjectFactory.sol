// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import './IVV.sol';
import './IVVProject.sol';

/**
 * @title IVVProjectFactory
 * @notice This contract is used to deploy new IVV projects
 */
contract IVVProjectFactory is Ownable {

    event ProjectDeployed(address projectAddress, uint offChainValue);
    event TokenDeployed(address tokenAddress);
    constructor() Ownable(msg.sender) {}

    /**
     * @notice Deploy a new IVV project
     * @param _symbol The symbol of the token associated to the project
     * @param _name The name of the project to deploy
     * @param _projectValue The official project value in USD
     * @return The address of the project deployed
     */    
    function deployProject (string memory _symbol, string memory _name, uint _projectValue) external returns(address) {
        address ivvTokenAddress = address(new IVV(_symbol, _projectValue));
        
        uint tokenPerPieces = _projectValue / 100;
        address ivvProjectAddress = address(new IVVProject(ivvTokenAddress, _name, tokenPerPieces));
        
        emit TokenDeployed(ivvTokenAddress);
        emit ProjectDeployed (ivvProjectAddress, _projectValue);
        
        return ivvProjectAddress;
    }
    

}