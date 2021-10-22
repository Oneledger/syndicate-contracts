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

import { getAccounts, getNodeUrl } from "./network";

dotenv.config();

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.getNamedAccounts();

  console.log(`===== Available accounts for "${hre.network.name}" =====`);
  Object.keys(accounts).forEach((key) => {
    console.log(key, "=", accounts[key]);
  });
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {
    frankenstein: {
      chainId: 4216137055,
      url: getNodeUrl("frankenstein"),
      accounts: getAccounts("frankenstein"),
      companionNetworks: {
        ropsten: "ropsten",
      },
      gasMultiplier: 1.1,
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
    bridgeTokenCosignerOwner: 3,
    bridgeRouterOwner: 4,
  },
};

export default config;
