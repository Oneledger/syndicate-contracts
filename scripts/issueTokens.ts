import { Contract } from "ethers";
import hre from "hardhat";
import { Deployment, DeploymentsExtension } from "hardhat-deploy/dist/types";

import { DeploymentCrossDomainUpdateData } from "./constants";

interface Token {
  addr: string;
  exist: boolean;
  issueType: number;
  chainId: number;
}

const getBridgeToken = async (
  network: string,
  nameOrAddress: string
): Promise<Token | null> => {
  let chainId: string = await hre.getChainId();
  let deployments: DeploymentsExtension = hre.deployments;
  if (hre.network.name !== network) {
    deployments = hre.companionNetworks[network].deployments;
    chainId = await hre.companionNetworks[network].getChainId();
  }
  if (!hre.ethers.utils.isAddress(nameOrAddress)) {
    console.log(
      `Getting address for contract "${nameOrAddress}" and network "${network}"`
    );

    const contract: Deployment | null = await deployments.getOrNull(
      nameOrAddress
    );
    if (!contract) {
      console.log(
        `\x1b[33m ${nameOrAddress} deployment not found. skipping.\x1b[0m`
      );
      return null;
    }
    const bridgeToken: Contract | null = await hre.ethers.getContractAt(
      contract.abi,
      contract.address
    );
    if (!bridgeToken) {
      console.log(
        `\x1b[33m ${nameOrAddress} contract not found. skipping.\x1b[0m`
      );
      return null;
    }
    console.log(
      `Address for contract "${bridgeToken.address}" and network "${network}" has been loaded, continue`
    );
    return {
      addr: bridgeToken.address,
      exist: false,
      issueType: 1,
      chainId: chainId as unknown as number,
    };
  }
  console.log(
    `Address for contract "${nameOrAddress}" and network "${network}" has been loaded, continue`
  );
  return {
    addr: nameOrAddress,
    exist: false,
    issueType: 0,
    chainId: chainId as unknown as number,
  };
};

const checkOrCreate = async (
  bridgeTokenManager: Contract,
  enterToken: Token,
  exitToken: Token
) => {
  console.log(
    `Cheking addr in manager "${exitToken.addr}" for chain id "${exitToken.chainId}"`
  );
  const { ok }: { ok: boolean } = await bridgeTokenManager.getLocal(
    exitToken.addr,
    enterToken.chainId
  );
  if (ok) {
    console.log("\x1b[33m Token already issued, skipping...\x1b[0m");
    return;
  }

  console.log(
    `\x1b[33m Starting to issue token for link "${enterToken.addr}" <-> "${exitToken.addr}" for network "${hre.network.name}"...\x1b[0m`
  );
  const receipt = await bridgeTokenManager
    .issue(
      [enterToken.addr, exitToken.addr],
      [enterToken.issueType, exitToken.issueType],
      exitToken.chainId
    )
    .then((tx) => tx.wait());
  console.log(
    `\x1b[32m Link "${enterToken.addr}" <-> "${exitToken.addr}" created using ${receipt.gasUsed} gas\x1b[0m`
  );
};

(async () => {
  const { bridgeTokenManagerOwner } = await hre.getNamedAccounts();
  const signer = await hre.ethers.getSigner(bridgeTokenManagerOwner);
  const enterNetwork = hre.network.name;

  if (!(enterNetwork in DeploymentCrossDomainUpdateData)) {
    console.log(`\x1b[31m Unsupported network: ${enterNetwork} abort.\x1b[0m`);
    return;
  }

  const bridgeTokenManager: Contract | null =
    await hre.ethers.getContractOrNull("BridgeTokenManager", signer);

  if (!bridgeTokenManager) {
    console.log("\x1b[31m BridgeTokenManager not deployed, skipping.\x1b[0m");
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
    const infoData = DeploymentCrossDomainUpdateData[enterNetwork][exitNetwork];

    const tokenLinks = infoData.tokenLinks;
    for (const token of tokenLinks) {
      console.group(`\x1b[36m[token:${token.name}]\x1b[0m`);
      const [enterToken, exitToken] = await Promise.all([
        getBridgeToken(enterNetwork, token.fromNameOrAddress),
        getBridgeToken(exitNetwork, token.toNameOrAddress),
      ]);
      if (enterToken && exitToken) {
        await checkOrCreate(bridgeTokenManager, enterToken, exitToken);
      }
      console.groupEnd();
    }
    console.groupEnd();
  }
})();
