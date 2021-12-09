import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { verifyDeploy } from "../verification/verifyLatestDeploy";

task(
  "verify-latest-deploy",
  "Verifies the source code of the latest contract deploy"
)
  .addParam(
    "apiKey",
    "Etherscan API key",
    process.env.ETHERSCAN_API_KEY || "",
    undefined,
    true
  )
  .setAction(
    async (args: { apiKey: string }, hre: HardhatRuntimeEnvironment) => {
      if (!args.apiKey) {
        throw new Error("set ETHERSCAN_API_KEY");
      }
      await verifyDeploy(hre, args.apiKey);
    }
  );
