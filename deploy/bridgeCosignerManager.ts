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
  const { bridgeCosignerOwner } = await getNamedAccounts();

  await deploy("BridgeCosignerManager", {
    from: bridgeCosignerOwner,
    skipIfAlreadyDeployed: true,
    args: [],
    log: true,
  });
};
func.tags = ["BridgeCosignerManager"];

export default func;
