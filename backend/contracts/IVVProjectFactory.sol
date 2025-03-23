// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import './IVV.sol';

/**
 */
contract IVVProjectFactory is Ownable {

    event TokenDeployed(address tokenAddress);
    constructor() Ownable(msg.sender) {}

    /**
     *
     */    
    function deployNewProject (string memory _symbol, uint _surface) external returns(address) {

        //deployToken();

        address ivvTokenAddress = address(new IVV(_symbol, _surface));

        emit TokenDeployed(ivvTokenAddress);
        
        return address(ivvTokenAddress);


    // // Initialize the collection contract with the artist settings
    //     IVV(collectionAddress).init(msg.sender, _artistName, _artistSymbol);

    //     emit NFTCollectionCreated(_artistName, collectionAddress, block.timestamp);
        
    //     //deployProject with the name and the token address
    //     //transfer token to project
    //     //emit ProjectDeployed (token address, surface)        
    }
    

}