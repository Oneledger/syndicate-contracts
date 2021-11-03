import "../type-extensions";

import { promises as fs } from "fs";
import path from "path";

import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { DeploymentCrossDomainUpdateData } from "../constants";
import { getContractAtDeployment, getTokenByAddress } from "../utils";
import { Contract } from "ethers";

interface BridgeInfo {
  tokenAddress: string;
  originBridgeAddress: string;
  destBridgeAddress: string;
}

interface TokenInfo {
  address: string;
  name: string;
  decimals: number;
  symbol: string;
  extensions: {
    bridgeInfo: {
      [chainId: string]: BridgeInfo;
    };
  };
}

const TASK_GENERATE_TOKENS_LIST = "generate-tokens-list";

task(TASK_GENERATE_TOKENS_LIST).setAction(
  async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const tokenData: { [address: string]: TokenInfo } = {};

    const enterNetwork = hre.network.name;

    if (!DeploymentCrossDomainUpdateData[enterNetwork]) {
      console.log(
        `\x1b[31m Unsupported network: ${enterNetwork} abort.\x1b[0m`
      );
      return;
    }

    const enterBridgeRouter: Contract | null =
      await hre.ethers.getContractOrNull("BridgeRouter");
    if (!enterBridgeRouter) {
      console.log(
        `\x1b[31m Source BridgeRouter not deployed, skipping.\x1b[0m`
      );
      return;
    }

    const networkData = DeploymentCrossDomainUpdateData[enterNetwork];

    for (const exitNetwork of Object.keys(networkData)) {
      if (!hre.companionNetworks[exitNetwork]) {
        console.log(`\x1b[31m Companion network not found, skipping.\x1b[0m`);
        continue;
      }
      const exitBridgeRouter: Contract | null = await getContractAtDeployment(
        hre,
        hre.companionNetworks[exitNetwork].deployments,
        "BridgeRouter"
      );
      if (!exitBridgeRouter) {
        console.log(
          `\x1b[31m Target BridgeRouter not deployed, skipping.\x1b[0m`
        );
        continue;
      }
      for (const tokenLink of networkData[exitNetwork].tokenLinks) {
        let tokenFrom: Contract | null;
        if (tokenLink.fromNameOrAddress === hre.ethers.constants.AddressZero) {
          continue;
        } else if (hre.ethers.utils.isAddress(tokenLink.fromNameOrAddress)) {
          tokenFrom = await getTokenByAddress(
            hre,
            enterNetwork,
            tokenLink.fromNameOrAddress
          );
        } else {
          tokenFrom = await getContractAtDeployment(
            hre,
            hre.deployments,
            tokenLink.fromNameOrAddress
          );
        }
        if (!tokenFrom) {
          console.log(
            `\x1b[33m ${tokenLink.fromNameOrAddress} contract not found. skipping.\x1b[0m`
          );
          continue;
        }
        if (!tokenData[tokenFrom.address]) {
          const [name, symbol, decimals] = await Promise.all([
            tokenFrom.callStatic.name(),
            tokenFrom.callStatic.symbol(),
            tokenFrom.callStatic.decimals(),
          ]);
          tokenData[tokenFrom.address] = {
            address: tokenFrom.address,
            name,
            symbol,
            decimals,
            extensions: {
              bridgeInfo: {},
            },
          };
        }
        const bridgeInfo = tokenData[tokenFrom.address].extensions.bridgeInfo;
        const chainId = hre.config.networks[exitNetwork]
          .chainId as unknown as string;
        if (!chainId) {
          continue;
        }
        let toAddress = tokenLink.toNameOrAddress;
        if (!hre.ethers.utils.isAddress(toAddress)) {
          const bridgeTokenTo: Contract | null = await getContractAtDeployment(
            hre,
            hre.companionNetworks[exitNetwork].deployments,
            toAddress
          );
          if (!bridgeTokenTo) {
            console.log(
              `\x1b[33m ${toAddress} contract not found. skipping.\x1b[0m`
            );
            continue;
          }
          toAddress = bridgeTokenTo.address;
        }
        bridgeInfo[chainId] = {
          tokenAddress: toAddress,
          originBridgeAddress: enterBridgeRouter.address,
          destBridgeAddress: exitBridgeRouter.address,
        };
      }
    }

    const tokenDataList: Array<TokenInfo> = [];
    Object.keys(tokenData).forEach((address) => {
      tokenDataList.push(tokenData[address]);
    });
    await fs.writeFile(
      path.join(hre.config.paths.tokenList, `src/${enterNetwork}.tokens.json`),
      JSON.stringify(tokenDataList, null, 2),
      "utf8"
    );
  }
);
