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
    it("Should allow setting of total read", async function () {
      await yourContract.userAction();
      expect(await yourContract.readCounter()).to.equal(1);
    });

    it("Should allow setting of individual user read", async function () {
      const [owner, testUser, Randy] = await ethers.getSigners();
      await yourContract.userAction();
      expect(await yourContract.userReadCounter(owner.address)).to.equal(2);

      await yourContract.connect(testUser).userAction();
      expect(await yourContract.userReadCounter(testUser.address)).to.equal(1);

      await yourContract.connect(Randy).userAction();
      expect(await yourContract.userReadCounter(Randy.address)).to.equal(1);
    });

    it("Should allow setting of total read", async function () {
      await yourContract.userAction();
      expect(await yourContract.readCounter()).to.equal(5);
    });
  });
});
