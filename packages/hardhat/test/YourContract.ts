import { expect } from "chai";
import { ethers } from "hardhat";
import { YourContract } from "../typechain-types";

describe("YourContract", function () {
  // We define a fixture to reuse the same setup in every test.

  let yourContract: YourContract;

  before(async () => {
    const [owner] = await ethers.getSigners();
    const proposalReward = 1;

    console.log("yes");
    const yourContractFactory = await ethers.getContractFactory("YourContract");
    console.log("yes1");

    yourContract = (await yourContractFactory.deploy(owner.address, proposalReward)) as YourContract;
    console.log("yes2");

    await yourContract.deployed();
    console.log("yes3");
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
        expect(await yourContract.points(user.address)).to.equal(1);

        // Send otherUser's signed content item hash to the contract
        const signedContentItemHashFromOtherUser = await otherUser.signMessage(ethers.utils.arrayify(contentItemHash));
        await yourContract
          .connect(owner)
          .userAction(otherUser.address, contentItemHash, signedContentItemHashFromOtherUser);
        expect(await yourContract.points(otherUser.address)).to.equal(1);

        expect(await yourContract.totalPoints()).to.equal(2);
      });

      it("Should emit ContentItemConsumed event", async function () {
        const [owner, user] = await ethers.getSigners();
        const contentItemHash = ethers.utils.id("contentItem");

        // Send user's signed content item hash to the contract
        const signedContentItemHashFromUser = await user.signMessage(ethers.utils.arrayify(contentItemHash));

        //Trigger the event indicating content consumption
        const contentConsumedEmitter = await yourContract
          .connect(owner)
          .userAction(user.address, contentItemHash, signedContentItemHashFromUser);

        await contentConsumedEmitter.wait();

        //Check if ContentItemConsumed was emitted
        const eventFilter = yourContract.filters.ContentItemConsumed(user.address, contentItemHash);
        const events = await yourContract.queryFilter(eventFilter);
        expect(events.length).to.equal(2);
      });
    });
  });

  describe("extProposeContentItem", function () {
    /* it("Should revert when content item already proposed", async function () {
      const [owner, user] = await ethers.getSigners();
      const contentItemHash = ethers.utils.id("contentItem");
      const url = ethers.utils.id("url");
      const title = ethers.utils.id("title");

      await yourContract.connect(owner).extProposeContentItem(contentItemHash, url, title);

      const proposedFilter = yourContract.filters.ContentItemProposed(user.address, contentItemHash, url, title);


      expect(false).to.equal(true);
    });*/

    it("Should emit ContentItemProposed event", async function () {
      const [user] = await ethers.getSigners();
      const contentItemHash = ethers.utils.id("contentItem");
      const url = ethers.utils.id("url");
      const title = ethers.utils.id("title");

      //Trigger the event indicating content proposition
      const ContentItemProposed = await yourContract.connect(user).extProposeContentItem(contentItemHash, url, title);

      await ContentItemProposed.wait();

      //Check if ContentItemProposed was emitted
      const eventFilter = yourContract.filters.ContentItemProposed(user.address, contentItemHash);
      const events = await yourContract.queryFilter(eventFilter);
      expect(events.length).to.equal(1);
    });
    /*
    it("Should store content item hash and proposer", async function () {
      // You will need the `requestId` to get the content item hash from the `hashesToProposers` mapping
      // That value will be emitted in the `ValidationRequested` event
      expect(false).to.equal(true);
    });

    it("Should emit ValidationRequested event", async function () {
      expect(false).to.equal(true);
    });
  });

  describe("handleValidationResponse", function () {
    it("Should revert for invalid requestId", async function () {
      expect(false).to.equal(true);
    });

    it("Should delete the content item hash and proposer", async function () {
      expect(false).to.equal(true);
    });

    it("Should emit ValidationResponseReceived event", async function () {
      expect(false).to.equal(true);
    });

    describe("When propose is valid", function () {
      it("Should increase proposer's points by proposalReward", async function () {
        expect(false).to.equal(true);
      });

      it("Should increase totalPoints by proposalReward", async function () {
        expect(false).to.equal(true);
      });

      it("Should emit ValidProposalRewarded event", async function () {
        expect(false).to.equal(true);
      });
    });
  });

  describe("setProposalReward", function () {
    describe("When caller is not owner", function () {
      it("Should revert", async function () {
        expect(false).to.equal(true);
      });
    });

    it("Should set the new proposalReward", async function () {
      expect(false).to.equal(true);
    });

    it("Should emit ProposalRewardChanged event", async function () {
      expect(false).to.equal(true);
    });*/
  });
});
