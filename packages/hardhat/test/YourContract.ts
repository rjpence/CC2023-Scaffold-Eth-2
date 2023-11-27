import { expect } from "chai";
import { ethers } from "hardhat";
import { YourContract } from "../typechain-types";

describe("YourContract", async function () {
  // We define a fixture to reuse the same setup in every test.

  let yourContract: YourContract;
  const [owner, user, otherUser] = await ethers.getSigners();

  before(async () => {
    const yourContractFactory = await ethers.getContractFactory("YourContract");
    yourContract = (await yourContractFactory.deploy(owner.address)) as YourContract;

    await yourContract.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await yourContract.owner()).to.equal(owner.address);
    });
  });

  describe("User Action", function () {
    describe("When caller is not owner", function () {
      it("Should revert", async function () {
        // Get the first two accounts from the wallet and assign the second to `user`

        await expect(yourContract.connect(user).userAction(user.address)).to.be.revertedWith("Not owner");
      });
    });
    describe("When caller is owner", function () {
      it("Should record a user action", async function () {
        await yourContract.connect(owner).userAction(user.address);
        expect(await yourContract.userReadCounter(user.address)).to.equal(1);

        await yourContract.connect(owner).userAction(otherUser.address);
        expect(await yourContract.userReadCounter(otherUser.address)).to.equal(1);

        expect(await yourContract.readCounter()).to.equal(2);
      });
    });
  });
});
