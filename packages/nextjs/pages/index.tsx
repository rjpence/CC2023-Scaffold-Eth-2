// Importing necessary modules and components from libraries and other files
import React, { useEffect, useState } from "react";
// React library for building user interfaces
import type { NextPage } from "next";
// Next.js types for typing components
import { createPublicClient, http, keccak256, stringToBytes } from "viem";
// Viem library functions for blockchain interactions
import { avalanche, avalancheFuji, hardhat } from "viem/chains";
// Importing a specific blockchain environment from Viem
import { useAccount, useSignMessage } from "wagmi";
import { ContentItem } from "~~/components/ContentItem";
// Wagmi hooks for wallet account management and message signing
import { MetaHeader } from "~~/components/MetaHeader";
import { InputBase, getParsedError } from "~~/components/scaffold-eth";
// Custom component for the meta header
import deployedContracts from "~~/contracts/deployedContracts";
// Custom component to display blockchain addresses
import { useDeployedContractInfo, useScaffoldContractWrite, useScaffoldEventSubscriber } from "~~/hooks/scaffold-eth";
// Hook to get information about deployed contracts
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth/useScaffoldContractRead";
import { notification } from "~~/utils/scaffold-eth";

type User = {
  points: number;
  rewards: number;
  lastRewardsPerPoint: number;
  epochPoints: number;
};

// Creating a functional component for the homepage
const Home: NextPage = () => {
  // TODO: refactor
  const getChain = (chainName: string) => {
    switch (chainName) {
      case "hardhat":
        return hardhat;
      case "avalanche":
        return avalanche;
      case "avalancheFuji":
        return avalancheFuji;
      default:
        throw new Error(`Chain ${chainName} not found`);
    }
  };
  const publicClient = createPublicClient({
    chain: getChain(process.env.NEXT_PUBLIC_CHAIN_NAME as string),
    transport: http(),
  });

  // State management hooks to store different pieces of information
  const { address } = useAccount(); // Retrieves the current user's blockchain address
  const contractName = "DailyFinancialLiteracyTracker"; // Name of the smart contract to interact with
  // Hooks to read data from the deployed contract using its name
  const { data: deployedContractData } = useDeployedContractInfo(contractName);
  const { data: totalEpochPoints } = useScaffoldContractRead({
    contractName: contractName,
    functionName: "totalEpochPoints",
  });
  const { data: totalItemsConsumed } = useScaffoldContractRead({
    contractName: contractName,
    functionName: "totalItemsConsumed",
  });
  const { data: distributableRewards } = useScaffoldContractRead({
    contractName: contractName,
    functionName: "distributableRewards",
  });
  const { data: epochTimestamp } = useScaffoldContractRead({
    contractName: contractName,
    functionName: "epochTimestamp",
  });

  // More state management hooks for various pieces of data
  const [contentItemUrl, setContentItemUrl] = useState<string>("");
  // ... (similar useState declarations for other pieces of data like title, question, etc.)
  const [contentItemTitle, setContentItemTitle] = useState<string>("");
  const [contentItemDescription, setContentItemDescription] = useState<string>("");
  const [question, setQuestion] = useState<string>("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [contentItemHash, setContentItemHash] = useState<string>("");
  const [consumeTransactionHash, setConsumeTransactionHash] = useState<string>("");
  const [transactionSignature, setTransactionSignature] = useState<string>("");
  // Hook to sign a message (blockchain transaction) with the user's private key
  const { data: signedContentItemHash, signMessage } = useSignMessage({
    message: { raw: contentItemHash as `0x${string}` },
  });
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [linkClicked, setLinkClicked] = useState<boolean>(false);
  const [user, setUser] = useState<User>();
  const [isDistributable, setIsDistributable] = useState<boolean>(false);

  // Variables for proposing a new content item
  const [userInputUrl, setUserInputUrl] = useState<string>("");
  const [fetchedTitle, setFetchedTitle] = useState<string>("");
  const [isTitleFetched, setIsTitleFetched] = useState<boolean>(false);
  const [fetchTitleErrorMessage, setFetchTitleErrorMessage] = useState<string>("");
  const [proposeTransactionHash, setProposeTransactionHash] = useState<string>("");
  const [endEpochTransactionHash, setEndEpochTransactionHash] = useState<string>("");
  const { writeAsync: proposeContentItem } = useScaffoldContractWrite({
    contractName: contractName,
    functionName: "extProposeContentItem",
    args: [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
    onBlockConfirmation: txnReceipt => {
      console.log("proposeContentItem transaction confirmed:", txnReceipt.transactionHash);
      setProposeTransactionHash(txnReceipt.transactionHash);
      console.log("proposeContentItem transaction hash", txnReceipt.transactionHash);
    },
    onError: error => {
      const message = getParsedError(error);
      const capitalizedMessage = capitalizeFirstLetter(message);
      setFetchTitleErrorMessage(capitalizedMessage);
    },
  });

  const { writeAsync: endEpoch } = useScaffoldContractWrite({
    contractName: contractName,
    functionName: "endEpoch",
    onBlockConfirmation: txnReceipt => {
      console.log("endEpoch transaction confirmed:", txnReceipt.transactionHash);
      setEndEpochTransactionHash(txnReceipt.transactionHash);
      console.log("endEpoch transaction hash", txnReceipt.transactionHash);
    },
  });

  const chainlinkDONIdHex = "0x66756e2d6176616c616e6368652d66756a692d31000000000000000000000000";
  const chainlinkSubscriptionId = 1632;
  const chainlinkFunctionsGasLimit = 300000;

  useEffect(() => {
    if (
      distributableRewards &&
      Number(distributableRewards) >= 1 * 10 ** 18 &&
      totalEpochPoints &&
      Number(totalEpochPoints) > 0
    ) {
      console.log("distributableRewards:", distributableRewards);
      setIsDistributable(true);
    } else {
      setIsDistributable(false);
    }
  }, [distributableRewards]);

  // TODO: update dependency array to include when ValidProposalRewarded event is emitted
  useEffect(() => {
    const getUserData = async (address: string) => {
      return await publicClient.readContract({
        ...deployedContracts["43113"].DailyFinancialLiteracyTracker,
        functionName: "users",
        args: [address],
      });
    };
    if (address) {
      getUserData(address).then(data => {
        setUser({
          points: Number(data[0]),
          rewards: Number(data[1]),
          lastRewardsPerPoint: Number(data[2]),
          epochPoints: Number(data[5]),
        });
      });
    }
  }, [address, consumeTransactionHash, endEpochTransactionHash]);

  // useEffect hooks are used to perform side effects in the component, like API calls, data fetching, etc.
  useEffect(() => {
    // Make sure the address is available before making the API call
    if (address && contentItemUrl.length === 0 && contentItemTitle.length === 0) getContentItem(); // Fetch content item if the address is available
  }, [address]); // This effect runs whenever 'address' changes

  // ... (other useEffect hooks for different actions like signing messages, sending transactions, etc.)
  useEffect(() => {
    if (user && contentItemHash.length > 0) {
      console.log("contentItemHash has been updated:", contentItemHash);

      signMessage();
    }
  }, [contentItemHash]);

  useEffect(() => {
    if (user && signedContentItemHash && signedContentItemHash.length > 0) {
      try {
        const contentConsumptionProverData = {
          contractAddress: deployedContractData?.address,
          userAddress: address,
          contentItemHash: contentItemHash,
          signedContentItemHash: signedContentItemHash,
        };

        fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/functions/v1/contentConsumptionProver`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_BACKEND_API_TOKEN}`,
          },
          body: JSON.stringify(contentConsumptionProverData),
        })
          .then(response => response.json())
          .then(data => {
            console.log("data:", data);
            setTransactionSignature(data.transactionSignature);
          });
      } catch (error) {
        console.error("Error signing message:", error);
      }
    }
  }, [signedContentItemHash, address, deployedContractData]);

  useEffect(() => {
    if (user && transactionSignature.length > 0) {
      console.log("transactionSignature has been updated:", transactionSignature);
      const sendTrackConsumedContentTransaction = async () => {
        console.log("Sending signed trackConsumedContent transaction...");

        const trackConsumedContentTransactionHash = await publicClient.sendRawTransaction({
          serializedTransaction: transactionSignature as `0x${string}`,
        });

        console.log("trackConsumedContentTransactionHash:", trackConsumedContentTransactionHash);

        setConsumeTransactionHash(trackConsumedContentTransactionHash);
      };
      sendTrackConsumedContentTransaction();
    }
  }, [transactionSignature]);

  useEffect(() => {
    if (user && consumeTransactionHash.length > 0) {
      console.log("transactionHash has been updated:", consumeTransactionHash);
      getContentItem();
      setLinkClicked(false);
    }
  }, [consumeTransactionHash]);

  useEffect(() => {
    if (user && fetchedTitle.length > 0) {
      console.log("fetchedTitle has been updated:", fetchedTitle);

      const proposedContentItemHash = getContentItemHash(userInputUrl, fetchedTitle);

      console.log("Sending proposeContentItem transaction to blockchain...");
      console.log("... proposeContentItemHash:", proposedContentItemHash);
      console.log("... userInputUrl:", userInputUrl);
      console.log("... fetchedTitle:", fetchedTitle);
      proposeContentItem({
        args: [
          proposedContentItemHash,
          // chainlinkFunctionsRequestSource, // source
          "0x", // user hosted secrets - encryptedSecretsUrls - empty in this example
          0, // don hosted secrets - slot ID - empty in this example
          BigInt(0), // don hosted secrets - version - empty in this example
          [userInputUrl, fetchedTitle], // contentItemArgs
          [], // bytesArgs - arguments can be encoded off-chain to bytes.
          BigInt(chainlinkSubscriptionId),
          chainlinkFunctionsGasLimit,
          chainlinkDONIdHex, // jobId is bytes32 representation of donId
        ],
      });
    }
  }, [fetchedTitle]);

  // Function to handle link clicks
  const handleLinkClick = () => {
    setLinkClicked(true);
  };

  // Function to handle form submission
  // TODO: update to call the back end to verify the answer, (correct or incorrect),
  //       to display the result and, if the selected answer is correct,
  //       to call setContentItemHash.
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedAnswer && contentItemUrl && contentItemTitle) {
      console.log("selectedAnswer:", selectedAnswer);

      if (validateAnswer(selectedAnswer)) {
        console.log("Answer is correct!");
        setContentItemHash(getContentItemHash(contentItemUrl, contentItemTitle));
      } else {
        console.log("Answer is incorrect!");
      }
    }
  };

  const handleEndEpoch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Calling endEpoch...");
    endEpoch();
  };

  const validateAnswer = (answer: string): boolean => {
    // TODO: call the back end to verify the answer
    answer;
    return true;
  };

  // Function to fetch a content item from an API
  const getContentItem = () => {
    try {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/functions/v1/contentItemServer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_BACKEND_API_TOKEN}`,
        },
        body: JSON.stringify({ userAddress: address }),
      })
        .then(response => response.json())
        .then(data => {
          setContentItemUrl(data.url);
          setContentItemTitle(data.title);
          setContentItemDescription(data.description || "Read this to improve your financial literacy!");
          setQuestion(data.question);
          setAnswers(data.answers);
        });
    } catch (error) {
      console.error("Error fetching content item:", error);
      console.log("Retrying...");
      getContentItem();
    }
  };

  const getContentItemHash = (url: string, title: string) => {
    return keccak256(stringToBytes(`${url}: ${title}`));
  };

  // Function to handle URL form submission
  const handleUrlSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsTitleFetched(false); // Reset the success flag
    setFetchTitleErrorMessage(""); // Clear any previous error message

    if (!isValidUrl(userInputUrl)) {
      setFetchTitleErrorMessage("Please enter a valid URL.");
      return;
    }

    try {
      getURLTitle();
    } catch (error) {
      console.error("Error fetching title:", error);
      setFetchTitleErrorMessage("An error occurred while fetching the title. Please try again.");
    }
  };

  // Function to validate URL
  const isValidUrl = (urlString: string): boolean => {
    try {
      // TODO: make URL validation more robust
      new URL(urlString); // The URL constructor throws an error for invalid URLs
      return true;
    } catch (error) {
      return false;
    }
  };

  // Function to fetch the title of a URL from an API
  const getURLTitle = () => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/functions/v1/proposedContentTitleGetter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_BACKEND_API_TOKEN}`,
      },
      body: JSON.stringify({ url: userInputUrl }),
    })
      .then(response => response.json())
      .then(data => {
        setFetchedTitle(data.title);
        setIsTitleFetched(true); // Set success flag
      });
  };

  function capitalizeFirstLetter(str: string): string {
    if (str.length === 0) {
      return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function convertTimestampToUTCTimeString(timestamp: number): string {
    const date = new Date(timestamp * 1000);

    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();

    // Format the time components into a string
    // This will display time in HH:MM:SS format
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  useScaffoldEventSubscriber({
    contractName: contractName,
    eventName: "ContentItemConsumed",
    listener: logs => {
      logs.map(log => {
        const { _consumer, _contentItemHash, _signer } = log.args;
        console.log("📡 ContentItemConsumed event", _consumer, _contentItemHash, _signer);
      });
    },
  });
  useScaffoldEventSubscriber({
    contractName: contractName,
    eventName: "ContentItemProposed",
    listener: logs => {
      logs.map(log => {
        const { _proposer, _contentItemHash, _contentItemArgs } = log.args;
        console.log("📡 ContentItemProposed event", _proposer, _contentItemHash, _contentItemArgs);
      });
    },
  });
  useScaffoldEventSubscriber({
    contractName: contractName,
    eventName: "ValidationRequested",
    listener: logs => {
      logs.map(log => {
        const { _requestId, _contentItemHash } = log.args;
        console.log("📡 ValidationRequested event", _requestId, _contentItemHash);
      });
    },
  });
  useScaffoldEventSubscriber({
    contractName: contractName,
    eventName: "FunctionsResponseReceived",
    listener: logs => {
      logs.map(log => {
        const { requestId, response, err } = log.args;
        console.log("📡 Chainlink Functions Response event", requestId, response, err);
      });
    },
  });
  useScaffoldEventSubscriber({
    contractName: contractName,
    eventName: "ValidationResponseReceived",
    listener: logs => {
      logs.map(log => {
        const { _requestId, _contentItemHash, _isContentItemValid } = log.args;
        console.log("📡 ValidationResponseReceived event", _requestId, _contentItemHash, _isContentItemValid);
        notification.error("Proposal rejected.", { icon: "❌" });
      });
    },
  });

  // The return statement of the component, which renders the UI
  // TODO: display a quiz/form with the questions and answers after the user has clicked the link
  //       when the user submits the correct answer, the trackConsumedContent function should be called
  return (
    <div>
      <MetaHeader />
      {/* JSX code to render various parts of the page like links, forms, counters, etc. */}
      <div className="flex items-center flex-col flex-grow pt=10 my-10">
        <h1>Daily Financial Literacy Dapp</h1>
      </div>
      <div className="flex items-center flex-col flex-grow pt=10 my-10">
        <h2>⏳ Epoch Started</h2>
        <div className="p-4 text-4xl">{new Date(Number(epochTimestamp) * 1000).toDateString()}</div>
        <div className="p-4 text-4xl">{convertTimestampToUTCTimeString(Number(epochTimestamp))}</div>
      </div>
      {user && (
        <div>
          <div className="flex flex-col w-full lg:flex-row">
            <div className="grid flex-grow bg-base-300 rounded-box">
              <div className="stats shadow">
                <div className="stat place-items-center">
                  <div className="stat-title">Total Epoch Points</div>
                  <div className="stat-value">{totalEpochPoints?.toString()}</div>
                  <div className="stat-desc">Total points earned in the current epoch</div>
                </div>
                <div className="stat place-items-center">
                  <div className="stat-title">Your Epoch Points</div>
                  <div className="stat-value">{user?.epochPoints.toString()}</div>
                  <div className="stat-desc">Total points earned in the current epoch</div>
                </div>
              </div>
              <div className="stats shadow">
                <div className="stat place-items-center">
                  <div className="stat-title">🤓 Total Items Consumed 📚</div>
                  <div className="stat-value">{totalItemsConsumed?.toString()}</div>
                  <div className="stat-desc">Total items consumed by all users</div>
                </div>
                <div className="stat place-items-center">
                  <div className="stat-title">💰 Total Rewards to Distribute 💸</div>
                  <div className="stat-value">{distributableRewards?.toString()}</div>
                  <div className="stat-desc">Total rewards to distribute in the current epoch</div>
                </div>
              </div>
            </div>
            <div className="divider lg:divider-horizontal"></div>
            <div className="grid flex-grow bg-base-300 rounded-box">
              <div className="flex items-center flex-col flex-grow pt=10 my-10">
                {contentItemUrl && contentItemTitle && contentItemDescription && (
                  <div>
                    <div className="p-4 text-3xl">Read this to earn rewards</div>
                    <ContentItem
                      title={contentItemTitle}
                      description={contentItemDescription}
                      url={contentItemUrl}
                      onClick={handleLinkClick}
                    />
                    {consumeTransactionHash.length > 0 && <p>Success!</p>}
                  </div>
                )}
              </div>
              <div className="flex items-center flex-col flex-grow pt=10 my-10">
                {linkClicked && question && answers.length > 0 && (
                  <div className="card w-96 bg-primary text-primary-content">
                    <div className="card-body">
                      <h2 className="card-title">{question} 🤔</h2>
                      <form onSubmit={handleSubmit} className="flex flex-col items-center">
                        {answers.map((answer, index) => (
                          <label key={index}>
                            <input
                              type="radio"
                              name="answer"
                              value={answer}
                              onChange={e => setSelectedAnswer(e.target.value)}
                              className="radio radio-secondary"
                            />
                            {answer}
                          </label>
                        ))}
                        <div className="card-actions justify-end">
                          <button type="submit" className="btn">
                            Submit Answer
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <></>
          {/* Form for proposing a new content item */}
          <div className="flex items-center flex-col flex-grow pt=10 my-10">
            <div>
              <div className="card w-96 bg-primary text-primary-content">
                <div className="card-body">
                  <h2 className="card-title">Propose</h2>
                  <p>Propose financial literacy and well-being content to earn rewards!</p>
                  <form onSubmit={handleUrlSubmit} className="flex flex-col items-center">
                    <InputBase
                      name="url"
                      placeholder="URL"
                      value={userInputUrl}
                      onChange={setUserInputUrl}
                      error={fetchTitleErrorMessage.length > 0}
                    />
                    <div className="card-actions justify-end">
                      <button type="submit" className="btn my-4">
                        Propose Content
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              {isTitleFetched && <p>Title from URL successfully obtained! Sending to the blockchain...</p>}
              {proposeTransactionHash.length > 0 && <p>Successfully proposed!</p>}
            </div>
            <div className="card w-96 bg-primary text-primary-content my-4">
              <div className="card-body">
                <h2 className="card-title">End Epoch</h2>
                <p>End the epoch to distribute rewards and start a new epoch!</p>
                <form onSubmit={handleEndEpoch} className="flex flex-col items-center">
                  <div className="card-actions justify-end">
                    <button type="submit" className="btn my-4" disabled={!isDistributable}>
                      End Epoch
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {!user && (
        <div className="flex items-center flex-col flex-grow pt=10 my-10">
          <h2>Connect your wallet to get started</h2>
        </div>
      )}
    </div>
  );
};

export default Home;
