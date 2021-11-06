import { deployments, ethers, getChainId } from "hardhat";
import { expect } from "chai";

import { BridgeTokenManager } from "../typechain";

enum IssueType {
  DEFAULT,
  MINTABLE,
}

const setupTest = deployments.createFixture(
  async ({ deployments, getNamedAccounts, ethers }) => {
    await deployments.fixture(["BridgeTokenManager"]); // ensure you start from a fresh deployments
    const { bridgeTokenManagerOwner } = await getNamedAccounts();
    const bridgeTokenManager: BridgeTokenManager = await ethers.getContract(
      "BridgeTokenManager",
      bridgeTokenManagerOwner
    );
    const chainId = +(await getChainId());
    return {
      bridgeTokenManager,
      owner: bridgeTokenManagerOwner,
      chainId: chainId,
    };
  }
);

describe("BridgeTokenManager", () => {
  it("should issue tokens with specified criteries and it is ok", async () => {
    const { bridgeTokenManager, chainId: currentChainId } = await setupTest();

    const [token0, token1, token2, token3] = await ethers.getSigners();

    const tokenIssueTestCases = [
      {
        tokens: [ethers.constants.AddressZero, token0.address],
        issueTypes: [IssueType.DEFAULT, IssueType.MINTABLE],
        targetChainId: 3,
        errMsg: null,
      },
      {
        tokens: [token0.address, token1.address],
        issueTypes: [IssueType.MINTABLE, IssueType.DEFAULT],
        targetChainId: 43,
        errMsg: null,
      },
      {
        tokens: [token1.address, token0.address],
        issueTypes: [IssueType.MINTABLE, IssueType.DEFAULT],
        targetChainId: 5,
        errMsg: "BTM: SOURCE_EXIST",
      },
      {
        tokens: [token0.address, token2.address],
        issueTypes: [IssueType.MINTABLE, IssueType.DEFAULT],
        targetChainId: 10,
        errMsg: null,
      },
      {
        tokens: [ethers.constants.AddressZero, token2.address],
        issueTypes: [IssueType.DEFAULT, IssueType.MINTABLE],
        targetChainId: 10,
        errMsg: "BTM: SOURCE_EXIST",
      },
      {
        tokens: [token0.address, ethers.constants.AddressZero],
        issueTypes: [IssueType.MINTABLE, IssueType.DEFAULT],
        targetChainId: 43,
        errMsg: "BTM: TARGET_EXIST",
      },
      {
        tokens: [token3.address, ethers.constants.AddressZero],
        issueTypes: [IssueType.MINTABLE, IssueType.DEFAULT],
        targetChainId: currentChainId,
        errMsg: "BTM: SAME_CHAIN",
      },
      {
        tokens: [token3.address],
        issueTypes: [IssueType.MINTABLE, IssueType.DEFAULT],
        targetChainId: currentChainId,
        errMsg: "BTM: WRONG_LENGTH",
      },
      {
        tokens: [token3.address, ethers.constants.AddressZero],
        issueTypes: [IssueType.MINTABLE],
        targetChainId: currentChainId,
        errMsg: "BTM: WRONG_LENGTH",
      },
      {
        tokens: [token3.address],
        issueTypes: [IssueType.MINTABLE],
        targetChainId: currentChainId,
        errMsg: "BTM: MAX_SIZE",
      },
    ];

    for (const testCase of tokenIssueTestCases) {
      const { tokens, issueTypes, targetChainId, errMsg } = testCase;
      const tx = bridgeTokenManager.issue(tokens, issueTypes, targetChainId);
      if (errMsg === null) {
        await expect(tx)
          .to.emit(bridgeTokenManager, "TokenAdded")
          .withArgs(tokens[0], currentChainId);
        await expect(tx)
          .to.emit(bridgeTokenManager, "TokenAdded")
          .withArgs(tokens[1], targetChainId);

        const [localToken0, localToken1] = await Promise.all([
          bridgeTokenManager.getLocal(tokens[0], targetChainId),
          bridgeTokenManager.getLocal(tokens[1], currentChainId),
        ]);
        expect(localToken0).to.deep.equal(localToken1);
        expect(localToken0.addr).to.be.equal(tokens[0]);
        expect(localToken0.chainId).to.be.equal(currentChainId);
        expect(localToken0.issueType).to.be.equal(issueTypes[0]);
        expect(localToken0.exist).to.be.equal(true);
      } else {
        await expect(tx).to.be.revertedWith(errMsg);
      }
    }
  });

  it("should revoke tokens with specified criteries and it is ok", async () => {
    const { bridgeTokenManager, chainId: currentChainId } = await setupTest();

    const [token0, token1, token2, token3] = await ethers.getSigners();

    const tokenRevokeTestCases = [
      {
        tokens: [ethers.constants.AddressZero, token0.address],
        issueTypes: [IssueType.DEFAULT, IssueType.MINTABLE],
        targetChainId: 3,
        errMsg: null,
      },
      {
        tokens: [token0.address, token1.address],
        issueTypes: [IssueType.MINTABLE, IssueType.DEFAULT],
        targetChainId: 43,
        errMsg: null,
      },
      {
        tokens: [token0.address, token2.address],
        issueTypes: [IssueType.MINTABLE, IssueType.DEFAULT],
        targetChainId: 10,
        errMsg: null,
      },
      {
        tokens: [token3.address, ethers.constants.AddressZero],
        issueTypes: [IssueType.MINTABLE, IssueType.DEFAULT],
        targetChainId: 11,
        errMsg: null,
      },
    ];

    // issuing for test
    for (const testCase of tokenRevokeTestCases) {
      const { tokens, issueTypes, targetChainId } = testCase;
      await bridgeTokenManager
        .issue(tokens, issueTypes, targetChainId)
        .then((tx) => tx.wait());
    }

    // revoke
    for (const testCase of tokenRevokeTestCases) {
      const { tokens, targetChainId } = testCase;
      const tx = await bridgeTokenManager.revoke(tokens[1]);
      await expect(tx)
        .to.emit(bridgeTokenManager, "TokenRemoved")
        .withArgs(tokens[0], currentChainId);
      await expect(tx)
        .to.emit(bridgeTokenManager, "TokenRemoved")
        .withArgs(tokens[1], targetChainId);
    }

    // verify if revoked
    for (const testCase of tokenRevokeTestCases) {
      const { tokens } = testCase;
      const tx = bridgeTokenManager.revoke(tokens[1]);
      await expect(tx).to.be.revertedWith("BTM: NOT_EXIST");
    }
  });
});
