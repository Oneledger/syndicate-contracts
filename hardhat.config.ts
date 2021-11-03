import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import { removeConsoleLog } from "hardhat-preprocessor";
import "hardhat/types/runtime";
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

import "./src/tasks";

dotenv.config();

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
    oneledger: {
      chainId: 311752642,
      url: getNodeUrl("oneledger"),
      accounts: getAccounts("oneledger"),
      companionNetworks: {
        ethereum: "ethereum",
      },
      loggingEnabled: true,
    },
    ethereum: {
      chainId: 1,
      url: getNodeUrl("ethereum"),
      accounts: getAccounts("ethereum"),
      companionNetworks: {
        oneledger: "oneledger",
      },
      loggingEnabled: true,
      gasMultiplier: 1.25,
    },
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
      // throwOnCallFailures
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
  paths: {
    deploy: "deploy",
    deployments: "../syndicate-deployments",
    imports: "imports",
    tokenList: "../syndicate-token-list",
  },
};

export default config;
