import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { DeploymentUpdateData } from "../scripts/constants";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  if (!DeploymentUpdateData[hre.network.name]) {
    console.log(`\x1b[31m Unsupported network "${hre.network.name}" \x1b[0m`);
    return;
  }

  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { bridgeTokenOwner, proxyAdmin } = await getNamedAccounts();

  const updateData = DeploymentUpdateData[hre.network.name];

  for (let i = 0; i < updateData.tokenList.length; i++) {
    const token = updateData.tokenList[i];

    await deploy(`BridgeToken${token.symbol}`, {
      contract: "BridgeToken",
      from: bridgeTokenOwner,
      proxy: {
        owner: proxyAdmin,
        execute: {
          methodName: "initialize",
          args: [token.name, token.symbol, token.decimals],
        },
        proxyContract: "OpenZeppelinTransparentProxy",
      },
      skipIfAlreadyDeployed: true,
      log: true,
    });
  }
};
func.tags = ["BridgeToken"];
func.dependencies = ["BridgeTokenManager"];
export default func;
