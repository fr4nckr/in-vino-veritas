// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IVV.sol";

/**
 * @title IVVProject
 * @notice This contract is used to manage a project in the IVV ecosystem
 */
contract IVVProject is Ownable {
    address public immutable usdcAddress;
    address public immutable ivvAddress;

    string public projectName;
    uint public projectValue;

    mapping (address => Investor) investors;
    /**
     * @notice Struct representing an investor
     * @param isRegistered Whether the investor is registered
     * @param nbTokensToSend The number of tokens to send to the investor
     */
    struct Investor {
        bool isRegistered; 
        uint nbTokensToSend;
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

    event LandPieceBought(address investorAddress);

    /**
     * @notice Constructor of the IVVProject contract
     * @param _symbol The symbol of the IVV token to deploy and to associated to the project
     * @param _usdcAddress The address of the USDC token that will be used by investors to buy a piece of the project
     * @param _projectName The name of the project
     * @param _projectValue The estimated value of the project in USD
     */
    constructor(string memory _symbol, address _usdcAddress, string memory _projectName, uint _projectValue) Ownable(msg.sender) {   
         projectName = _projectName;
         projectValue = _projectValue;

         ivvAddress = address(new IVV(_symbol, _projectValue));
         usdcAddress = _usdcAddress;
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
    function startProjectSale () external onlyOwner {
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
        //Maximum investor to add ? 
        investors[_investorAddress].isRegistered = true;
        emit InvestorRegistered(_investorAddress);
    }

    /**
     * @notice Buy a project piece in USDC
     * @dev This function can only be called by a registered investor and will be used to buy a project piece
     */
    function buyProjectPiece(uint _amount) external onlyRegisteredInvestors{
        require(projectStatus == ProjectStatus.OnSale, "Project is not on sale");
        require(IERC20(ivvAddress).balanceOf(address(this)) >= _amount, "Not enough project pieces available");
        require(IERC20(usdcAddress).balanceOf(msg.sender) < _amount, "Not enough USDC to buy");

        //transfer USDC to the contract
        IERC20(usdcAddress).transferFrom(msg.sender, address(this), _amount);

        //Send tokens to the investor
        IERC20(ivvAddress).transferFrom(address(this), msg.sender, _amount);

        emit LandPieceBought(msg.sender);
    }

}