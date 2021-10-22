import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { bridgeTokenCosignerOwner } = await getNamedAccounts();

  await deploy("BridgeCosignerManager", {
    from: bridgeTokenCosignerOwner,
    skipIfAlreadyDeployed: true,
    args: [],
    log: true,
  });
};
func.tags = ["BridgeCosignerManager"];

export default func;
