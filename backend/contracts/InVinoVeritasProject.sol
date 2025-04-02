// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

import "./IVV.sol";

/**
 * @title InVinoVeritasProject
 * @notice This contract is used to manage a project in the IVV ecosystem
 */
contract InVinoVeritasProject is Ownable {
    
    IERC20 public immutable usdc;
    IERC20 public immutable ivv;

    string public projectName;

    uint256 public projectValue;

    uint256 private immutable exchangeRate = 50;
    
    mapping (address => Investor) investors;

    /**
     * @notice Struct representing an investor
     * @param isRegistered Whether the investor is registered (off-chain KYC)
     */
    struct Investor {
        bool isRegistered;
    }

    /**
     * @notice The current status of the project
     */
    ProjectStatus public projectStatus;

    /**
     * @notice Enum representing the status of the project
     */
    enum ProjectStatus {
        ToCome,
        OnSale,
        SoldOut
    }
    
    /**
     * @notice Event emitted when an investor is registered
     * @param investorAddress The address of the investor
     */
    event InvestorRegistered(address investorAddress);

    /**
     * @notice Event emitted when the project status changes
     * @param previousStatus The previous status of the project
     * @param newStatus The new status of the project
     */
    event ProjectStatusChange(ProjectStatus previousStatus, ProjectStatus newStatus);
    
    /**
     * @notice Event emitted when a piece of the land has been bought
     * @param investorAddress Address of the investor who bought the piece of the land
     */
    event LandPieceBought(address investorAddress);

    /**
     * @notice Constructor of the IVVProject contract
     * @param _symbolIvv The symbol of the IVV token to deploy and to associated to the project
     * @param _usdcAddress The address of the USDC token that will be used by investors to buy a piece of the project
     * @param _projectName The name of the project
     * @param _projectValue The estimated value of the project in USD
     */
    constructor(address _owner, string memory _symbolIvv, address _usdcAddress, string memory _projectName, uint _projectValue) Ownable(_owner) {   
        require(_owner != address(0), "Owner address is not set");
         projectName = _projectName;
         projectValue = _projectValue;
         
         // Calculate initial supply (18 decimals)
         uint256 initialSupply = (_projectValue * 10 ** 18) / exchangeRate;
         ivv = new IVV(_symbolIvv, initialSupply);
         usdc = IERC20(_usdcAddress);
    }
    
    /**
     * @notice Modifier to check if the investor is registered
     */
    modifier onlyRegisteredInvestors() {
        require(investors[msg.sender].isRegistered, "You're not a registered investor");
        _;
    }
    
    /**
     * @notice Start the project sale
     * @dev This function can only be called by the owner and will be used to start the project sale
     */
    function startProjectSale() external onlyOwner {
        require(projectStatus == ProjectStatus.ToCome, "Project is not to come");
        projectStatus = ProjectStatus.OnSale;
        emit ProjectStatusChange(ProjectStatus.ToCome, ProjectStatus.OnSale);
    }

    /**
     * @notice End the project sale
     * @dev This function can only be called by the owner and will be used to end the project sale when all conditions are met
     */
    function endProjectSale () external onlyOwner {
        require(projectStatus == ProjectStatus.OnSale, "Project is not on sale");
        projectStatus = ProjectStatus.SoldOut;
        emit ProjectStatusChange(ProjectStatus.OnSale, ProjectStatus.SoldOut);
    }

    /**
     * @notice Validate an investor
     * @dev This function can only be called by the owner and will be used to validate an investor after he passes the KYC procedure
     * @param _investorAddress The address of the investor that has been validated
     */
    function registerInvestor(address _investorAddress) external onlyOwner {
        require(projectStatus != ProjectStatus.SoldOut, "Project is already Soldout");
        require(investors[_investorAddress].isRegistered == false, "You're already registered");
        investors[_investorAddress].isRegistered = true;
        emit InvestorRegistered(_investorAddress);
    }

    /**
     * @notice Buy a land piece of the project in USDC
     * @param _amount USDC amount to buy with
     * @dev This function can only be called by a registered investor and will be used to buy a project piece. Remember to make the usdc approval.
     */
    function buyLandPiece(uint256 _amount) external onlyRegisteredInvestors {
        require(_amount > 0, "You have to send a positive USDC amount");
        require(projectStatus == ProjectStatus.OnSale, "Project is not on sale");
        // uint256 usdcAmountIn = _amount * 10 ** 6;
        uint256 usdcAmountIn = _amount;
        require(usdc.balanceOf(msg.sender) >= usdcAmountIn, "Not enough USDC to buy");
        uint256 ivvAmountOut = Math.mulDiv(_amount / 10 ** 6, 10 ** 18,  exchangeRate);
        require(ivv.balanceOf(address(this)) >= ivvAmountOut, "Not enough project pieces available for sale");

        // Check if this purchase would exceed the total supply
        require(ivvAmountOut <= ivv.totalSupply(), "Purchase would exceed total supply");

        // Transfer USDC from buyer to contract
        usdc.transferFrom(msg.sender, address(this), usdcAmountIn);
        
        // Transfer IVV tokens from contract to buyer
        ivv.transfer(msg.sender, ivvAmountOut);
        
        emit LandPieceBought(msg.sender);
    }
}