import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

import { DeploymentUpdateData } from "../scripts/constants";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  if (!DeploymentUpdateData[hre.network.name]) {
    console.log(`\x1b[31m Unsupported networl "${hre.network.name}" \x1b[0m`);
    return;
  }

  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { bridgeRouterOwner, proxyAdmin } = await getNamedAccounts();

  const updateData = DeploymentUpdateData[hre.network.name];

  const [bridgeCosignerManager, bridgeTokenManager]: [
    Contract | null,
    Contract | null
  ] = await Promise.all([
    hre.ethers.getContractOrNull("BridgeCosignerManager"),
    hre.ethers.getContractOrNull("BridgeTokenManager"),
  ]);

  if (!bridgeCosignerManager || !bridgeTokenManager) {
    console.log(
      "\x1b[31m BridgeCosignerManager or BridgeTokenManager not deployed, abort.\x1b[0m"
    );
    return;
  }

  await deploy("BridgeRouter", {
    from: bridgeRouterOwner,
    proxy: {
      owner: proxyAdmin,
      execute: {
        methodName: "initialize",
        args: [
          updateData.bridge.name,
          bridgeCosignerManager.address,
          bridgeTokenManager.address,
        ],
      },
      proxyContract: "OpenZeppelinTransparentProxy",
    },
    skipIfAlreadyDeployed: true,
    log: true,
  });
};
func.tags = ["BridgeProtocol"];
func.dependencies = ["BridgeCosignerManager", "BridgeTokenManager"];

export default func;
