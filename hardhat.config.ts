import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import { removeConsoleLog } from "hardhat-preprocessor";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-web3";
import "@typechain/hardhat";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-deploy";
import "hardhat-contract-sizer";
import { ethers } from "ethers";

import { getAccounts, getNodeUrl } from "./network";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { verifyDeploy } from "./scripts/verification/verifyLatestDeploy";

dotenv.config();

task(
  "accounts",
  "Prints the list of accounts with balances",
  async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const accounts = await hre.getNamedAccounts();

    console.log(`===== Available accounts for "${hre.network.name}" =====`);
    const balances = await Promise.all(
      Object.keys(accounts).map((accKey) =>
        hre.web3.eth.getBalance(accounts[accKey])
      )
    ).then((result) => result);

    Object.keys(accounts).forEach((accKey, i) => {
      const address = accounts[accKey];
      console.log(
        `Key: "${accKey}", address: "${address}", balance: "${hre.ethers.utils.formatEther(
          balances[i]
        )}"`
      );
    });
  }
);

task(
  "verify-latest-deploy",
  "Verifies the source code of the latest contract deploy"
).setAction(async (args: any, hre: HardhatRuntimeEnvironment) => {
  if (!process.env.ETHERSCAN_API_KEY) {
    throw new Error("set ETHERSCAN_API_KEY");
  }
  await verifyDeploy(hre, process.env.ETHERSCAN_API_KEY);
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          evmVersion: "berlin",
        },
      },
      {
        version: "0.7.6",
      },
    ],
  },
  networks: {
    frankenstein: {
      chainId: 4216137055,
      url: getNodeUrl("frankenstein"),
      accounts: getAccounts("frankenstein"),
      companionNetworks: {
        ropsten: "ropsten",
      },
      loggingEnabled: true,
    },
    ropsten: {
      chainId: 3,
      url: getNodeUrl("ropsten"),
      accounts: getAccounts("ropsten"),
      companionNetworks: {
        frankenstein: "frankenstein",
      },
      loggingEnabled: true,
      gasMultiplier: 1.25,
      gasPrice: ethers.utils.parseUnits("40", "gwei").toNumber(),
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  preprocess: {
    eachLine: removeConsoleLog(
      (hre) =>
        hre.network.name !== "hardhat" && hre.network.name !== "localhost"
    ),
  },
  namedAccounts: {
    proxyAdmin: 0,
    bridgeTokenOwner: 1,
    bridgeTokenManagerOwner: 2,
    bridgeCosignerOwner: 3,
    bridgeRouterOwner: 4,
    libOwner: 5,
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: false,
    strict: true,
  },
};

export default config;
