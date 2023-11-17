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
    it("Should have the right message on deploy", async function () {
      expect(await yourContract.Salutation()).to.equal("Yo!");
    });

    it("Should allow setting of total read", async function () {
      await yourContract.userAction();
      expect(await yourContract.readCounter()).to.equal(1);
    });

    it("Should allow setting of individual user read", async function () {
      const [owner] = await ethers.getSigners();
      await yourContract.userAction();
      expect(await yourContract.userReadCounter(owner.address)).to.equal(2);
    });

    it("Should allow setting of multiple user read", async function () {
      const [testuser] = await ethers.getSigners();
      await yourContract.userAction();
      expect(await yourContract.userReadCounter(testuser.address)).to.equal(3);
    });

    it("Should allow setting of total read", async function () {
      await yourContract.userAction();
      expect(await yourContract.readCounter()).to.equal(4);
    });
  });
});
