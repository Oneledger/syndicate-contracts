import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { isValidChain } from "../utils";
import { SupportedChains } from "../utils/chains";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const currentChainId = await hre.getChainId();
  if (!isValidChain(SupportedChains, currentChainId)) return;

  await deploy("BridgeTokenManager", {
    from: deployer,
    skipIfAlreadyDeployed: true,
    args: [],
    log: true,
  });
};
func.tags = ["BridgeTokenManager"];

export default func;
