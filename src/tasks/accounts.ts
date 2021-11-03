import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("accounts", "Prints the list of accounts with balances").setAction(
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
