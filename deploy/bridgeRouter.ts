import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

import { DeploymentUpdateData } from "../scripts/constants";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  if (!DeploymentUpdateData[hre.network.name]) {
    console.log(`\x1b[31m Unsupported network "${hre.network.name}" \x1b[0m`);
    return;
  }

  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { bridgeRouterOwner, proxyAdmin } = await getNamedAccounts();

  const [bridgeCosignerManager, bridgeTokenManager, rTokenLib]: [
    Contract | null,
    Contract | null,
    Contract | null
  ] = await Promise.all([
    hre.ethers.getContractOrNull("BridgeCosignerManager"),
    hre.ethers.getContractOrNull("BridgeTokenManager"),
    hre.ethers.getContractOrNull("RToken"),
  ]);

  if (!bridgeCosignerManager || !bridgeTokenManager) {
    console.log(
      "\x1b[31m BridgeCosignerManager or BridgeTokenManager not deployed, abort.\x1b[0m"
    );
    return;
  }
  if (!rTokenLib) {
    console.log("\x1b[31m RToken library not deployed, abort.\x1b[0m");
    return;
  }
  await deploy("BridgeRouter", {
    from: bridgeRouterOwner,
    proxy: {
      owner: proxyAdmin,
      execute: {
        methodName: "initialize",
        args: [bridgeCosignerManager.address, bridgeTokenManager.address],
      },
      proxyContract: "OpenZeppelinTransparentProxy",
    },
    libraries: {
      RToken: rTokenLib.address,
    },
    skipIfAlreadyDeployed: true,
    log: true,
  });
};
func.tags = ["BridgeRouter"];
func.dependencies = ["BridgeCosignerManager", "BridgeTokenManager", "RToken"];

export default func;
