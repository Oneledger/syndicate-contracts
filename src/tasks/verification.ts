import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { verifyDeploy } from "../verification/verifyLatestDeploy";

task(
  "verify-latest-deploy",
  "Verifies the source code of the latest contract deploy"
).setAction(async (args: any, hre: HardhatRuntimeEnvironment) => {
  if (!process.env.ETHERSCAN_API_KEY) {
    throw new Error("set ETHERSCAN_API_KEY");
  }
  await verifyDeploy(hre, process.env.ETHERSCAN_API_KEY);
});
