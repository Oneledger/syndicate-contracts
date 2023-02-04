import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { BridgeTokenManager } from "../../typechain";

task("revoke-token", "Revoke token from bridge")
  .addParam("token", "Token", "", undefined, true)
  .setAction(
    async (args: { token: string }, hre: HardhatRuntimeEnvironment) => {
      if (!args.token) {
        throw new Error("set token");
      }

      const { bridgeTokenManagerOwner } = await hre.getNamedAccounts();
      const signer = await hre.ethers.getSigner(bridgeTokenManagerOwner);

      const bridgeTokenManager: BridgeTokenManager | null =
        await hre.ethers.getContractOrNull("BridgeTokenManager", signer);

      if (!bridgeTokenManager) {
        console.log(
          "\x1b[31m BridgeTokenManager not deployed, skipping.\x1b[0m"
        );
        return;
      }

      console.log(
        `\x1b[33m Starting to revoke addresss "${args.token}"...\x1b[0m`
      );
      const receipt = await bridgeTokenManager
        .revoke(args.token)
        .then((tx) => tx.wait());
      console.log(
        `\x1b[32m Address "${args.token}" revoked, using ${receipt.gasUsed} gas\x1b[0m`
      );
    }
  );
