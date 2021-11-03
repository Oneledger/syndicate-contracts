import { Contract } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployment, DeploymentsExtension } from "hardhat-deploy/dist/types";
import { Provider } from "@ethersproject/abstract-provider";

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const getTokenByAddress = async (
  hre: HardhatRuntimeEnvironment,
  network: string,
  address: string
): Promise<Contract> => {
  const artifact = await hre.artifacts.readArtifact("BridgeToken");
  const provider = hre.ethers.getDefaultProvider(
    network
  ) as unknown as Provider;
  return new Contract(address, artifact.abi, provider);
};

export async function getContractAtDeployment(
  hre: HardhatRuntimeEnvironment,
  deployments: DeploymentsExtension,
  name: string
): Promise<Contract | null> {
  const depContr: Deployment | null = await deployments.getOrNull(name);
  if (!depContr) {
    return null;
  }
  return await hre.ethers.getContractAt(depContr.abi, depContr.address);
}
