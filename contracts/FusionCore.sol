//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./BasicToken.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

///@notice Main Fusion Finance contract responsible for staking, collateralizing and borrowing
///@author John Nguyen (jooohn.eth)
contract FusionCore is AccessControl {
    ///@notice events emitted after each action.
    event Staking(address indexed staker, uint amount);
    event WithdrawStaking(address indexed staker, uint amount);
    event ClaimYield(address indexed staker, uint amount);
    event Collateralize(address indexed borrower, uint amount);
    event WithdrawCollateral(address indexed borrower, uint amount);
    event Borrow(address indexed borrower, uint amount);
    event Repay(address indexed borrower, uint amount);
    event Liquidate(address liquidator, uint reward, address indexed borrower);

    ///@notice mappings needed to keep track of staking
    mapping(address => uint) public stakingBalance;
    mapping(address => uint) public fusionBalance;
    mapping(address => uint) public startTime;
    mapping(address => bool) public isStaking;

    ///@notice mappings needed to keep track of collateral and borrowing
    mapping(address => uint) public collateralBalance;
    mapping(address => uint) public borrowBalance;
    mapping(address => bool) public isBorrowing;

    ///@notice declaring chainlink's price aggregator.
    AggregatorV3Interface internal priceFeed;

    ///@notice declaring token variables.
    Token public immutable baseAsset;
    Token public immutable fusionToken;
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    address public fee_collector;
    uint256 public fee_rate = 10; // 1 %
    address public vault;
    bool public pause = false;
    uint public startBlock = 0;
    uint public stopBlock = 18903732;

    ///@notice initiating tokens
    ///@param _baseAssetAddress address of base asset token
    ///@param _fusionAddress address of $FUSN token
    constructor(
        Token _baseAssetAddress,
        Token _fusionAddress,
        address _aggregatorAddress,
        address _admin
    ) {
        baseAsset = _baseAssetAddress;
        fusionToken = _fusionAddress;
        priceFeed = AggregatorV3Interface(_aggregatorAddress);
        _setupRole(DEFAULT_ADMIN_ROLE, _admin);
        _setupRole(ADMIN_ROLE, _admin);
        fee_collector = _admin;
        vault = _admin;
    }

    function setStartBlock(uint _startBlock) public onlyRole(ADMIN_ROLE) {
        startBlock = _startBlock;
    }

    function setStopBlock(uint _stopBlock) public onlyRole(ADMIN_ROLE) {
        stopBlock = _stopBlock;
    }

    function setFeeCallector(
        address _feeCallector
    ) public onlyRole(ADMIN_ROLE) {
        fee_collector = _feeCallector;
    }

    function setFeeRate(uint256 _fee_rate) public onlyRole(ADMIN_ROLE) {
        require(_fee_rate > 0, "Can't set fee rate: 0!");
        fee_rate = _fee_rate;
    }

    function setVault(address _valut) public onlyRole(ADMIN_ROLE) {
        vault = _valut;
    }

    ///@notice checks if the borrow position has passed the liquidation point
    ///@dev added 'virtual' identifier for MockCore to override
    modifier passedLiquidation(address _borrower) virtual {
        uint collatAssetPrice = getCollatAssetPrice();
        require(
            (collatAssetPrice * collateralBalance[_borrower]) / 10 ** 8 <=
                calculateLiquidationPoint(_borrower),
            "Position can't be liquidated!"
        );
        _;
    }

    ///@notice Function to get latest price of ETH in USD
    ///@return collatAssetPrice price of ETH in USD
    function getCollatAssetPrice() public view returns (uint collatAssetPrice) {
        (, int price, , , ) = priceFeed.latestRoundData();
        collatAssetPrice = uint(price);
    }

    ///@notice calculates amount of time the staker has been staking since the last update.
    ///@param _staker address of staker
    ///@return stakingTime amount of time staked by staker
    function calculateYieldTime(
        address _staker
    ) public view returns (uint stakingTime) {
        if (block.number > startBlock && block.number < stopBlock) {
            stakingTime = block.timestamp - startTime[_staker];
        } else {
            stakingTime = 0;
        }
    }

    ///@notice calculates amount of $FUSN tokens the staker has earned since the last update.
    ///@dev rate = timeStaked / amount of time needed to earn 100% of $FUSN tokens. 31536000 = number of seconds in a year.
    ///@param _staker address of staker
    ///@return yield amount of $FUSN tokens earned by staker
    function calculateYieldTotal(
        address _staker
    ) public view returns (uint yield) {
        uint timeStaked = calculateYieldTime(_staker) * 10 ** 18;
        yield = ((stakingBalance[_staker] * timeStaked) / 31536000) / 10 ** 18;
    }

    ///@notice calculates the borrow limit depending on the price of ETH and borrow limit rate.
    ///@return limit current borrow limit for user
    function calculateBorrowLimit(
        address _borrower
    ) public view returns (uint limit) {
        uint collatAssetPrice = getCollatAssetPrice();
        // Bug devide by zero
        if (
            ((((collatAssetPrice * collateralBalance[_borrower]) * 80) / 100)) /
                10 ** 8 >
            borrowBalance[_borrower]
        ) {
            limit =
                (
                    (((collatAssetPrice * collateralBalance[_borrower]) * 80) /
                        100)
                ) /
                10 ** 8 -
                borrowBalance[_borrower];
        } else {
            limit = 0;
        }
    }

    function calculateLiquidationPoint(
        address _borrower
    ) public view returns (uint point) {
        point =
            borrowBalance[_borrower] +
            (borrowBalance[_borrower] * 10) /
            100;
    }

    ///@notice staks base asset.
    ///@param _amount amount of tokens to stake
    function stake(uint _amount) external {
        require(_amount > 0, "Can't stake amount: 0!");
        require(block.number > startBlock, "error startBlock");
        require(block.number < stopBlock, "error stopBlock");
        require(
            baseAsset.balanceOf(msg.sender) >= _amount,
            "Insufficient balance!"
        );

        if (isStaking[msg.sender]) {
            uint yield = calculateYieldTotal(msg.sender);
            fusionBalance[msg.sender] += yield;
        }

        stakingBalance[msg.sender] += _amount;
        startTime[msg.sender] = block.timestamp;
        isStaking[msg.sender] = true;

        require(
            baseAsset.transferFrom(msg.sender, address(this), _amount),
            "Transaction failed!"
        );

        emit Staking(msg.sender, _amount);
    }

    ///@notice withdraw base asset.
    ///@param _amount amount of tokens to withdraw
    function withdrawStaking(uint _amount) public {
        require(isStaking[msg.sender], "Can't withdraw before staking!");
        require(
            stakingBalance[msg.sender] >= _amount,
            "Insufficient staking balance!"
        );

        uint yield = calculateYieldTotal(msg.sender);
        fusionBalance[msg.sender] += yield;
        startTime[msg.sender] = block.timestamp;

        uint withdrawAmount = _amount;
        _amount = 0;
        stakingBalance[msg.sender] -= withdrawAmount;

        if (stakingBalance[msg.sender] == 0) {
            isStaking[msg.sender] = false;
        }

        require(
            baseAsset.transfer(msg.sender, withdrawAmount),
            "Transaction failed!"
        );

        emit WithdrawStaking(msg.sender, withdrawAmount);
    }

    ///@notice claims all yield earned by staker.
    function claimYield() external {
        uint yield = calculateYieldTotal(msg.sender);

        require(
            yield > 0 || fusionBalance[msg.sender] > 0,
            "No, $FUSN tokens earned!"
        );

        if (fusionBalance[msg.sender] != 0) {
            uint oldYield = fusionBalance[msg.sender];
            fusionBalance[msg.sender] = 0;
            yield += oldYield;
        }

        startTime[msg.sender] = block.timestamp;
        fusionToken.mint(msg.sender, yield);

        emit ClaimYield(msg.sender, yield);
    }

    ///@notice collateralizes user's ETH and sets borrow limit
    function collateralize() external payable {
        require(msg.value > 0, "Can't collaterlize ETH amount: 0!");

        collateralBalance[msg.sender] += msg.value;

        emit Collateralize(msg.sender, msg.value);
    }

    ///@notice withdraw user's collateral ETH and recalculates the borrow limit
    ///@param _amount amount of ETH the user wants to withdraw
    function withdrawCollateral(uint _amount) external {
        require(
            collateralBalance[msg.sender] >= _amount,
            "Not enough collateral to withdraw!"
        );
        require(
            !isBorrowing[msg.sender],
            "Can't withdraw collateral while borrowing!"
        );

        collateralBalance[msg.sender] -= _amount;

        (bool success, ) = msg.sender.call{value: _amount}("");
        require(success, "Transaction Failed!");

        emit WithdrawCollateral(msg.sender, _amount);
    }

    ///@notice borrows base asset
    ///@param _amount amount of base asset to borrow
    ///@dev deducting 0.3% from msg.sender's ETH collateral as protocol's fees
    function borrow(uint _amount) external {
        uint collatAssetPrice = getCollatAssetPrice();
        uint fee = ((_amount / collatAssetPrice) * fee_rate) / 1000;
        fee = fee * 10 ** 8;
        collateralBalance[msg.sender] -= fee;

        require(collateralBalance[msg.sender] > 0, "No ETH collateralized!");
        require(
            calculateBorrowLimit(msg.sender) >= _amount,
            "Borrow amount exceeds borrow limit!"
        );

        isBorrowing[msg.sender] = true;
        borrowBalance[msg.sender] += _amount;

        baseAsset.mint(msg.sender, _amount);
        (bool success, ) = fee_collector.call{value: fee}("");
        require(success, "Transaction Failed!");

        emit Borrow(msg.sender, _amount);
    }

    ///@notice repays base asset debt
    ///@param _amount amount of base asset to repay
    function repay(uint _amount) external {
        require(isBorrowing[msg.sender], "Can't repay before borrowing!");
        require(
            baseAsset.balanceOf(msg.sender) >= _amount,
            "Insufficient funds!"
        );
        require(
            _amount > 0 && _amount <= borrowBalance[msg.sender],
            "Can't repay amount: 0 or more than amount borrowed!"
        );

        if (_amount == borrowBalance[msg.sender]) {
            isBorrowing[msg.sender] = false;
        }

        borrowBalance[msg.sender] -= _amount;

        require(
            baseAsset.transferFrom(msg.sender, address(this), _amount),
            "Transaction Failed!"
        );
        baseAsset.burn(_amount);
        emit Repay(msg.sender, _amount);
    }

    ///@notice liquidates a borrow position
    ///@param _borrower address of borrower
    ///@dev passedLiquidation modifier checks if the borrow position has passed liquidation point
    ///@dev liquidationReward 1.25% of borrower's ETH collateral
    function liquidate(
        address _borrower
    ) external passedLiquidation(_borrower) {
        require(isBorrowing[_borrower], "This address is not borrowing!");
        require(msg.sender != _borrower, "Can't liquidated your own position!");

        uint liquidationReward = (collateralBalance[_borrower] * 125) / 10000;
        collateralBalance[_borrower] -= liquidationReward;

        (bool v_success, ) = vault.call{value: collateralBalance[_borrower]}(
            ""
        );
        require(v_success, "Transaction Failed!");

        (bool l_success, ) = msg.sender.call{value: liquidationReward}("");
        require(l_success, "Transaction Failed!");

        collateralBalance[_borrower] = 0;
        borrowBalance[_borrower] = 0;
        isBorrowing[_borrower] = false;

        emit Liquidate(msg.sender, liquidationReward, _borrower);
    }

    ///@notice returns staking status of staker
    function getStakingStatus(address _staker) external view returns (bool) {
        return isStaking[_staker];
    }

    ///@notice retuns amount of $FUSN tokens earned
    function getEarnedFusionTokens(
        address _staker
    ) external view returns (uint) {
        return fusionBalance[_staker] + calculateYieldTotal(_staker);
    }

    ///@notice returns amount of base asset lent
    function getStakingBalance(address _staker) external view returns (uint) {
        return stakingBalance[_staker];
    }

    ///@notice returns amount of collateralized asset
    function getCollateralBalance(
        address _borrower
    ) external view returns (uint) {
        return collateralBalance[_borrower];
    }

    ///@notice returns borrowing status of borrower
    function getBorrowingStatus(
        address _borrower
    ) external view returns (bool) {
        return isBorrowing[_borrower];
    }

    ///@notice returns amount of base asset borrowed
    function getBorrowBalance(address _borrower) external view returns (uint) {
        return borrowBalance[_borrower];
    }

    ///@notice returns amount of base asset available to borrow
    function getBorrowLimit(address _borrower) external view returns (uint) {
        return calculateBorrowLimit(_borrower);
    }

    ///@notice returns liquidation point
    function getLiquidationPoint(
        address _borrower
    ) external view returns (uint) {
        return calculateLiquidationPoint(_borrower);
    }
}
