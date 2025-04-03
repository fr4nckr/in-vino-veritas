// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";

/**
 * @title IVV
 * @dev ERC20Capped implementation for In Vino Veritas tokens
 */
contract IVV is ERC20Capped { 
    /**
     * @dev Constructor for IVV token
     * @param _symbol The symbol of the token
     * @param _totalSupply The total supply of the token that will be capped and minted to the owner
     */
    constructor(string memory _symbol, uint256 _totalSupply) ERC20 ('In Vino Veritas', _symbol) ERC20Capped(_totalSupply)  {
         _mint(msg.sender, _totalSupply);
    }
}