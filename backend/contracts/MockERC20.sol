// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
/**
 * @title MockERC20
 * @dev A mintable MockERC20 token implementation. (Testnet purposes only)
 */
contract MockERC20 is ERC20 {
    /// @notice The number of decimals of the token
    uint8 private _decimals;

    /**
     * @notice Constructor for the MockERC20 token
     * @param _ercName The name of the token
     * @param _ercSymbol The symbol of the token
     * @param decimalsArg The number of decimals of the token
     */
    constructor(string memory _ercName, string memory _ercSymbol, uint8 decimalsArg) ERC20(_ercName, _ercSymbol) {
        _decimals = decimalsArg;
    }

    /**
     * @notice Mint a new token
     * @param to The address to mint the token to
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    /**
     * @notice Get the number of decimals of the token
     * @return The number of decimals of the token
     */ 
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
}