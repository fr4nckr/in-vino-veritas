// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract IVV is ERC20 {

/**
     * @dev Sets the values for {name} and {symbol}.
     *
     * All two of these values are immutable: they can only be set once during
     * construction.
     */
    constructor(string memory _symbol, uint _totalSupply) ERC20 ('In Vino Veritas', _symbol) {
        _mint(msg.sender, _totalSupply);
    }
}