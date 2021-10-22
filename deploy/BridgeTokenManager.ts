import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { DeploymentUpdateData } from "../scripts/constants";
import { capitalizeFirstLetter } from "../scripts/utils";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  if (!DeploymentUpdateData[hre.network.name]) {
    console.log(`\x1b[31m Unsupported network "${hre.network.name}" \x1b[0m`);
    return;
  }

  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { bridgeTokenManagerOwner } = await getNamedAccounts();

  const updateData = DeploymentUpdateData[hre.network.name];

  for (const bridgeName of updateData.bridgeNames) {
    await deploy(`BridgeTokenManager${capitalizeFirstLetter(bridgeName)}`, {
      contract: "BridgeTokenManager",
      from: bridgeTokenManagerOwner,
      skipIfAlreadyDeployed: true,
      args: [],
      log: true,
    });
  }
};
func.tags = ["BridgeTokenManager"];

export default func;
