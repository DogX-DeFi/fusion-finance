import React from "react";

const PositionSection = ({
  borrowLimit,
  liquidationPrice,
  collateralPrice,
}) => {
  return (
    <div className="flex flex-col p-6 bg-gray-900 rounded-lg gap-y-6">
      <hr className="border-secondary" />
      <div className="flex gap-x-7">
        <div className="flex flex-col gap-y-4">
          <div className="flex items-start gap-x-2">
            <div className="text-sm font-medium text-white">Borrow Limit: </div>
            <div className="text-sm font-medium text-primary">
              {borrowLimit} DUSD
            </div>
          </div>
          <div className="flex items-start gap-x-2">
            <div className="text-sm font-medium text-white">
              {" "}
              Collateral Price:{" "}
            </div>
            <div className="text-sm font-medium text-primary">
              {collateralPrice} DUSD
            </div>
          </div>
          <div className="flex items-start gap-x-2">
            <div className="text-sm font-medium text-white">
              {" "}
              LiquidationPrice:{" "}
            </div>
            <div className="text-sm font-medium text-primary">
              {Number(collateralPrice) - (Number(collateralPrice) * 10) / 100}{" "}
              DUSD
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PositionSection;
