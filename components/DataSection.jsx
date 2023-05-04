import React from "react";

const DataSection = ({
  fusnBalance,
  daiBalance,
  earnedTokens,
  lendingBalance,
  borrowBalance,
  collateralBalance,
}) => {
  return (
    <div className="flex gap-6">
      <div className="flex flex-row w-1/2 p-4 bg-gray-900 rounded-lg justify-evenly gap-y-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-x-3 gap-y-3">
            <div className="text-xs font-medium text-secondary ">Lending</div>
            <span className="text-xs font-medium text-white">100% APY</span>
          </div>
          <div className="text-xl font-semibold text-white">
            {earnedTokens} DOGX
          </div>
          <div className="text-sm tracking-wide text-gray-500">
            {lendingBalance} DUSD
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-x-3 gap-y-3">
            <div className="text-xs font-medium text-primary ">Borrowing</div>
            <span className="text-xs font-medium text-white">0.5% fee</span>
          </div>
          <div className="text-xl font-semibold text-white">
            {borrowBalance} DUSD
          </div>
          <div className="text-sm tracking-wide text-gray-500">
            {collateralBalance} Ξ
          </div>
        </div>
      </div>

      <div className="flex flex-row w-1/2 p-4 bg-gray-900 rounded-lg justify-evenly gap-y-3">
        <div className="flex flex-col justify-around">
          <div className="flex items-center gap-x-3 gap-y-3">
            <div className="text-xs font-medium text-primary ">
              DOGX Wallet Balance
            </div>
          </div>
          <div className="text-xl font-semibold text-white">
            {fusnBalance} DOGX
          </div>
        </div>
        <div className="flex flex-col justify-around">
          <div className="flex items-center gap-x-3 gap-y-3">
            <div className="text-xs font-medium text-secondary ">
              DUSD Wallet Balance
            </div>
          </div>
          <div className="text-xl font-semibold text-white">
            {daiBalance} DUSD
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSection;
