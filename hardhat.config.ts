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
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          evmVersion: "berlin",
        },
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
        bsc: "bsc",
        polygon: "polygon",
        okc: "okc",
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
      gasPrice: ethers.utils.parseUnits("60", "gwei").toNumber(),
    },
    bsc: {
      chainId: 56,
      url: getNodeUrl("bsc"),
      accounts: getAccounts("bsc"),
      companionNetworks: {
        oneledger: "oneledger",
      },
      loggingEnabled: true,
    },
    polygon: {
      chainId: 137,
      url: getNodeUrl("polygon"),
      accounts: getAccounts("polygon"),
      companionNetworks: {
        oneledger: "oneledger",
      },
      loggingEnabled: true,
    },
    okc: {
      chainId: 66,
      url: getNodeUrl("okc"),
      accounts: getAccounts("okc"),
      companionNetworks: {
        oneledger: "oneledger",
      },
      loggingEnabled: true,
    },
    frankenstein: {
      chainId: 4216137055,
      url: getNodeUrl("frankenstein"),
      accounts: getAccounts("frankenstein"),
      companionNetworks: {
        ropsten: "ropsten",
        bsc_testnet: "bsc_testnet",
        mumbai: "mumbai",
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
    bsc_testnet: {
      chainId: 97,
      url: getNodeUrl("bsc_testnet"),
      accounts: getAccounts("bsc_testnet"),
      companionNetworks: {
        frankenstein: "frankenstein",
      },
      loggingEnabled: true,
    },
    mumbai: {
      chainId: 80001,
      url: getNodeUrl("mumbai"),
      accounts: getAccounts("mumbai"),
      companionNetworks: {
        frankenstein: "frankenstein",
      },
      loggingEnabled: true,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
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
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: false,
    strict: true,
  },
  paths: {
    deploy: "deploy",
    deployments: "deployments",
    imports: "imports",
    tokenList: "../syndicate-token-list",
  },
};

export default config;
