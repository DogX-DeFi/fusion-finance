module.exports = async ({ getNamedAccounts, deployments, network }) => {
    const { deployer } = await getNamedAccounts();
    const { deploy } = deployments;
    await deploy("DOGXUSD", {
      from: deployer,
      args: ["0x994A351AE962a0446777F5a26e28961fB1514d61"], 
      log: true,
      deterministicDeployment: false   
    });
    await deploy("DOGX", {
        from: deployer,
        args: ["0x994A351AE962a0446777F5a26e28961fB1514d61"], 
        log: true,
        deterministicDeployment: false   
      });
  };
  module.exports.tags = ["Token"];
  