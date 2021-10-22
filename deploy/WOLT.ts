import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { isValidChain } from "../utils";
import { OneLedgerChains } from "../utils/chains";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const currentChainId = await hre.getChainId();

  if (!isValidChain(OneLedgerChains, currentChainId)) return;

  await deploy("WOLT", {
    contract: "WrappedToken",
    from: deployer,
    skipIfAlreadyDeployed: true,
    args: ["Wrapped OLT", "WOLT", 18],
    log: true,
  });
};
func.tags = ["WOLT"];

export default func;
