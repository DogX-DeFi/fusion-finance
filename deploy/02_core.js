module.exports = async ({ getNamedAccounts, deployments, network, ether }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy } = deployments;
  // constructor(Token _baseAssetAddress, Token _fusionAddress, address _aggregatorAddress, address _admin)
  
  await deploy("FusionCore", {
    from: deployer,
    args: [
      "0xf62Ff625A8E8c07f8750C1ce2E623f0bCDc1100F",
      "0x6F7e3bB0abF276ae62602B9e92690F76C68Fb566",
      "0xD1b36e2060978B0fA0e2c34699B75B5805eBD0E0",
      "0x994A351AE962a0446777F5a26e28961fB1514d61",
    ],
    log: true,
    deterministicDeployment: false,
  });
  /*
  await execute(
    "grantRole",
    { from: deployer, log: true },
    "transferOwnership",
    [
      "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6",
      "0x994A351AE962a0446777F5a26e28961fB1514d61",
    ]
  );
  */
};
module.exports.tags = ["FusionCore"];
