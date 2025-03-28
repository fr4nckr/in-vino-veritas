// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import './IVV.sol';
import './IVVProject.sol';

/**
 * @title IVVProjectFactory
 * @notice This contract is used to deploy new IVV projects
 */
contract IVVProjectFactory is Ownable {
    address private usdcAddress;
    address[] private projects;
    event ProjectDeployed(address projectAddress, uint _projectValue);

    constructor(address _usdcAddress) Ownable(msg.sender) {
        usdcAddress = _usdcAddress;
    }

    /**
     * @notice Deploy a new IVV project
     * @param _symbol The symbol of the token associated to the project
     * @param _name The name of the project to deploy
     * @param _projectValue The official project value in USD
     * @return The address of the project deployed
     */    
    function deployProject (string memory _symbol, string memory _name,  uint _projectValue) external returns(address) {
        address ivvProjectAddress = address(new IVVProject(_symbol, usdcAddress, _name, _projectValue));
        projects.push(ivvProjectAddress);
        emit ProjectDeployed (ivvProjectAddress, _projectValue);        
        return ivvProjectAddress;
    }
}