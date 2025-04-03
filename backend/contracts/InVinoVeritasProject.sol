// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./IVV.sol";

/**
 * @title InVinoVeritasProject
 * @notice This contract is used to manage a project in the IVV ecosystem
 */
contract InVinoVeritasProject is Ownable {
    
    using SafeERC20 for IERC20;
    IERC20 public immutable usdc;
    IERC20 public immutable ivv;

    string public projectName;

    uint256 public projectValue;

    uint256 private immutable exchangeRate = 50;

    mapping (address => Investor) investors;

    /**
     * @notice Struct representing an investor
     * @param isRegistered Whether the investor is registered for this project
     * @param isValidated Whether the investor is validated by the owner (KYC validated)
     */
    struct Investor {
        InvestorStatus investorStatus;
        uint256 amountInvested;
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
     * @notice Enum representing the status of the investor
     */
    enum InvestorStatus {
        NotRegistered,
        Registered,
        Validated,
        Denied
    }
    
    /**
     * @notice Event emitted when an investor is registered
     * @param investorAddress The address of the investor
     */
    event InvestorRegistered(address investorAddress);
    /**
     * @notice Event emitted when an investor is validated
     * @param investorAddress The address of the investor
     */
    event InvestorValidated(address investorAddress);

    /**
     * @notice Event emitted when an investor is validated
     * @param investorAddress The address of the investor
     */
    event InvestorDenied(address investorAddress);

    /**
     * @notice Event emitted when the project status changes
     * @param previousStatus The previous status of the project
     * @param newStatus The new status of the project
     */
    event ProjectStatusChange(ProjectStatus previousStatus, ProjectStatus newStatus);
    
    /**
     * @notice Event emitted when a piece of the land has been bought
     * @param investorAddress Address of the investor who bought the piece of the land
     * @param amountInvested Amount of USDC invested by the investor
     * @param ivvAmount Amount of IVV tokens received by the investor
     */
    event LandPieceBought(address investorAddress, uint256 amountInvested, uint256 ivvAmount);

    /**
     * @notice Constructor of the IVVProject contract
     * @param _symbolIvv The symbol of the IVV token to deploy and to associated to the project
     * @param _usdcAddress The address of the USDC token that will be used by investors to buy a piece of the project
     * @param _projectName The name of the project
     * @param _projectValue The estimated value of the project in USD
     */
    constructor(address _owner, string memory _symbolIvv, address _usdcAddress, string memory _projectName, uint _projectValue) Ownable(_owner) {   
        require(keccak256(abi.encode(_symbolIvv)) != keccak256(abi.encode("")), 'Symbol is required');
        require(_usdcAddress != address(0), "USDC address is not set");
        require(keccak256(abi.encode(_projectName)) != keccak256(abi.encode("")), 'Project name is required');
        require(_projectValue > 0, "Project value must be greater than 0");
        projectName = _projectName;
        projectValue = _projectValue;
        uint256 initialSupply = Math.mulDiv(_projectValue, 10 ** 18,  exchangeRate);
        ivv = new IVV(_symbolIvv, initialSupply);
        usdc = IERC20(_usdcAddress);
    }
    
    /**
     * @notice Modifier to check if the investor is registered to participate in the project
     */
    modifier onlyRegisteredInvestors() {
        require(investors[msg.sender].investorStatus == InvestorStatus.Registered, "You are not a registered investor");
        _;
    }

    modifier onlyValidatedInvestors() {
        require(investors[msg.sender].investorStatus == InvestorStatus.Validated, "You are not a validated investor");
        _;
    }
    
    /**
     * @notice Start the project sale
     * @dev This function can only be called by the owner and will be used to start the project sale
     */
    function startProjectSale() external onlyOwner {
        require(projectStatus == ProjectStatus.ToCome, "Project cannot be started");
        projectStatus = ProjectStatus.OnSale;
        emit ProjectStatusChange(ProjectStatus.ToCome, ProjectStatus.OnSale);
    }

    /**
     * @notice End the project sale
     * @dev This function can only be called by the owner and will be used to end the project sale when all conditions are met
     */
    function endProjectSale() external onlyOwner {
        require(projectStatus == ProjectStatus.OnSale, "Project is not on sale");
        projectStatus = ProjectStatus.SoldOut;
        emit ProjectStatusChange(ProjectStatus.OnSale, ProjectStatus.SoldOut);
    }
    
    /**
     * @notice Validate an investor
     * @dev This function can only be called by the owner and will be used to validate an investor after he passes the KYC procedure
     * @param _investorAddress The address of the investor that has been validated
     */
    function validateInvestor(address _investorAddress) external onlyOwner {
        require(projectStatus != ProjectStatus.SoldOut, "Project is already Soldout");
        require(investors[_investorAddress].investorStatus == InvestorStatus.Registered, "You're not registered");
        require(investors[_investorAddress].investorStatus != InvestorStatus.Validated, "You're already validated");
        investors[_investorAddress].investorStatus = InvestorStatus.Validated;
        emit InvestorValidated(_investorAddress);
    }

    /**
     * @notice Refuse an investor
     * @dev This function can only be called by the owner and will be used to refuse an investor
     * @param _investorAddress The address of the investor that has been refused
     */
    function denyInvestor(address _investorAddress) external onlyOwner {
        require(projectStatus != ProjectStatus.SoldOut, "Project is already Soldout");
        require(investors[_investorAddress].investorStatus == InvestorStatus.Registered, "You're not registered");
        require(investors[_investorAddress].investorStatus != InvestorStatus.Denied, "You're already denied");
        investors[_investorAddress].investorStatus = InvestorStatus.Denied;
        emit InvestorDenied(_investorAddress);
    }

    /**
     * @notice Get the status of an investor
     * @param _investorAddress The address of the investor
     * @return The status of the investor
     */
    function getInvestorStatus(address _investorAddress) external view returns (InvestorStatus) {
        return (investors[_investorAddress].investorStatus);
    }

    /**
     * @notice Let an investor an investor
     * @dev This function can only be called by the owner and will be used to validate an investor after he passes the KYC procedure
     */
    function askForRegistration() external {
        require(projectStatus != ProjectStatus.SoldOut, "Project is already Soldout");
        require(investors[msg.sender].investorStatus == InvestorStatus.NotRegistered || investors[msg.sender].investorStatus == InvestorStatus.Denied, "You're already registered or validated");
        investors[msg.sender].investorStatus = InvestorStatus.Registered;
        emit InvestorRegistered(msg.sender);
    }

    /**
     * @notice Buy a land piece of the project in USDC
     * @param _amount USDC amount to buy with
     * @dev This function can only be called by a registered investor and will be used to buy a project piece. Remember to make the usdc approval.
     */
    function buyLandPiece(uint256 _amount) external onlyValidatedInvestors {
        require(projectStatus == ProjectStatus.OnSale, "Project is not on sale");
        require(_amount > 0, "You have to send a positive USDC amount");
        require(usdc.balanceOf(msg.sender) >= _amount, "Not enough USDC to buy");
        uint256 ivvAmountOut = Math.mulDiv(_amount, 10 ** 12,  exchangeRate);
        require(ivv.balanceOf(address(this)) >= ivvAmountOut, "Not enough project pieces available for sale");

        investors[msg.sender].amountInvested += _amount;
        usdc.safeTransferFrom(msg.sender, address(this), _amount);
        ivv.safeTransfer(msg.sender, ivvAmountOut);
        
        emit LandPieceBought(msg.sender, _amount, ivvAmountOut);
    }
}