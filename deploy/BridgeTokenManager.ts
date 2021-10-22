import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { bridgeTokenManagerOwner } = await getNamedAccounts();

  await deploy("BridgeTokenManager", {
    from: bridgeTokenManagerOwner,
    skipIfAlreadyDeployed: true,
    args: [],
    log: true,
  });
};
func.tags = ["BridgeTokenManager"];

export default func;
