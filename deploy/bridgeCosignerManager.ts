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
  const { bridgeTokenCosignerOwner } = await getNamedAccounts();

  const updateData = DeploymentUpdateData[hre.network.name];

  for (const bridgeName of updateData.bridgeNames) {
    await deploy(`BridgeCosignerManager${capitalizeFirstLetter(bridgeName)}`, {
      contract: "BridgeCosignerManager",
      from: bridgeTokenCosignerOwner,
      skipIfAlreadyDeployed: true,
      args: [],
      log: true,
    });
  }
};
func.tags = ["BridgeCosignerManager"];

export default func;
