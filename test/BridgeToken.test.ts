import { deployments, ethers, getChainId } from "hardhat";
import { expect } from "chai";

import { BridgeToken } from "../typechain";
import { getPermitSignature } from "./helpers/permit";
import { Wallet } from "ethers";

const setupTest = deployments.createFixture(
  async ({ deployments, getNamedAccounts, ethers }) => {
    await deployments.fixture(["BridgeToken"]); // ensure you start from a fresh deployments
    const { bridgeTokenOwner } = await getNamedAccounts();
    const bridgeToken: BridgeToken = await ethers.getContract(
      "BridgeTokenOLT",
      bridgeTokenOwner
    );
    const chainId = +(await getChainId());
    return {
      bridgeToken,
      owner: bridgeTokenOwner,
      chainId,
    };
  }
);

describe("BridgeToken", () => {
  it("should permit work", async () => {
    const [wallet, other] = await ethers.getSigners();
    const { bridgeToken } = await setupTest();
    const value = 123;

    const { v, r, s } = await getPermitSignature(
      wallet as unknown as Wallet,
      bridgeToken,
      other.address,
      value
    );

    expect(await bridgeToken.nonces(wallet.address)).to.be.equal(0);
    expect(await bridgeToken.allowance(wallet.address, other.address)).to.be.eq(
      0
    );

    await bridgeToken.permit(
      wallet.address,
      other.address,
      value,
      ethers.constants.MaxUint256,
      v,
      r,
      s
    );

    expect(await bridgeToken.nonces(wallet.address)).to.be.equal(1);
    expect(await bridgeToken.allowance(wallet.address, other.address)).to.be.eq(
      value
    );
  });

  it("should fetch correct data and it is ok", async () => {
    const { bridgeToken } = await setupTest();
    expect(await bridgeToken.name()).to.be.equal("Syndicate OneLedger Token");
    expect(await bridgeToken.symbol()).to.be.equal("OLT");
    expect(await bridgeToken.decimals()).to.be.equal(18);
  });

  it("should mint tokens and it is ok", async () => {
    const { bridgeToken } = await setupTest();

    const [recipient0] = await ethers.getSigners();
    const amount = ethers.utils.parseEther("10");

    expect(await bridgeToken.balanceOf(recipient0.address)).to.be.equal(0);

    const tx = bridgeToken.mint(recipient0.address, amount);
    await expect(tx)
      .to.emit(bridgeToken, "Transfer")
      .withArgs(ethers.constants.AddressZero, recipient0.address, amount);

    expect(await bridgeToken.balanceOf(recipient0.address)).to.be.equal(amount);
  });

  it("should burn tokens and it is ok", async () => {
    const { bridgeToken } = await setupTest();

    const [recipient0] = await ethers.getSigners();
    const amount = ethers.utils.parseEther("100");

    await bridgeToken.mint(recipient0.address, amount).then((tx) => tx.wait());
    expect(await bridgeToken.balanceOf(recipient0.address)).to.be.equal(amount);

    const burnAmount = ethers.utils.parseEther("10");
    const tx = bridgeToken.burn(recipient0.address, burnAmount);
    await expect(tx)
      .to.emit(bridgeToken, "Transfer")
      .withArgs(recipient0.address, ethers.constants.AddressZero, burnAmount);

    expect(await bridgeToken.balanceOf(recipient0.address)).to.be.equal(
      amount.sub(burnAmount)
    );
  });

  it("should not mint tokens if not an owner", async () => {
    const { bridgeToken } = await setupTest();

    const [sender0] = await ethers.getSigners();
    const amount = ethers.utils.parseEther("10");

    await expect(
      bridgeToken.connect(sender0).mint(sender0.address, amount)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("should not burn tokens if not an owner", async () => {
    const { bridgeToken } = await setupTest();

    const [sender0, recipient0] = await ethers.getSigners();
    const amount = ethers.utils.parseEther("10");

    await bridgeToken.mint(recipient0.address, amount).then((tx) => tx.wait());

    await expect(
      bridgeToken.connect(sender0).burn(recipient0.address, amount)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
});
