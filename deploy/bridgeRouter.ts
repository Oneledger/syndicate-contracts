import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

import { DeploymentUpdateData } from "../scripts/constants";
import { capitalizeFirstLetter } from "../scripts/utils";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  if (!DeploymentUpdateData[hre.network.name]) {
    console.log(`\x1b[31m Unsupported network "${hre.network.name}" \x1b[0m`);
    return;
  }

  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { bridgeRouterOwner, proxyAdmin } = await getNamedAccounts();

  const updateData = DeploymentUpdateData[hre.network.name];

  for (const bridgeName of updateData.bridgeNames) {
    const [bridgeCosignerManager, bridgeTokenManager]: [
      Contract | null,
      Contract | null
    ] = await Promise.all([
      hre.ethers.getContractOrNull(
        `BridgeCosignerManager${capitalizeFirstLetter(bridgeName)}`
      ),
      hre.ethers.getContractOrNull(
        `BridgeTokenManager${capitalizeFirstLetter(bridgeName)}`
      ),
    ]);

    if (!bridgeCosignerManager || !bridgeTokenManager) {
      console.log(
        "\x1b[31m BridgeCosignerManager or BridgeTokenManager not deployed, abort.\x1b[0m"
      );
      continue;
    }
    await deploy(`BridgeRouter${capitalizeFirstLetter(bridgeName)}`, {
      contract: "BridgeRouter",
      from: bridgeRouterOwner,
      proxy: {
        owner: proxyAdmin,
        execute: {
          methodName: "initialize",
          args: [
            capitalizeFirstLetter(bridgeName),
            bridgeCosignerManager.address,
            bridgeTokenManager.address,
          ],
        },
        proxyContract: "OpenZeppelinTransparentProxy",
      },
      skipIfAlreadyDeployed: true,
      log: true,
    });
  }
};
func.tags = ["BridgeProtocol"];
func.dependencies = ["BridgeCosignerManager", "BridgeTokenManager"];

export default func;
