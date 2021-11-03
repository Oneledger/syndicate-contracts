import { Contract } from "ethers";
import hre from "hardhat";

import { DeploymentUpdateData } from "./constants";

(async () => {
  const { bridgeTokenOwner } = await hre.getNamedAccounts();
  const signer = await hre.ethers.getSigner(bridgeTokenOwner);

  const enterNetwork = hre.network.name;

  if (!DeploymentUpdateData[enterNetwork]) {
    console.log(`\x1b[31m Unsupported network: ${enterNetwork} abort.\x1b[0m`);
    return;
  }
  const updateData = DeploymentUpdateData[enterNetwork];

  const bridgeRouter: Contract | null = await hre.ethers.getContractOrNull(
    "BridgeRouter"
  );
  if (!bridgeRouter) {
    console.log(`\x1b[31m BridgeRouter not deployed, skipping.\x1b[0m`);
    return;
  }

  for (const token of updateData.tokenList) {
    console.group(`\x1b[36m[token:${token.symbol}]\x1b[0m`);
    const bridgeToken: Contract | null = await hre.ethers.getContractOrNull(
      `BridgeToken${token.symbol}`,
      signer
    );

    if (!bridgeToken) {
      console.log(
        `\x1b[31m BridgeToken${token.symbol} not deployed, skipping.\x1b[0m`
      );
      console.groupEnd();
      continue;
    }

    const bridgeOwner = await bridgeToken.callStatic.owner();

    if (bridgeOwner === bridgeRouter.address) {
      console.log(
        `\x1b[33m BridgeToken "${bridgeRouter.address}" has already ownership, skipping...\x1b[0m`
      );
      console.groupEnd();
      continue;
    }

    console.log(
      `\x1b[33m Starting to add bridge tokens ownership for ${bridgeRouter.address}...\x1b[0m`
    );
    const receipt = await bridgeToken
      .transferOwnership(bridgeRouter.address)
      .then((tx) => tx.wait());
    console.log(
      `\x1b[32m Bridge tokens ownership added, using ${receipt.gasUsed} gas\x1b[0m`
    );
    console.groupEnd();
  }
})();
