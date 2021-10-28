import { Contract } from "ethers";
import hre from "hardhat";

import { DeploymentCrossDomainUpdateData } from "./constants";

const checkOrAddBatch = async (
  bridgeCosignerManager: Contract,
  cosaddrs: string[],
  chainId: number
) => {
  console.log(
    `Cheking cosigner addresses "${cosaddrs}" for chain id "${chainId}"`
  );

  const existingCosigners = await bridgeCosignerManager.getCosigners(chainId);
  console.log(`Found added cosigners: "${existingCosigners || null}"`);
  const cosIntersection = cosaddrs
    .map((cosaddr) => cosaddr.toLowerCase())
    .filter((cosaddr) =>
      existingCosigners
        .map((eCosaddr) => eCosaddr.toLowerCase())
        .includes(cosaddr)
    );
  if (cosIntersection.length) {
    console.log("\x1b[33m One of cosigner already added, skipping...\x1b[0m");
    return;
  }

  console.log(
    `\x1b[33m Starting to add cosigner addresses "${cosaddrs}" for the chain id connection "${chainId}"...\x1b[0m`
  );
  const receipt = await bridgeCosignerManager
    .addCosignerBatch(cosaddrs, chainId)
    .then((tx) => tx.wait());
  console.log(
    `\x1b[32m Cosigner addresses "${cosaddrs}" added, using ${receipt.gasUsed} gas\x1b[0m`
  );
};

(async () => {
  const { bridgeCosignerOwner } = await hre.getNamedAccounts();
  const signer = await hre.ethers.getSigner(bridgeCosignerOwner);

  const enterNetwork = hre.network.name;

  if (!DeploymentCrossDomainUpdateData[enterNetwork]) {
    console.log(`\x1b[31m Unsupported network: ${enterNetwork} abort.\x1b[0m`);
    return;
  }

  const bridgeCosignerManager: Contract | null =
    await hre.ethers.getContractOrNull("BridgeCosignerManager", signer);
  if (!bridgeCosignerManager) {
    console.log(
      "\x1b[31m BridgeCosignerManager not deployed, skipping.\x1b[0m"
    );
    return;
  }

  const extNetworks = Object.keys(
    DeploymentCrossDomainUpdateData[enterNetwork]
  );

  for (const exitNetwork of extNetworks) {
    console.group(`\x1b[36m[${enterNetwork} -> ${exitNetwork}]\x1b[0m`);
    if (!hre.companionNetworks[exitNetwork]) {
      console.log(
        `\x1b[33m ${exitNetwork} companion network not found. skipping.\x1b[0m`
      );
      console.groupEnd();
      continue;
    }
    const chainId: string = await hre.companionNetworks[
      exitNetwork
    ].getChainId();
    const infoData = DeploymentCrossDomainUpdateData[enterNetwork][exitNetwork];
    await checkOrAddBatch(
      bridgeCosignerManager,
      infoData.cosaddrs,
      chainId as unknown as number
    );
    console.groupEnd();
  }
})();
