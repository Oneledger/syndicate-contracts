import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const OneLedgerChains = [
  "4216137055", // frankenstein
  "311752642", // oneldger
];

const isValidChain = (
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
func.dependencies = ["BridgeTokenManager"];

export default func;
