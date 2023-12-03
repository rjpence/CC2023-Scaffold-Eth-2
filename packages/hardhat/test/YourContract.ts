import { expect } from "chai";
import { ethers } from "hardhat";
import { YourContract } from "../typechain-types";

describe("YourContract", function () {
  // We define a fixture to reuse the same setup in every test.

  let yourContract: YourContract;

  before(async () => {
    const [owner] = await ethers.getSigners();
    const yourContractFactory = await ethers.getContractFactory("YourContract");
    yourContract = (await yourContractFactory.deploy(owner.address)) as YourContract;

    await yourContract.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const [owner] = await ethers.getSigners();
      expect(await yourContract.owner()).to.equal(owner.address);
    });
  });

  describe("User Action", function () {
    describe("When caller is not owner", function () {
      it("Should revert", async function () {
        // Get the first two accounts from the wallet and assign the second to `user`
        const [owner, user] = await ethers.getSigners();
        const contentItemHash = ethers.utils.id("contentItem");
        const signedContentItemHash = await user.signMessage(ethers.utils.arrayify(contentItemHash));

        await expect(
          yourContract.connect(user).userAction(owner.address, contentItemHash, signedContentItemHash),
        ).to.be.revertedWith("Not owner");
      });
    });

    describe("When caller is owner", function () {
      describe("When signedContentItemHash signer is not user", function () {
        it("Should revert", async function () {
          const [owner, user, otherUser] = await ethers.getSigners();
          const contentItemHash = ethers.utils.id("contentItem");
          const signedContentItemHash = await user.signMessage(ethers.utils.arrayify(contentItemHash));
          console.log("signedContentItemHash", signedContentItemHash);

          // Reverts because signedContentItemHash is signed by user, but otherUser is given as user to userAction
          await expect(
            yourContract
              .connect(owner)
              .userAction(otherUser.address, contentItemHash, signedContentItemHash as `0x${string}`),
          ).to.be.revertedWith("Invalid signature");
        });
      });

      it("Should record a user action", async function () {
        const [owner, user, otherUser] = await ethers.getSigners();
        const contentItemHash = ethers.utils.id("contentItem");

        // Send user's signed content item hash to the contract
        const signedContentItemHashFromUser = await user.signMessage(ethers.utils.arrayify(contentItemHash));
        await yourContract.connect(owner).userAction(user.address, contentItemHash, signedContentItemHashFromUser);
        expect(await yourContract.userReadCounter(user.address)).to.equal(1);

        // Send otherUser's signed content item hash to the contract
        const signedContentItemHashFromOtherUser = await otherUser.signMessage(ethers.utils.arrayify(contentItemHash));
        await yourContract
          .connect(owner)
          .userAction(otherUser.address, contentItemHash, signedContentItemHashFromOtherUser);
        expect(await yourContract.userReadCounter(otherUser.address)).to.equal(1);

        expect(await yourContract.readCounter()).to.equal(2);
      });

      it("Should emit ContentItemConsumed event", async function () {
        expect(false).to.equal(true);
      });
    });
  });
});
