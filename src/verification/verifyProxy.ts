import axios from "axios";
import { etherscanApiLink } from "./verifyLatestDeploy";

export async function verifyProxy(
  network: string,
  address: string,
  etherscanKey: string
) {
  console.log(`   Submit ${address} for proxy verification on ${network}`);
  // Submit contract for verification
  const verifyResponse = await axios.post(
    etherscanApiLink(network),
    `address=${address}`,
    {
      params: {
        module: "contract",
        action: "verifyproxycontract",
        apikey: etherscanKey,
      },
    }
  );

  // Validate that submission worked
  if (verifyResponse.status !== 200) {
    throw new Error("Verify POST failed");
  } else if (verifyResponse.data.status !== "1") {
    throw new Error(verifyResponse.data.result);
  }

  console.log(`   Submitted.`);
}
