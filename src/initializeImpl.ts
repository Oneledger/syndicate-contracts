import hre from "hardhat";

import { DeploymentUpdateData } from "./constants";

const initializeOrSkip = async (
  name: string,
  signer: string,
  params: Array<any>
): Promise<void> => {
  const contract = await hre.ethers.getContractOrNull(name, signer);
  if (!contract) {
    console.log(`\x1b[31m ${name} not deployed, skipping.\x1b[0m`);
    return;
  }

  try {
    await contract.callStatic.initialize(...params);
  } catch (e: any) {
    if (
      !e.error.message.includes(
        "execution reverted: Initializable: contract is already initialized"
      )
    ) {
      throw e;
    }
    console.log(
      `\x1b[33m ${name} "${contract.address}" already initialized \x1b[0m`
    );
    return;
  }
  console.log(
    `\x1b[33m Starting to impl initialization at address "${contract.address}" (${name}) with params "${params}"...\x1b[0m`
  );
  const receipt = await contract.initialize(...params).then((tx) => tx.wait());
  console.log(
    `\x1b[32m ${name} initialization renounced, using ${receipt.gasUsed} gas\x1b[0m`
  );
};

const renounceOrSkip = async (name: string, signer: string): Promise<void> => {
  const contract = await hre.ethers.getContractOrNull(name, signer);
  if (!contract) {
    console.log(`\x1b[31m ${name} not deployed, skipping.\x1b[0m`);
    return;
  }

  const bridgeOwner = await contract.callStatic.owner();

  if (hre.ethers.constants.AddressZero === bridgeOwner) {
    console.log(
      `\x1b[33m ${name} "${contract.address}" has already burned, skipping...\x1b[0m`
    );
    return;
  }
  console.log(
    `\x1b[33m Starting to renounce ownership at "${contract.address}" (${name})...\x1b[0m`
  );
  const receipt = await contract.renounceOwnership().then((tx) => tx.wait());
  console.log(
    `\x1b[32m ${name} ownership renounced, using ${receipt.gasUsed} gas\x1b[0m`
  );
};

(async () => {
  const { bridgeTokenOwner, bridgeRouterOwner } = await hre.getNamedAccounts();

  const enterNetwork = hre.network.name;

  if (!DeploymentUpdateData[enterNetwork]) {
    console.log(`\x1b[31m Unsupported network: ${enterNetwork} abort.\x1b[0m`);
    return;
  }
  const updateData = DeploymentUpdateData[enterNetwork];

  console.log(`\x1b[36m[bridge:${enterNetwork}]\x1b[0m`);

  await initializeOrSkip("BridgeRouter_Implementation", bridgeRouterOwner, [
    hre.ethers.constants.AddressZero,
    hre.ethers.constants.AddressZero,
  ]);
  await renounceOrSkip("BridgeRouter_Implementation", bridgeRouterOwner);

  for (const token of updateData.tokenList) {
    console.group(`\x1b[36m[token:${token.symbol}]\x1b[0m`);

    await initializeOrSkip(
      `BridgeToken${token.symbol}_Implementation`,
      bridgeTokenOwner,
      [token.name, token.symbol, token.decimals]
    );
    await renounceOrSkip(
      `BridgeToken${token.symbol}_Implementation`,
      bridgeTokenOwner
    );

    console.groupEnd();
  }
})();
