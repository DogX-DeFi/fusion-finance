//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./FusionToken.sol";

contract FusionCore {

    ///@notice staking events emitted after each action.
    event Lend(address indexed sender, uint amount);
    event Withdraw(address indexed sender, uint amount);
    event ClaimYield(address indexed sender, uint amount);

    ///@notice mappings needed to keep track of lending
    mapping(address => uint) public lendingBalance;
    mapping(address => uint) public fusionBalance;
    mapping(address => uint) public startTime;
    mapping(address => bool) public isStaking;

    ///@notice declaring token variables.
    IERC20 public usdcToken;
    FusionToken public fusionToken;

    ///@notice initiating tokens
    ///@param _usdcAddress address of USDC token
    ///@param _fusionAddress address of $FUSN token
    constructor(IERC20 _usdcAddress, FusionToken _fusionAddress) {
        usdcToken = _usdcAddress;
        fusionToken = _fusionAddress;
    } 

    ///@notice calculates amount of time the lender has been lending since the last update.
    ///@param _lender address of lender
    ///@return stakingTime amount of time staked by lender
    function calculateYieldTime(address _lender) public view returns(uint stakingTime) {
        stakingTime = block.timestamp - startTime[_lender];
    }

    ///@notice calculates amount of $FUSN tokens the lender has earned since the last update.
    ///@dev rate = timeStaked / amount of time needed to earn 100% of $FUSN tokens. 31536000 = number of seconds in a year.
    ///@param _lender address of lender
    ///@return yield amount of $FUSN tokens earned by lender
    function calculateYieldTotal(address _lender) public view returns(uint yield) {
        uint timeStaked = calculateYieldTime(_lender) * 10**18;
        uint rate = timeStaked / 31536000; 
        yield = (lendingBalance[_lender] * rate) / 10**18;
    }
}