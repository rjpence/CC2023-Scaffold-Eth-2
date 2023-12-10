import { expect } from "chai";
import { ethers } from "hardhat";
import { DailyFinancialLiteracyTracker } from "../typechain-types";
import { BigNumber, Signer } from "ethers";

describe("DailyFinancialLiteracyTracker", function () {
  // We define a fixture to reuse the same setup in every test.

  // struct User {
	// 	uint256 points;
	// 	uint256 rewards;
	// 	uint256 lastRewardsPerEP;
	// 	uint256 latestConsumptionTimestamp;
	// 	uint256 epochEntryPoints;
	// 	uint256 epochPoints;
	// }

  let dfltContract: DailyFinancialLiteracyTracker;
  let owner: Signer;
  let nonOwner: Signer;
  let userPointsBefore: BigNumber;
  let userEpochPointsBefore: BigNumber;
  let totalItemsConsumedBefore: BigNumber;
          const contentItemHash = ethers.utils.id("contentItem");
          const signedContentItemHash = await user.signMessage(ethers.utils.arrayify(contentItemHash));

  before(async () => {
    // Deploy the contract and get the signers
    [owner, nonOwner] = await ethers.getSigners();
    const DailyFinancialLiteracyTracker = await ethers.getContractFactory("DailyFinancialLiteracyTracker");
    dfltContract = (await DailyFinancialLiteracyTracker.deploy(owner)) as DailyFinancialLiteracyTracker;

    await dfltContract.deployed();
  });

  describe("trackConsumedContent function", function () {
    beforeEach(async function () {
      // Record the initial state before each test
      userPointsBefore = (await dfltContract.users(nonOwner.getAddress())).points;
      userEpochPointsBefore = (await dfltContract.users(nonOwner.getAddress())).epochPoints;
      totalItemsConsumedBefore = await dfltContract.totalItemsConsumed();
    });

    describe("When msg.sender is Not Owner", function () {
      it("should revert the transaction", async function () {
        // Assuming 'trackConsumedContent' requires parameters like user, content item hash, etc.
        const tx = dfltContract.connect(nonOwner).trackConsumedContent(/* parameters */);
        await expect(tx).to.be.revertedWith("Not owner");
      });
    });
  });
});
