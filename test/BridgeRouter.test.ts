import { deployments, ethers, getChainId, web3 } from "hardhat";
import { expect } from "chai";

import {
  BridgeRouter,
  BridgeToken,
  BridgeTokenManager,
  BridgeCosignerManager,
} from "../typechain";
import { getBridgeRouterEnterLog } from "./helpers";
import { BigNumber, ContractTransaction, Signer } from "ethers";
import { keccak256 } from "ethers/lib/utils";

const getTxFee = async (
  tx: Promise<ContractTransaction>
): Promise<BigNumber> => {
  const receipt = await (await tx).wait();
  const txResponse = await ethers.provider.getTransaction(
    receipt.transactionHash
  );
  const gasPrice = txResponse.gasPrice || BigNumber.from(0);
  return gasPrice.mul(receipt.gasUsed);
};

const setupTest = deployments.createFixture(
  async ({ deployments, getNamedAccounts, ethers }) => {
    await deployments.fixture(["BridgeRouter", "BridgeToken"]); // ensure you start from a fresh deployments
    const {
      bridgeRouterOwner,
      bridgeTokenOwner,
      bridgeTokenManagerOwner,
      bridgeCosignerOwner,
    } = await getNamedAccounts();
    const bridgeRouter: BridgeRouter = await ethers.getContract(
      "BridgeRouter",
      bridgeRouterOwner
    );
    const targetChainId = 5;
    const bridgeTokenManager: BridgeTokenManager = await ethers.getContract(
      "BridgeTokenManager",
      bridgeTokenManagerOwner
    );
    const bridgeCosignerManager: BridgeCosignerManager =
      await ethers.getContract("BridgeCosignerManager", bridgeCosignerOwner);

    const tokens = await Promise.all([
      ethers.getContract("BridgeTokenOLT", bridgeTokenOwner),
      ethers.getContract("BridgeTokenlnmETH", bridgeTokenOwner),
      ethers.getContract("BridgeTokenlmETH", bridgeTokenOwner),
      ethers.getContract("BridgeTokenrnmETH", bridgeTokenOwner),
      ethers.getContract("BridgeTokenrmETH", bridgeTokenOwner),
    ]).then((contracts) => contracts as unknown as Array<BridgeToken>);

    const [OLT, lnmETH, lmETH, rnmETH, rmETH] = tokens;

    // initial issue
    await bridgeTokenManager
      .issue([ethers.constants.AddressZero, OLT.address], [0, 1], targetChainId)
      .then((tx) => tx.wait());
    await bridgeTokenManager
      .issue([lnmETH.address, rmETH.address], [0, 1], targetChainId)
      .then((tx) => tx.wait());
    await bridgeTokenManager
      .issue([lmETH.address, rnmETH.address], [1, 0], targetChainId)
      .then((tx) => tx.wait());

    // mint some initial token
    const bridgeTokens: { [address: string]: BridgeToken } = {};
    const erc20Tokens: { [name: string]: BridgeToken } = {};
    for (const token of tokens) {
      await token
        .mint(bridgeRouterOwner, ethers.utils.parseEther("1000"))
        .then((tx) => tx.wait());

      bridgeTokens[token.address] = token;
      const symbol = await token.callStatic.symbol();
      erc20Tokens[symbol] = token;
    }

    const chainId = (await getChainId()) as unknown as number;
    return {
      bridgeTokens,
      bridgeRouter,
      erc20Tokens,
      bridgeTokenManager,
      bridgeCosignerManager,
      ownerSigner: ethers.provider.getSigner(
        bridgeRouterOwner
      ) as unknown as Signer,
      currentChainId: chainId,
      targetChainId: targetChainId,
    };
  }
);

const setUpTestForEnter = deployments.createFixture(
  async ({ ethers, getNamedAccounts }) => {
    const testData = await setupTest();

    const [
      exitorWithBalance0,
      exitorWithBalance1,
      exitorWithBalanceNoAllowance0,
    ] = await ethers.getSigners();

    const { bridgeTokenOwner } = await getNamedAccounts();
    const mintSigner = ethers.provider.getSigner(
      bridgeTokenOwner
    ) as unknown as Signer;

    // fill wallets with amount and add alowance
    await Promise.all([
      testData.erc20Tokens.lmETH
        .connect(mintSigner)
        .mint(exitorWithBalance0.address, ethers.utils.parseEther("10"))
        .then((tx) => tx.wait()),
      testData.erc20Tokens.lnmETH
        .connect(testData.ownerSigner)
        .transfer(exitorWithBalance0.address, ethers.utils.parseEther("10"))
        .then((tx) => tx.wait()),
      testData.erc20Tokens.lnmETH
        .connect(exitorWithBalance0)
        .approve(testData.bridgeRouter.address, ethers.utils.parseEther("10"))
        .then((tx) => tx.wait()),
      testData.erc20Tokens.lmETH
        .connect(mintSigner)
        .mint(exitorWithBalance1.address, ethers.utils.parseEther("10"))
        .then((tx) => tx.wait()),
      testData.erc20Tokens.lnmETH
        .connect(testData.ownerSigner)
        .transfer(exitorWithBalance1.address, ethers.utils.parseEther("10"))
        .then((tx) => tx.wait()),
      testData.erc20Tokens.lnmETH
        .connect(exitorWithBalance1)
        .approve(testData.bridgeRouter.address, ethers.utils.parseEther("10"))
        .then((tx) => tx.wait()),
      testData.erc20Tokens.lmETH
        .connect(mintSigner)
        .mint(
          exitorWithBalanceNoAllowance0.address,
          ethers.utils.parseEther("10")
        )
        .then((tx) => tx.wait()),
      testData.erc20Tokens.lnmETH
        .connect(testData.ownerSigner)
        .transfer(
          exitorWithBalanceNoAllowance0.address,
          ethers.utils.parseEther("10")
        )
        .then((tx) => tx.wait()),
    ]);

    // assign bridge as minter owner for all tokens
    await Promise.all(
      Object.keys(testData.erc20Tokens).map((name) =>
        testData.erc20Tokens[name]
          .connect(mintSigner)
          .transferOwnership(testData.bridgeRouter.address)
          .then((tx) => tx.wait())
      )
    );
    return testData;
  }
);

const setUpTestForExit = deployments.createFixture(
  async ({ ethers, getNamedAccounts }) => {
    const testData = await setupTest();

    const { bridgeTokenOwner } = await getNamedAccounts();
    const [cosigner0, cosigner1, cosigner2] = await ethers.getSigners();

    const cosaddrs = [cosigner0.address, cosigner1.address, cosigner2.address];
    // add cosigners
    await testData.bridgeCosignerManager
      .addCosignerBatch(cosaddrs, testData.targetChainId)
      .then((tx) => tx.wait());

    // add some tokens to bridge
    const mintSigner = ethers.provider.getSigner(
      bridgeTokenOwner
    ) as unknown as Signer;
    await Promise.all(
      Object.keys(testData.erc20Tokens).map((name) =>
        testData.erc20Tokens[name]
          .connect(mintSigner)
          .mint(testData.bridgeRouter.address, ethers.utils.parseEther("100"))
          .then((tx) => tx.wait())
      )
    );
    await Promise.all(
      Object.keys(testData.erc20Tokens).map((name) =>
        testData.erc20Tokens[name]
          .connect(mintSigner)
          .transferOwnership(testData.bridgeRouter.address)
          .then((tx) => tx.wait())
      )
    );
    await cosigner0.sendTransaction({
      to: testData.bridgeRouter.address,
      value: ethers.utils.parseEther("100"),
    });

    return { cosaddrs, ...testData };
  }
);

describe("BridgeRouter", () => {
  it("should update cosigner and token manager", async () => {
    const { bridgeRouter } = await setupTest();

    const [cosignerAddress0, tokenManagerAddress0] = await ethers.getSigners();

    const testCases = [
      {
        newAddress: cosignerAddress0.address,
        get: bridgeRouter.cosignerManager,
        set: bridgeRouter.setCosignerManager,
        errMsg: null,
      },
      {
        newAddress: tokenManagerAddress0.address,
        get: bridgeRouter.tokenManager,
        set: bridgeRouter.setTokenManager,
        errMsg: null,
      },
      {
        newAddress: ethers.constants.AddressZero,
        get: bridgeRouter.cosignerManager,
        set: bridgeRouter.setCosignerManager,
        errMsg: "BR: ZERO_ADDRESS",
      },
      {
        newAddress: ethers.constants.AddressZero,
        get: bridgeRouter.tokenManager,
        set: bridgeRouter.setTokenManager,
        errMsg: "BR: ZERO_ADDRESS",
      },
    ];

    for (const testCase of testCases) {
      const { newAddress, get, set, errMsg } = testCase;

      if (errMsg == null) {
        await set(newAddress).then((tx) => tx.wait());
        expect(await get()).to.be.equal(newAddress);
      } else {
        await expect(set(newAddress)).to.be.revertedWith(errMsg);
      }
    }
  });

  it("should enter ETH with specified criteries and it is ok", async () => {
    const {
      bridgeRouter,
      bridgeTokenManager,
      erc20Tokens,
      currentChainId,
      targetChainId,
    } = await setupTest();

    const [exitor0, exitor1] = await ethers.getSigners();

    const testCases = [
      {
        token: ethers.constants.AddressZero,
        signer: exitor0,
        amount: ethers.utils.parseEther("1"),
        nonce: 0,
        targetChainId,
        errMsg: null,
      },
      {
        token: ethers.constants.AddressZero,
        signer: exitor1,
        amount: 0,
        nonce: 0,
        targetChainId,
        errMsg: "BR: ZERO_AMOUNT",
      },
      {
        token: ethers.constants.AddressZero,
        signer: exitor0,
        amount: ethers.utils.parseEther("2"),
        nonce: 1,
        targetChainId,
        errMsg: null,
      },
    ];

    for (const testCase of testCases) {
      const { signer, amount, token, nonce, targetChainId, errMsg } = testCase;

      if (errMsg == null) {
        const userBalance = await ethers.provider.getBalance(signer.address);
        const bridgeBalance = await ethers.provider.getBalance(
          bridgeRouter.address
        );
        const tx = bridgeRouter.connect(signer).enterETH(targetChainId, {
          value: amount,
        });
        await expect(tx)
          .to.emit(bridgeRouter, "Enter")
          .withArgs(
            token,
            signer.address,
            amount,
            nonce,
            currentChainId,
            targetChainId
          );
        const txFee = await getTxFee(tx);
        expect(
          await ethers.provider.getBalance(signer.address),
          "Wrong balance eth calculation"
        ).to.be.equal(userBalance.sub(amount).sub(txFee));
        expect(
          await ethers.provider.getBalance(bridgeRouter.address)
        ).to.be.equal(bridgeBalance.add(amount));
      } else {
        await expect(
          bridgeRouter.connect(signer).enterETH(targetChainId, {
            value: amount,
          })
        ).to.be.revertedWith(errMsg);
      }
    }

    // clear token to check error on existance
    await bridgeTokenManager
      .revoke(erc20Tokens.OLT.address)
      .then((tx) => tx.wait());

    for (const testCase of testCases) {
      const { signer, amount, targetChainId, errMsg } = testCase;

      if (errMsg == null) {
        const tx = bridgeRouter.connect(signer).enterETH(targetChainId, {
          value: amount,
        });
        await expect(tx).to.be.revertedWith("BR: NOT_FOUND");
      }
    }
  });

  it("should enter with specified criteries and it is ok", async () => {
    const {
      bridgeTokens,
      erc20Tokens,
      bridgeRouter,
      currentChainId,
      targetChainId,
      bridgeTokenManager,
    } = await setUpTestForEnter();

    const [
      exitorWithBalance0,
      exitorWithBalance1,
      exitorWithBalanceNoAllowance0,
      exitorWithNoBalanceNoAllowance0,
    ] = await ethers.getSigners();

    const testCases = [
      // just normal case
      {
        token: erc20Tokens.lnmETH.address,
        signer: exitorWithBalance0,
        amount: ethers.utils.parseEther("1"),
        nonce: 0,
        targetChainId,
        errMsg: null,
      },
      // mintable example
      {
        token: erc20Tokens.lmETH.address,
        signer: exitorWithBalance1,
        amount: ethers.utils.parseEther("1.313"),
        nonce: 0,
        targetChainId,
        errMsg: null,
      },
      // not enough to burn
      {
        token: erc20Tokens.lmETH.address,
        signer: exitorWithBalance1,
        amount: ethers.utils.parseEther("100500"),
        nonce: 0,
        targetChainId,
        errMsg: "ERC20: burn amount exceeds balance",
      },
      // zero amount as provided
      {
        token: erc20Tokens.lnmETH.address,
        signer: exitorWithBalance1,
        amount: ethers.utils.parseEther("0"),
        nonce: 0,
        targetChainId,
        errMsg: "BR: ZERO_AMOUNT",
      },
      // zero access not supported as we could not withdraw user ether
      {
        token: ethers.constants.AddressZero,
        signer: exitorWithBalance0,
        amount: ethers.utils.parseEther("2"),
        nonce: 0,
        targetChainId,
        errMsg: "BR: ZERO_ADDRESS",
      },
      // enough balance but no allowance
      {
        token: erc20Tokens.lnmETH.address,
        signer: exitorWithBalanceNoAllowance0,
        amount: ethers.utils.parseEther("9"),
        nonce: 0,
        targetChainId,
        errMsg: "ERC20: transfer amount exceeds allowance",
      },
      // not enough balance and no allowance
      {
        token: erc20Tokens.lnmETH.address,
        signer: exitorWithNoBalanceNoAllowance0,
        amount: ethers.utils.parseEther("1"),
        nonce: 0,
        targetChainId,
        errMsg: "ERC20: transfer amount exceeds balance",
      },
      {
        token: "0x000000000000000000000000000000000000dEaD",
        signer: exitorWithNoBalanceNoAllowance0,
        amount: ethers.utils.parseEther("1"),
        nonce: 0,
        targetChainId,
        errMsg: "RT: NOT_LISTED",
      },
    ];

    for (const testCase of testCases) {
      const { signer, amount, token, nonce, targetChainId, errMsg } = testCase;
      if (errMsg == null) {
        const bridgeToken = bridgeTokens[token];
        const userBalance = await bridgeToken.balanceOf(signer.address);
        const bridgeBalance = await bridgeToken.balanceOf(bridgeRouter.address);
        const tokenData = await bridgeTokenManager.getLocal(
          token,
          targetChainId
        );
        const tx = bridgeRouter
          .connect(signer)
          .enter(token, amount, targetChainId);
        await expect(tx)
          .to.emit(bridgeRouter, "Enter")
          .withArgs(
            token,
            signer.address,
            amount,
            nonce,
            currentChainId,
            targetChainId
          );
        expect(
          await bridgeToken.balanceOf(signer.address),
          "User tokens balance not substracted during transaction"
        ).to.be.equal(userBalance.sub(amount));
        if (tokenData.issueType === 0) {
          expect(
            await bridgeToken.balanceOf(bridgeRouter.address),
            "Bridge tokens balance not substracted during transaction"
          ).to.be.equal(bridgeBalance.add(amount));
        } else {
          expect(
            await bridgeToken.balanceOf(bridgeRouter.address),
            "Bridge tokens balance substracted during transaction"
          ).to.be.equal(bridgeBalance);
        }
      } else {
        await expect(
          bridgeRouter.connect(signer).enter(token, amount, targetChainId)
        ).to.be.revertedWith(errMsg);
      }
    }
  });

  it("should exit with specified criteries and it is ok", async () => {
    const {
      erc20Tokens,
      bridgeTokens,
      bridgeRouter,
      bridgeTokenManager,
      currentChainId,
      targetChainId,
      cosaddrs,
    } = await setUpTestForExit();

    // skip first three as reseved for cosigners
    const [_, __, ___, exitor0, exitor1] = await ethers.getSigners();

    const testCases = [
      {
        name: "Normal withdraw with ether send",
        remoteToken: erc20Tokens.OLT.address,
        exitor: exitor0,
        amount: ethers.utils.parseEther("10"),
        nonce: 0,
        localChainId: currentChainId,
        remoteChainId: targetChainId,
        enterLogFunc: getBridgeRouterEnterLog,
        errMsg: null,
      },
      {
        name: "Normal withdraw with token mint",
        remoteToken: erc20Tokens.rnmETH.address,
        exitor: exitor0,
        amount: ethers.utils.parseEther("10"),
        nonce: 1,
        localChainId: currentChainId,
        remoteChainId: targetChainId,
        enterLogFunc: getBridgeRouterEnterLog,
        errMsg: null,
      },
      {
        name: "Normal withdraw with token transfer",
        remoteToken: erc20Tokens.rmETH.address,
        exitor: exitor0,
        amount: ethers.utils.parseEther("10"),
        nonce: 2,
        localChainId: currentChainId,
        remoteChainId: targetChainId,
        enterLogFunc: getBridgeRouterEnterLog,
        errMsg: null,
      },
      {
        name: "Check on double spend",
        remoteToken: erc20Tokens.OLT.address,
        exitor: exitor0,
        amount: ethers.utils.parseEther("10"),
        nonce: 0,
        localChainId: currentChainId,
        remoteChainId: targetChainId,
        enterLogFunc: getBridgeRouterEnterLog,
        errMsg: "BR: COMMITMENT_KNOWN",
      },
      {
        name: "Withraw with eth insufficient balance",
        remoteToken: erc20Tokens.OLT.address,
        exitor: exitor0,
        amount: ethers.utils.parseEther("100500"),
        nonce: 1,
        localChainId: currentChainId,
        remoteChainId: targetChainId,
        enterLogFunc: getBridgeRouterEnterLog,
        errMsg: "RT: INSUFFICIENT_BALANCE",
      },
      {
        name: "Withraw with transfer insufficient balance",
        remoteToken: erc20Tokens.rmETH.address,
        exitor: exitor0,
        amount: ethers.utils.parseEther("100500"),
        nonce: 1,
        localChainId: currentChainId,
        remoteChainId: targetChainId,
        enterLogFunc: getBridgeRouterEnterLog,
        errMsg: "ERC20: transfer amount exceeds balance",
      },
      {
        name: "Withraw with wrong local chain",
        remoteToken: erc20Tokens.OLT.address,
        exitor: exitor0,
        amount: ethers.utils.parseEther("1"),
        nonce: 1,
        localChainId: 123,
        remoteChainId: targetChainId,
        enterLogFunc: getBridgeRouterEnterLog,
        errMsg: "BR: WRONG_TARGET_CHAIN",
      },
      {
        name: "Withraw with same chain as local",
        remoteToken: erc20Tokens.OLT.address,
        exitor: exitor0,
        amount: ethers.utils.parseEther("1"),
        nonce: 1,
        localChainId: currentChainId,
        remoteChainId: currentChainId,
        enterLogFunc: getBridgeRouterEnterLog,
        errMsg: "BR: WRONG_SOURCE_CHAIN",
      },
      {
        name: "Withraw with chain which not present in cosigners",
        remoteToken: erc20Tokens.OLT.address,
        exitor: exitor0,
        amount: ethers.utils.parseEther("1"),
        nonce: 1,
        localChainId: currentChainId,
        remoteChainId: 123,
        enterLogFunc: getBridgeRouterEnterLog,
        errMsg: "BR: INVALID_SIGNATURES",
      },
      {
        name: "Wrong log topic",
        remoteToken: erc20Tokens.OLT.address,
        exitor: exitor0,
        amount: ethers.utils.parseEther("1"),
        nonce: 1,
        localChainId: currentChainId,
        remoteChainId: 123,
        enterLogFunc: async () =>
          ethers.utils.RLP.encode([
            "0x80",
            [
              "0x0000000000000000000000000000000000000000000000000000000000000000",
            ],
          ]),
        errMsg: "BR: INVALID_EVT",
      },
      {
        name: "Wrong owner",
        remoteToken: erc20Tokens.OLT.address,
        exitor: exitor0,
        amount: ethers.utils.parseEther("1"),
        nonce: 2,
        localChainId: currentChainId,
        remoteChainId: 123,
        enterLogFunc: async (data) => {
          data.exitor = exitor1.address;
          return await getBridgeRouterEnterLog(data);
        },
        errMsg: "BR: NOT_ONWER",
      },
      {
        name: "Zero amount",
        remoteToken: erc20Tokens.OLT.address,
        exitor: exitor0,
        amount: ethers.utils.parseEther("0"),
        nonce: 2,
        localChainId: currentChainId,
        remoteChainId: 123,
        enterLogFunc: getBridgeRouterEnterLog,
        errMsg: "BR: ZERO_AMOUNT",
      },
    ];

    for (const testCase of testCases) {
      const {
        name: testName,
        amount,
        nonce,
        exitor,
        remoteToken,
        localChainId,
        remoteChainId,
        enterLogFunc,
        errMsg,
      } = testCase;
      const enterLog = await enterLogFunc({
        token: remoteToken,
        exitor: exitor.address,
        amount,
        nonce,
        localChainId: BigNumber.from(localChainId),
        targetChainId: BigNumber.from(remoteChainId),
      });

      const commitment = keccak256(enterLog);
      const signatures = await Promise.all(
        cosaddrs.map((cosaddr) => web3.eth.sign(commitment, cosaddr))
      ).then((result) => result);
      if (errMsg === null) {
        const localToken = await bridgeTokenManager.callStatic.getLocal(
          remoteToken,
          localChainId
        );
        const bridgeToken = bridgeTokens[localToken.addr];
        let userBalance: BigNumber, bridgeBalance: BigNumber;
        if (localToken.addr === ethers.constants.AddressZero) {
          userBalance = await ethers.provider.getBalance(exitor.address);
          bridgeBalance = await ethers.provider.getBalance(
            bridgeRouter.address
          );
        } else {
          userBalance = await bridgeToken.callStatic.balanceOf(exitor.address);
          bridgeBalance = await bridgeToken.callStatic.balanceOf(
            bridgeRouter.address
          );
        }
        const tx = bridgeRouter.connect(exitor).exit(enterLog, signatures);
        await expect(tx, `Error in test: ${testName}`)
          .to.emit(bridgeRouter, "Exit")
          .withArgs(
            localToken.addr,
            exitor.address,
            amount,
            commitment,
            currentChainId,
            targetChainId
          );
        if (localToken.addr === ethers.constants.AddressZero) {
          const txFee = await getTxFee(tx);
          expect(
            await ethers.provider.getBalance(exitor.address),
            "Wrong balance eth calculation"
          ).to.be.equal(userBalance.add(amount).sub(txFee));
          expect(
            await ethers.provider.getBalance(bridgeRouter.address)
          ).to.be.equal(bridgeBalance.sub(amount));
        } else if (localToken.issueType === 1) {
          expect(
            await bridgeToken.callStatic.balanceOf(exitor.address)
          ).to.be.equal(userBalance.add(amount));
          expect(
            await bridgeToken.callStatic.balanceOf(bridgeRouter.address)
          ).to.be.equal(bridgeBalance);
        } else {
          expect(
            await bridgeToken.callStatic.balanceOf(exitor.address)
          ).to.be.equal(userBalance.add(amount));
          expect(
            await bridgeToken.callStatic.balanceOf(bridgeRouter.address)
          ).to.be.equal(bridgeBalance.sub(amount));
        }
      } else {
        await expect(
          bridgeRouter.connect(exitor).exit(enterLog, signatures)
        ).to.be.revertedWith(errMsg);
      }
    }
  });
});
