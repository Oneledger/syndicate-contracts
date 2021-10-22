import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { DeploymentTokenListMap } from "../scripts/constants";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const currentChainId = await hre.getChainId();

  if (!DeploymentTokenListMap[currentChainId]) {
    console.log(`\x1b[31m Unsupported chain id "${currentChainId}" \x1b[0m`);
    return;
  }

  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer, proxyAdmin } = await getNamedAccounts();

  const tokeList = DeploymentTokenListMap[currentChainId];
  for (let i = 0; i < tokeList.length; i++) {
    const token = tokeList[i];

    await deploy(`BridgeToken${token.symbol}`, {
      contract: "BridgeToken",
      from: deployer,
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
