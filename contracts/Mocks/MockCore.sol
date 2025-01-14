//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../FusionCore.sol";

///@notice Mock of FusionCore contract for testing liquidate function
contract MockCore is FusionCore {
    constructor(
        Token _baseAssetAddress,
        Token _fusionAddress,
        address _aggregatorAddress,
        address _admin
    ) FusionCore(_baseAssetAddress, _fusionAddress, _aggregatorAddress, _admin) {}

    ///@notice overriding the passedLiquidation modifier to mock the price of ETH. Let's anyone liquidate any borrow position.
    ///@dev ethPrice set to 0 to be able to get liquidated
    modifier passedLiquidation(address _borrower) override {
        uint ethPrice = 0;
        require((ethPrice * collateralBalance[_borrower]) <= calculateLiquidationPoint(_borrower), "Position can't be liquidated!");
        _;
    }
}
