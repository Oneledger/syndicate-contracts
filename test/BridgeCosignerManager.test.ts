import { deployments, ethers, getChainId, web3 } from "hardhat";
import { expect } from "chai";

import { BridgeCosignerManager } from "../typechain";
import { getBridgeRouterEnterLog } from "./helpers";
import { ContractReceipt } from "ethers";

const setupTest = deployments.createFixture(
  async ({ deployments, getNamedAccounts, ethers }) => {
    await deployments.fixture(["BridgeCosignerManager"]); // ensure you start from a fresh deployments
    const { bridgeCosignerOwner } = await getNamedAccounts();
    const bridgeCosignerManager: BridgeCosignerManager =
      await ethers.getContract("BridgeCosignerManager", bridgeCosignerOwner);
    const chainId = (await getChainId()) as unknown as number;
    return {
      bridgeCosignerManager,
      owner: bridgeCosignerOwner,
      chainId: chainId,
    };
  }
);

describe("BridgeCosignerManager", () => {
  it("should add cosigners with specified criteries and it is ok", async () => {
    const { bridgeCosignerManager, chainId: currentChainId } =
      await setupTest();

    const [cosigner0, cosigner1, cosigner2, cosigner3, cosigner4, cosigner5] =
      await ethers.getSigners();

    const cosignerTestCases = [
      {
        cossaddr: cosigner0.address,
        chainId: 3,
        errMsg: null,
      },
      {
        cossaddr: cosigner1.address,
        chainId: 5,
        errMsg: null,
      },
      {
        cossaddr: cosigner2.address,
        chainId: 5,
        errMsg: null,
      },
      {
        cossaddr: cosigner1.address,
        chainId: 10,
        errMsg: "BCM: ALREADY_EXIST",
        result: null,
      },
      {
        cossaddr: cosigner3.address,
        chainId: 13,
        errMsg: null,
      },
      {
        cossaddr: cosigner4.address,
        chainId: 13,
        errMsg: null,
      },
      {
        cossaddr: ethers.constants.AddressZero,
        chainId: 1,
        errMsg: "BCM: ZERO_ADDRESS",
      },
      {
        cossaddr: cosigner5.address,
        chainId: currentChainId,
        errMsg: "BCM: ONLY_EXTERNAL",
      },
    ];
    for (const testCase of cosignerTestCases) {
      const { cossaddr, chainId, errMsg } = testCase;
      const tx = bridgeCosignerManager.addCosigner(cossaddr, chainId);
      if (errMsg === null) {
        await expect(tx)
          .to.emit(bridgeCosignerManager, "CosignerAdded")
          .withArgs(cossaddr, chainId);
      } else {
        await expect(tx).to.be.revertedWith(errMsg);
      }
    }
  });
  it("should add cosigners per batch with specified criteries and it is ok", async () => {
    const { bridgeCosignerManager, chainId: currentChainId } =
      await setupTest();

    const [
      cosigner0,
      cosigner1,
      cosigner2,
      cosigner3,
      cosigner4,
      cosigner5,
      cosigner6,
    ] = await ethers.getSigners();

    const cosignerTestCases = [
      {
        cossaddrs: [cosigner0.address, cosigner1.address, cosigner2.address],
        chainId: 3,
        errMsg: null,
      },
      {
        cossaddrs: [cosigner3.address, cosigner4.address, cosigner5.address],
        chainId: 54,
        errMsg: null,
      },
      {
        cossaddrs: [ethers.constants.AddressZero],
        chainId: 13,
        errMsg: "BCM: ZERO_ADDRESS",
      },
      {
        cossaddrs: [],
        chainId: 135,
        errMsg: "BCM: EMPTY_BATCH",
      },
      {
        cossaddrs: [cosigner3.address],
        chainId: 34,
        errMsg: "BCM: ALREADY_EXIST",
      },
      {
        cossaddrs: [cosigner6.address],
        chainId: currentChainId,
        errMsg: "BCM: ONLY_EXTERNAL",
      },
    ];
    for (const testCase of cosignerTestCases) {
      const { cossaddrs, chainId, errMsg } = testCase;
      const tx = bridgeCosignerManager.addCosignerBatch(cossaddrs, chainId);
      if (errMsg === null) {
        for (const cossaddr of cossaddrs) {
          await expect(tx)
            .to.emit(bridgeCosignerManager, "CosignerAdded")
            .withArgs(cossaddr, chainId);
        }
      } else {
        await expect(tx).to.be.revertedWith(errMsg);
      }
    }
  });
  it("should remove cosigners with specified criteries and it is ok", async () => {
    const { bridgeCosignerManager } = await setupTest();

    const [cosigner0, cosigner1, cosigner2, cosigner3] =
      await ethers.getSigners();
    const cosignerTestCases = [
      {
        cossaddr: cosigner0.address,
        chainId: 3,
        errMsg: null,
      },
      {
        cossaddr: cosigner1.address,
        chainId: 5,
        errMsg: null,
      },
      {
        cossaddr: cosigner2.address,
        chainId: 5,
        errMsg: null,
      },
      {
        cossaddr: cosigner3.address,
        chainId: 11,
        errMsg: "BCM: NOT_EXIST",
      },
      {
        cossaddr: ethers.constants.AddressZero,
        chainId: 5,
        errMsg: "BCM: ZERO_ADDRESS",
      },
    ];

    const countMap = {};

    // fill
    for (const testCase of cosignerTestCases) {
      const { cossaddr, chainId, errMsg } = testCase;
      if (!errMsg) {
        const tx = bridgeCosignerManager.addCosigner(cossaddr, chainId);
        await expect(tx)
          .to.emit(bridgeCosignerManager, "CosignerAdded")
          .withArgs(cossaddr, chainId);
        if (!countMap[chainId]) {
          countMap[chainId] = 0;
        }
        countMap[chainId]++;
      }
    }

    for (const testCase of cosignerTestCases) {
      const { cossaddr, chainId, errMsg } = testCase;
      if (errMsg === null) {
        let cosigners = await bridgeCosignerManager.getCosigners(chainId);
        expect(cosigners.length).to.be.equal(countMap[chainId]);
        expect(cosigners).to.include(cossaddr);

        const tx = bridgeCosignerManager.removeCosigner(cossaddr);
        await expect(tx)
          .to.emit(bridgeCosignerManager, "CosignerRemoved")
          .withArgs(cossaddr, chainId);

        cosigners = await bridgeCosignerManager.getCosigners(chainId);
        countMap[chainId]--;
        expect(cosigners.length).to.be.equal(countMap[chainId]);
        expect(cosigners).to.not.include(cossaddr);
      } else {
        const tx = bridgeCosignerManager.removeCosigner(cossaddr);
        await expect(tx).to.be.revertedWith(errMsg);
      }
    }
  });
  // it("should remove cosigners per batch with specified criteries and it is ok", async () => { });
  it("should verify with specified criteries and it is ok", async () => {
    const { bridgeCosignerManager } = await setupTest();

    const [cosigner0, cosigner1, cosigner2, token0, exitor0] =
      await ethers.getSigners();

    // init data
    const extChainId = ethers.BigNumber.from(5);
    const commitment = await getBridgeRouterEnterLog(
      {
        token: token0.address,
        exitor: exitor0.address,
        amount: ethers.BigNumber.from("10"),
        nonce: 0,
        localChainId: null,
        targetChainId: extChainId,
      },
      true
    );

    const initCosigners = [
      {
        cossaddr: cosigner0.address,
        chainId: extChainId,
      },
      {
        cossaddr: cosigner1.address,
        chainId: extChainId,
      },
      {
        cossaddr: cosigner2.address,
        chainId: extChainId,
      },
    ];

    const cosFutures: Array<Promise<ContractReceipt>> = [];

    // fill
    for (const testCase of initCosigners) {
      const { cossaddr, chainId } = testCase;
      cosFutures.push(
        bridgeCosignerManager
          .addCosigner(cossaddr, chainId)
          .then((tx) => tx.wait())
      );
    }
    await Promise.all(cosFutures);

    const verifyTestCases = [
      // standart scenario
      {
        cosaddrs: [cosigner0.address, cosigner1.address, cosigner2.address],
        chainId: extChainId,
        result: true,
      },
      // 2 signers, still ok
      {
        cosaddrs: [cosigner0.address, cosigner1.address],
        chainId: extChainId,
        result: true,
      },
      // 1 signer, not enough
      {
        cosaddrs: [cosigner0.address],
        chainId: extChainId,
        result: false,
      },
      // in case double owner but still ok as 2 sigs
      {
        cosaddrs: [cosigner0.address, cosigner0.address, cosigner2.address],
        chainId: extChainId,
        result: true,
      },
      // defacto one sig multiplied 3 times, not verified as 2 required from different account
      {
        cosaddrs: [cosigner0.address, cosigner0.address, cosigner0.address],
        chainId: extChainId,
        result: false,
      },
      // signers ok, but wrong chain id, will not be verified
      {
        cosaddrs: [cosigner0.address, cosigner1.address, cosigner2.address],
        chainId: 1,
        result: false,
      },
    ];

    for (const testCase of verifyTestCases) {
      const { cosaddrs, chainId, result } = testCase;
      const signatures = await Promise.all(
        cosaddrs.map((cosaddr) => web3.eth.sign(commitment, cosaddr))
      ).then((result) => result);

      const isVerified = await bridgeCosignerManager.verify(
        commitment,
        chainId,
        signatures
      );
      expect(isVerified).to.be.equal(result);
    }
  });
});
