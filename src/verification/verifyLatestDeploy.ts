import { ParamType } from "ethers/lib/utils";
import { Deployment } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { verifyProxy } from "./verifyProxy";

interface ContractFile {
  address: string;
  args: string[];
  execute: object | null;
  libraries: object | undefined;
}

interface ContractDeploymentInfo {
  name: string;
  address: string;
  constructorArguments: any[] | undefined;
  isProxy: boolean;
  libraries: object | undefined;
}

const envError = (network: string) =>
  `pass --network tag to hardhat task (current network=${network})`;

// list of networks supported by Etherscan
const etherscanNetworks = [
  "ethereum",
  "kovan",
  "goerli",
  "ropsten",
  "rinkeby",
  "polygon",
];

/*
 * Generate link to Etherscan for an address on the given network
 * */
function etherscanLink(network: string, address: string) {
  if (network === "polygon") {
    return `https://polygonscan.com/address/${address}`;
  }

  const prefix =
    network === "mainnet" || network === "ethereum" ? "" : `${network}.`;

  return `https://${prefix}etherscan.io/address/${address}`;
}

function processDeployment(
  name: string,
  deployment: ContractFile
): ContractDeploymentInfo {
  return {
    name,
    address: deployment.address,
    constructorArguments: deployment.args,
    isProxy: deployment.execute !== null,
    libraries: deployment.libraries,
  };
}

async function getVerificationInputFromDeploys(hre: HardhatRuntimeEnvironment) {
  const deployments = await hre.deployments.all();
  return Object.keys(deployments).map((name) =>
    processDeployment(name, deployments[name] as unknown as ContractFile)
  );
}

/*
 * Parse the contract verification inputs
 * that were output by the given contract deploy
 * for the network that hardhat is configured to
 * and attempt to verify those contracts' source code on Etherscan
 * */
export async function verifyDeploy(
  hre: HardhatRuntimeEnvironment,
  etherscanKey: string
) {
  let network = hre.network.name;

  if (network === "mainnet") {
    network = "ethereum";
  }

  // assert that network from .env is supported by Etherscan
  if (!etherscanNetworks.includes(network)) {
    throw new Error(`Network not supported by Etherscan; ${envError(network)}`);
  }
  console.log(`VERIFY ${network}`);

  // get the JSON verification inputs for the given network
  // from the latest contract deploy; throw if not found
  const verificationInputs = await getVerificationInputFromDeploys(hre);

  // loop through each verification input for each contract in the file
  for (const verificationInput of verificationInputs) {
    // attempt to verify contract on etherscan
    // (await one-by-one so that Etherscan doesn't rate limit)
    await verifyContract(network, etherscanKey, verificationInput, hre);
  }
}

/*
 * Given one contract verification input,
 * attempt to verify the contracts' source code on Etherscan
 * */
async function verifyContract(
  network: string,
  etherscanKey: string,
  verificationInput: ContractDeploymentInfo,
  hre: any
) {
  const { name, address, constructorArguments, isProxy, libraries } =
    verificationInput;
  try {
    console.log(
      `   Attempt to verify ${name}   -  ${etherscanLink(
        network,
        address
      )} with constructor params: "${constructorArguments}", libraries: "${libraries}" (proxy: ${isProxy})`
    );
    try {
      await hre.run("verify:verify", {
        network,
        address,
        constructorArguments,
        libraries,
      });
      console.log(`   SUCCESS verifying ${name}`);
    } catch (e) {
      const errMsg = (e as Error).message;
      if (errMsg.includes("Contract source code already verified")) {
        console.log(`   SUCCESS already verified ${name}`);
      } else {
        console.log(`   FAILED verification ${name}`, errMsg);
      }
    }
    if (isProxy) {
      console.log(`   Attempt to verify as proxy`);
      await verifyProxy(network, address, etherscanKey);
      console.log(`   SUCCESS submitting proxy verification`);
    }
  } catch (e) {
    console.log(`   ERROR verifying ${name}`);
    console.error(e);
  }
  console.log("\n\n"); // add space after each attempt
}
