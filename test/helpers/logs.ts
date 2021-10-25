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
  localChainId: BigNumber | null;
  targetChainId: BigNumber;
}

export const getBridgeRouterEnterLog = async (
  { token, exitor, amount, nonce, localChainId, targetChainId }: EnterData,
  commitment: boolean = false
): Promise<string> => {
  if (localChainId === null) {
    localChainId = BigNumber.from(await getChainId());
  }

  const log = ethers.utils.RLP.encode([
    "0x80",
    [BridgeRouterEnterEventSig, token, exitor],
    amount.toHexString(),
    ethers.utils.hexlify(nonce),
    targetChainId.toHexString(),
    localChainId.toHexString(),
  ]);
  if (commitment) {
    return keccak256(log);
  }
  return log;
};
