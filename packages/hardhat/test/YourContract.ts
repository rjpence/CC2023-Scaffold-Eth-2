import { expect } from "chai";
import { ethers } from "hardhat";
import { YourContract } from "../typechain-types";

//import { waffle } from "hardhat";
//const { waffle } = require("hardhat");
//const provider = waffle.provider;

describe("YourContract", function () {
  // We define a fixture to reuse the same setup in every test.

  let yourContract: YourContract;

  before(async () => {
    const [owner] = await ethers.getSigners();
    const proposalReward = 1;

    const yourContractFactory = await ethers.getContractFactory("YourContract");

    yourContract = (await yourContractFactory.deploy(proposalReward,owner.address)) as YourContract;

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
        ).to.be.revertedWith("Only callable by owner");
      });
    });

    describe("When caller is owner", function () {
      describe("When signedContentItemHash signer is not user", function () {
        it("Should revert", async function () {
          const [owner, user, otherUser] = await ethers.getSigners();
          const contentItemHash = ethers.utils.id("contentItem");
          const signedContentItemHash = await user.signMessage(ethers.utils.arrayify(contentItemHash));

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
        const transaction = await yourContract
          .connect(owner)
          .userAction(user.address, contentItemHash, signedContentItemHashFromUser);

        const receipt = await transaction.wait();

        //Check if ContentItemConsumed was emitted
        expect(receipt.events[0].event).to.equal("ContentItemConsumed");
      });
    });
  });

  describe("extProposeContentItem", function () {
    /*it("Should revert when content item already proposed", async function () {
      const [owner, user] = await ethers.getSigners();
      const contentItemHash = ethers.utils.id("contentItem");
      const url = ethers.utils.id("url");
      const title = ethers.utils.id("title");
      const testThing = yourContract.connect(user).extProposeContentItem(contentItemHash, url, title);
      await expect (
        yourContract.connect(user).extProposeContentItem(contentItemHash, url, title)
      ).to.be.revertedWith("Content item already proposed");

    });*/

    /*it("Should emit ContentItemProposed event", async function () {
      const [user] = await ethers.getSigners();
      //console.log(user);
      const contentItemHash = ethers.utils.id("contentItem");
      const url = ethers.utils.id("url");
      const title = ethers.utils.id("title");
      
        const TestEncryptedSecretsUrls = "mocksecretdata";
        const testDonHostedSecretsSlotID = 1;
        const testDonHostedSecretsVersion = 1;
        /*const string[] memory contentItemArgs = "test"
        const bytes[] memory bytesArgs =
        const uint64 subscriptionId = 1
        const uint32 gasLimit = 10000
        const bytes32 donId = mockoracle

      //Trigger the event indicating content proposition
      const transaction = await yourContract.connect(user).(
        contentItemHash, 
        TestEncryptedSecretsUrls,
        testDonHostedSecretsSlotID, 
        testDonHostedSecretsVersion, 
        contentItemArgs,
        bytesArgs,
        testSubscriptionId,
        testGasLimit,
        testDonId
        );

      const receipt = await transaction.wait();
      console.log(receipt);
      //Check if ContentItemProposed was emitted
      expect(receipt.events[0].event).to.equal("ContentItemProposed");
    });*/

    /* it("Should store content item hash and proposer", async function () {
      // You will need the `requestId` to get the content item hash from the `hashesToProposers` mapping
      // That value will be emitted in the `ValidationRequested` event
      const [user] = await ethers.getSigners();
      const contentItemHash = ethers.utils.id("contentItem");
      const url = ethers.utils.id("url");    
      const title = ethers.utils.id("title");

      //Trigger the event indicating content proposition
      const transaction = await yourContract.connect(user).extProposeContentItem(contentItemHash, url, title);
      console.log("look at me");

      const receipt = await transaction.wait();
      console.log("look at me");
      console.log(receipt);

      //const requestId = await mockRequestId
      expect(false).to.equal(true);
    });*/

    /* it("Should emit ValidationRequested event", async function () {
      const [user] = await ethers.getSigners();
      const contentItemHash = ethers.utils.id("contentItem");
      const url = ethers.utils.id("url");
      const title = ethers.utils.id("title");
     

      //Trigger the event indicating content proposition
      const transaction = await yourContract.connect(user).extProposeContentItem(contentItemHash, url, title);

      const receipt = await transaction.wait();

      //Check if ContentItemProposed was emitted
      expect (receipt.events[0].event).to.equal("ValidationRequested");


    });*/
  });

  /*//const mockRequestId = blockhash(block.number - 1);
      const requestIdsToHashes[mockRequestId] = _contentItemHash;


      //Trigger the event indicating request validation
      const ValidationRequested = await yourContract.requestIdsToHashes[mockRequestId];

      await ValidationRequested.wait();
        console.log (ValidationRequested);*/

  describe("handleValidationResponse", function () {
    /* it("Should revert for invalid requestId", async function () {
      expect(false).to.equal(true);
    });*/

    /*it("Should delete the content item hash and proposer", async function () {
      expect(false).to.equal(true);
    });*/

    /*it("Should emit ValidationResponseReceived event", async function () {
      expect(false).to.equal(true);
    });*/

    describe("When propose is valid", function () {
      /*it("Should increase proposer's points by proposalReward", async function () {
        const [user,owner] = await ethers.getSigners();

        const contentItemHash = ethers.utils.id("contentItem");
        const url = ethers.utils.id("url");
        const title = ethers.utils.id("title");
        //const requestId = await yourContract.extProposeContentItem(contentItemHash, url, title);
        const requestId = yourContract.extProposeContentItem(contentItemHash,url,title);
        console.log("*****************************************************************************************************************");
        console.log(requestId);
        const internalReturn = await yourContract.connect(owner.address).handleValidationResponse(requestId, true);
        console.log(internalReturn);
        expect(1).to.equal(1);
      });*/

      /*it("Should increase totalPoints by proposalReward", async function () {
        const [proposer] = await ethers.getSigners();
        const contentItemHash = ethers.utils.id("contentItem");

        
        const internalReturn = await yourContract.connect(proposer.address).handleValidationResponse(proposer.address, true);

        expect(internalReturn.handleValidationResponse.totalPoints).to.equal(2);
      });*/

      it("Should emit ValidProposalRewarded event", async function () {
        const [proposer] = await ethers.getSigners();
        const contentItemHash = ethers.utils.id("contentItem");

        //Trigger the event indicating content proposition
        const transaction = await yourContract.connect(proposer).rewardValidProposal(proposer, contentItemHash);

        const receipt = await transaction.wait();

        //Check if ValidProposalRewarded was emitted
        expect(receipt.events[0].event).to.equal("ValidProposalRewarded");
      });
    });
  });

  /*describe("setProposalReward", function () {
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
    });
  });*/
});
