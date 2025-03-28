// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IVVProject
 * @notice This contract is used to manage a project in the IVV ecosystem
 */
contract IVVProject is Ownable {

    IERC20 ivv;

    //Name of the project
    string public projectName;

    uint numberOfPiecesBought;
    uint numberOfTotalPieces;
    uint nbTokensPerPieces;

    mapping (address => Investor) investors;

    /**
     * @notice The current status of the project
     */
    ProjectStatus public projectStatus;

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
     * @param _ivvAddress The address of the IVV token to associate to the project
     * @param _projectName The name of the project
     * @param _tokenPerPieces The number of tokens per piece to distribute to each land piece buy
     */
    constructor(address _ivvAddress, string memory _projectName, uint _tokenPerPieces) Ownable(msg.sender) {   
         ivv = IERC20(_ivvAddress);
         nbTokensPerPieces = _tokenPerPieces;
         projectName = _projectName;
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
        require(investors[_investorAddress].isRegistered, "You're already registered");
        //Maximum investor to add ? 
        investors[_investorAddress].isRegistered = true;
        emit InvestorRegistered(_investorAddress);
    }

    /**
     * @notice Buy a project piece
     * @dev This function can only be called by a registered investor and will be used to buy a project piece
     */
    function buyProjectPiece() external onlyRegisteredInvestors payable{
        require(projectStatus == ProjectStatus.OnSale, "Project is not on sale");
        require(investors[msg.sender].isRegistered, "You're not a registered investor");
        numberOfPiecesBought++;
        //ivv.transfer(msg.sender, nbTokensPerPieces);
        emit LandPieceBought(msg.sender);
    }

}