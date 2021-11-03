import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { DeploymentUpdateData } from "../src/constants";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  if (!DeploymentUpdateData[hre.network.name]) {
    console.log(`\x1b[31m Unsupported network "${hre.network.name}" \x1b[0m`);
    return;
  }

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
