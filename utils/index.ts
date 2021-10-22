import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

export const isValidChain = (
  chainIdList: string[],
  currentChainId: string
): Boolean => {
  if (
    chainIdList.filter((chainId) => chainId === currentChainId).length === 0
  ) {
    return false;
  }
  return true;
};

export const bridgeTokenBuilder = (
  name: string,
  symbol: string,
  decimals: number,
  chainIdList: string[]
): DeployFunction => {
  const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer, proxyAdmin } = await getNamedAccounts();

    const currentChainId = await hre.getChainId();

    if (!isValidChain(chainIdList, currentChainId)) return;

    await deploy(`BridgeToken${symbol}`, {
      contract: "BridgeToken",
      from: deployer,
      proxy: {
        owner: proxyAdmin,
        execute: {
          methodName: "initialize",
          args: [name, symbol, decimals],
        },
        proxyContract: "OpenZeppelinTransparentProxy",
      },
      skipIfAlreadyDeployed: true,
      log: true,
    });
  };
  func.tags = ["BridgeToken", `BridgeToken${symbol}`];
  return func;
};
