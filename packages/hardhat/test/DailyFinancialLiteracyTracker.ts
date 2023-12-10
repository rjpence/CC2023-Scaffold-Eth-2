import { expect } from "chai";
import { ethers } from "hardhat";
import { DailyFinancialLiteracyTracker } from "../typechain-types";
import { BigNumber, Signer } from "ethers";

describe("DailyFinancialLiteracyTracker", function () {
  let dfltContract: DailyFinancialLiteracyTracker;
  let owner: Signer;
  let user: Signer;
  let otherUser: Signer;
  let vrfCoordinator: Signer;
  let functionsRouter: Signer;
  let userPointsBefore: BigNumber;
  let userEpochPointsBefore: BigNumber;
  let totalRewardsPerEPBefore: BigNumber;
  let totalItemsConsumedBefore: BigNumber;
  let signedContentItemHash: string;

  const contentItemHash = ethers.utils.id("contentItem");

  beforeEach(async () => {
    // Deploy the contract and get the signers
    [owner, user, otherUser, vrfCoordinator, functionsRouter] = await ethers.getSigners();
    const DailyFinancialLiteracyTracker = await ethers.getContractFactory("DailyFinancialLiteracyTracker");
    dfltContract = (await DailyFinancialLiteracyTracker.deploy(
      vrfCoordinator.getAddress(),
      functionsRouter.getAddress(),
    )) as DailyFinancialLiteracyTracker;
    signedContentItemHash = await user.signMessage(ethers.utils.arrayify(contentItemHash));
    await dfltContract.deployed();
  });

  describe("Deployment", function () {
    it("Should set the Chainlink VRF coordinator", async function () {
      expect(await dfltContract.vrfCoordinator()).to.equal(await vrfCoordinator.getAddress());
    });

    it("Should set the epoch timestamp", async function () {
      const deployBlockNumber = dfltContract.deployTransaction.blockNumber;
      const deployBlock = await ethers.provider.getBlock(deployBlockNumber!);
      const deployTimestamp = deployBlock.timestamp;
      expect(Number(await dfltContract.epochTimestamp())).to.equal(deployTimestamp);
    });
  });

  describe("trackConsumedContent", function () {
    beforeEach(async function () {
      // Record the initial state before each test
      userPointsBefore = (await dfltContract.users(user.getAddress())).points;
      userEpochPointsBefore = (await dfltContract.users(user.getAddress())).epochPoints;
      totalItemsConsumedBefore = await dfltContract.totalItemsConsumed();
    });

    describe("When msg.sender is Not Owner", function () {
      it("should revert the transaction", async function () {
        const tx = dfltContract
          .connect(user)
          .trackConsumedContent(user.getAddress(), contentItemHash, signedContentItemHash);
        await expect(tx).to.be.revertedWith("Only callable by owner");
      });
    });

    describe("When msg.sender is Owner", function () {
      describe("When signedContentItemHash signer is not user", function () {
        it("Should revert", async function () {
          const tx = dfltContract.trackConsumedContent(otherUser.getAddress(), contentItemHash, signedContentItemHash);
          await expect(tx).to.be.revertedWith("Invalid signature");
        });
      });

      describe("When signedContentItemHash signer is user", function () {
        it("Should track and reward points for consumed content", async function () {
          // Send user's signed content item hash to the contract
          const consumptionPoints = await dfltContract.consumptionPoints();
          const txResponse = await dfltContract.trackConsumedContent(
            user.getAddress(),
            contentItemHash,
            signedContentItemHash,
          );
          const txReceipt = await txResponse.wait();
          const eventNames = txReceipt.events?.map(event => event.event);

          expect(eventNames).to.include("ContentItemConsumed");
          expect(eventNames).to.include("EpochEntered");
          expect(eventNames).to.include("EpochPointsEarned");
          expect(await dfltContract.totalItemsConsumed()).to.equal(totalItemsConsumedBefore.add(1));
          expect((await dfltContract.users(user.getAddress())).points).to.equal(
            userPointsBefore.add(consumptionPoints),
          );
          expect((await dfltContract.users(user.getAddress())).epochPoints).to.equal(
            userEpochPointsBefore.add(consumptionPoints),
          );
        });
      });
    });
  });

  describe("endEpoch", function () {
    beforeEach(async function () {
      // Record the initial state before each test
      userEpochPointsBefore = (await dfltContract.users(user.getAddress())).epochPoints;
      totalRewardsPerEPBefore = await dfltContract.totalRewardsPerEP();
    });

    describe("When there are no distributable rewards", function () {
      it("should revert the transaction", async function () {
        const tx = dfltContract.connect(user).endEpoch();
        await expect(tx).to.be.revertedWith("Rewards must be at least 1 token");
      });
    });

    describe("When there are no eligible users", function () {
      it("should revert the transaction", async function () {
        const distributableRewards = ethers.utils.parseEther("1");

        (await dfltContract.connect(owner).addDistributableRewards(distributableRewards)).wait();

        const tx = dfltContract.connect(user).endEpoch();

        await expect(tx).to.be.revertedWith("No epoch points to distribute rewards");
      });
    });
  });
});
