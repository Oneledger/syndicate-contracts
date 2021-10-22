import * as dotenv from "dotenv";

import { HardhatUserConfig } from "hardhat/config";
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

dotenv.config();

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {
    frankenstein: {
      url: process.env.FRANKENSTEIN_URL || "",
      accounts: [
        process.env.DEPLOYER_PK || "",
        process.env.PROXY_ADMIN_PK || "",
      ],
      companionNetworks: {
        ropsten: "ropsten",
      },
    },
    ropsten: {
      url: process.env.ROPSTEN_TESTNET_URL || "",
      accounts: [
        process.env.DEPLOYER_PK || "",
        process.env.PROXY_ADMIN_PK || "",
      ],
      companionNetworks: {
        ropsten: "frankenstein",
      },
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
    deployer: 0,
    proxyAdmin: 1,
  },
};

export default config;
