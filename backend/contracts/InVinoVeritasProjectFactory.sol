// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import './IVV.sol';
import './InVinoVeritasProject.sol';

/**
 * @title InVinoVeritasProjectFactory
 * @notice This contract is used to deploy new InVinoVeritas projects
 */
contract InVinoVeritasProjectFactory is Ownable {
    address public immutable usdcAddress;
    address[] private projects;
    
    event ProjectDeployed(address projectAddress, uint projectValue); 

    constructor(address _usdcAddress) Ownable(msg.sender) {
        usdcAddress = _usdcAddress;
    }

    /**
     * @notice Deploy a new IVV project
     * @param _symbol The symbol of the token associated to the project
     * @param _name The name of the project to deploy
     * @param _projectValue The official project value in USD
     */    
    function deployProject (string memory _symbol, string memory _name,  uint _projectValue) external {
        address ivvProjectAddress = address(new InVinoVeritasProject(_symbol, usdcAddress, _name, _projectValue));
        projects.push(ivvProjectAddress);
        emit ProjectDeployed (ivvProjectAddress, _projectValue);        
    }

    function getProjects() external view returns(address[] memory) {
        return projects;
    }
}