import { BridgeRouterEnterEventSig } from "./constants";
import { ethers, getChainId } from "hardhat";
import { keccak256 } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import { Address } from "hardhat-deploy/dist/types";

interface EnterData {
  token: Address;
  exitor: Address;
  amount: BigNumber;
  nonce: number;
  targetChainId: BigNumber;
}

export const getBridgeRouterEnterLogCommitment = async (
  { token, exitor, amount, nonce, targetChainId }: EnterData,
  commitment: boolean = false
): Promise<string> => {
  const chainId = BigNumber.from(await getChainId());

  const log = ethers.utils.RLP.encode([
    "0x80",
    [BridgeRouterEnterEventSig, token, exitor],
    amount.toHexString(),
    ethers.utils.hexlify(nonce),
    chainId.toHexString(),
    targetChainId.toHexString(),
  ]);
  if (commitment) {
    return keccak256(log);
  }
  return log;
};
