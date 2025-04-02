// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import './IVV.sol';
import './InVinoVeritasProject.sol';

/**
 * @title InVinoVeritasProjectFactory
 * @dev Factory contract for creating and deploying InVinoVeritas projects
 * @notice This contract allows the owner to create new InVinoVeritas projects and tracks all deployed projects
 */
contract InVinoVeritasProjectFactory is Ownable {
    /// @notice The address of the USDC token contract
    address public immutable usdcAddress;
    
    /// @notice Array of all deployed project addresses
    address[] public allProjects;
    
    /**
     * @notice Emitted when a new project is deployed
     * @param projectAddress The address of the newly deployed project
     * @param projectValue The estimated value of the project in USD
     */
    event ProjectDeployed(address projectAddress, uint projectValue); 
    
    /**
     * @notice Initializes the factory with the USDC token address
     * @dev Sets the owner and validates the USDC address
     * @param _usdcAddress The address of the USDC token contract
     */
    constructor(address _usdcAddress) Ownable(msg.sender) {
        require(_usdcAddress != address(0), "USDC address is not set");
        usdcAddress = _usdcAddress;
    }

    /**
     * @notice Creates a new InVinoVeritas project
     * @dev Only callable by the contract owner
     * @param _symbol The symbol of the token associated with the project
     * @param _name The name of the project to deploy
     * @param _projectValue The estimated project value in USD
     * @custom:throws "Symbol is required" if the symbol is empty
     * @custom:throws "Project Name is required" if the name is empty
     * @custom:throws "Project value must be greater than 0" if the project value is 0
     */    
    function createProject (string memory _symbol, string memory _name,  uint256 _projectValue) external onlyOwner {
        require(keccak256(abi.encode(_symbol)) != keccak256(abi.encode("")), 'Symbol is required');
        require(keccak256(abi.encode(_name)) != keccak256(abi.encode("")), 'Project Name is required');
        require(_projectValue > 0, "Project value must be greater than 0");

        address ivvProjectAddress = address(new InVinoVeritasProject(owner(), _symbol, usdcAddress, _name, _projectValue));
        allProjects.push(ivvProjectAddress);
        emit ProjectDeployed (ivvProjectAddress, _projectValue);        
    }
}