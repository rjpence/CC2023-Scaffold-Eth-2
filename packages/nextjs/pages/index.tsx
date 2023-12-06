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
// Wagmi hooks for wallet account management and message signing
import { MetaHeader } from "~~/components/MetaHeader";
import { InputBase, getParsedError } from "~~/components/scaffold-eth";
// Custom component for the meta header
import { Address } from "~~/components/scaffold-eth/Address";
// Custom component to display blockchain addresses
import { useDeployedContractInfo, useScaffoldContractWrite, useScaffoldEventSubscriber } from "~~/hooks/scaffold-eth";
// Hook to get information about deployed contracts
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth/useScaffoldContractRead";
import deployedContracts from "~~/contracts/deployedContracts";
import { notification } from "~~/utils/scaffold-eth";

// Creating a functional component for the homepage
const Home: NextPage = () => {
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
  const _publicClient = createPublicClient({
          chain: hardhat,
          transport: http(),
  });
  const yourContract = deployedContracts["43113"].YourContract;
  const getEvents = async () => {
    const events = await _publicClient.getContractEvents({
      abi: yourContract.abi,
      address: yourContract.address,
      fromBlock: 28324189n,
      toBlock: 28326189n,
    });
    return events;
  }
  
  const pointsUIMultiplier = 10; // Multiplier to convert points to UI units
  // State management hooks to store different pieces of information
  const { address } = useAccount(); // Retrieves the current user's blockchain address
  const contractName = "YourContract"; // Name of the smart contract to interact with
  // Hooks to read data from the deployed contract using its name
  const { data: deployedContractData } = useDeployedContractInfo(contractName);
  const { data: totalPoints } = useScaffoldContractRead({
    contractName: contractName,
    functionName: "totalPoints",
  });
  const { data: totalItemsConsumed } = useScaffoldContractRead({
    contractName: contractName,
    functionName: "totalItemsConsumed",
  });

  const { data: totalUserPoints } = useScaffoldContractRead({
    contractName: contractName,
    functionName: "points",
    args: [address],
  });

  // More state management hooks for various pieces of data
  const [contentItemUrl, setContentItemUrl] = useState<string>("");
  // ... (similar useState declarations for other pieces of data like title, question, etc.)
  const [contentItemTitle, setContentItemTitle] = useState<string>("");
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

  // Variables for proposing a new content item
  const [userInputUrl, setUserInputUrl] = useState<string>("");
  const [fetchedTitle, setFetchedTitle] = useState<string>("");
  const [isTitleFetched, setIsTitleFetched] = useState<boolean>(false);
  const [fetchTitleErrorMessage, setFetchTitleErrorMessage] = useState<string>("");
  const [proposeTransactionHash, setProposeTransactionHash] = useState<string>("");
  const { writeAsync } = useScaffoldContractWrite({
    contractName: contractName,
    functionName: "extProposeContentItem",
    args: [
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    ],
    onBlockConfirmation: txnReceipt => {
      console.log("proposeContentItem transaction confirmed:", txnReceipt.transactionHash);
      setProposeTransactionHash(txnReceipt.transactionHash);
      console.log("Transaction blockHash", txnReceipt.blockHash);
    },
    onError: error => {
      const message = getParsedError(error);
      const capitalizedMessage = capitalizeFirstLetter(message);
      setFetchTitleErrorMessage(capitalizedMessage);
    },
  });
  const chainlinkDONIdHex = "0x66756e2d6176616c616e6368652d66756a692d31000000000000000000000000";
  const chainlinkSubscriptionId = 1632;
  const chainlinkFunctionsGasLimit = 300000;
  const chainlinkFunctionsRequestSource =
  'const url = "https://api.openai.com/v1/chat/completions";\n' +
  'const openAIApiKey = "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";\n' +
  'const contentItemUrl = args[0];\n' +
  'const contentItemTitle = args[1];\n' +
  'const messageContent =\n' +
  '    `Your task is to determine whether, true or false, an item of web content ` +\n' +
  '    `is likely to contain reliable information that improves or promotes financial literacy or financial well-being ` +\n' +
  '    `using only the URL, "${contentItemUrl}", and the title, "${contentItemTitle}", for the web content. ` +\n' +
  '    `You do not need to visit the URL or search online. ` +\n' +
  '    `Return your response as either true or false in JSON. ` +\n' +
  '    `To complete the task: ` +\n' +
  '    `1. Read the URL. ` +\n' +
  '    `2. Determine whether the URL is from a well - known and reputable source—do not guess or make anything up. ` +\n' +
  '    `3. If the URL is not from a known and reputable source or you are unfamiliar with the source, return false. ` +\n' +
  '    `4. If the URL is from a known and reputable source, read the title. ` +\n' +
  '    `5. Determine whether, true or false, the title implies that the web content ` +\n' +
  '    `improves or promotes financial literacy or financial well-being. ` +\n' +
  '    `6. If the title does not imply that the web content improves or promotes ` +\n' +
  '    `financial literacy or financial well-being, return false, otherwise return true.\\n` +\n' +
  '    `Return your response in JSON as true or false.`;\n' +
  'const data = {\n' +
  '  model: "gpt-3.5-turbo-1106",\n' +
  '  response_format: { type: "json_object" },\n' +
  '  messages: [{ role: "system", content: messageContent }],\n' +
  '  max_tokens: 256,\n' +
  '  temperature: 0,\n' +
  '  stream: false\n' +
  '};\n' +
  '\n' +
  'const openAIRequest = Functions.makeHttpRequest({\n' +
  '    url: url,\n' +
  "    method: 'POST',\n" +
  '    headers: {\n' +
  "        'Content-Type': 'application/json',\n" +
  "        'Authorization': `Bearer ${openAIApiKey}`\n" +
  '    },\n' +
  '    data: data,\n' +
  '});\n' +
  '\n' +
  'const openAIResponse = await openAIRequest;\n' +
  '\n' +
  'if (openAIResponse.error) {\n' +
  '  throw Error(JSON.stringify(openAIResponse));\n' +
  '}\n' +
  '\n' +
  'const openAIResponseContent = JSON.parse(openAIResponse.data.choices[0].message.content);\n' +
  '\n' +
  'const isValid = Object.values(openAIResponseContent)[0] === "true" ? 1 : 0;\n' +
  '\n' +
  'return Functions.encodeUint256(isValid);';

  // useEffect hooks are used to perform side effects in the component, like API calls, data fetching, etc.
  useEffect(() => {
    // Make sure the address is available before making the API call
    if (address && contentItemUrl.length === 0 && contentItemTitle.length === 0) getContentItem(); // Fetch content item if the address is available
    const events = getEvents();
    console.log("EVENTS FROM THE LIVE TESTNET:\n", events);
  }, [address]); // This effect runs whenever 'address' changes

  // ... (other useEffect hooks for different actions like signing messages, sending transactions, etc.)
  useEffect(() => {
    if (contentItemHash.length > 0) {
      console.log("contentItemHash has been updated:", contentItemHash);

      signMessage();
    }
  }, [contentItemHash]);

  useEffect(() => {
    if (signedContentItemHash && signedContentItemHash.length > 0) {
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
    if (transactionSignature.length > 0) {
      console.log("transactionSignature has been updated:", transactionSignature);
      const sendUserActionTransaction = async () => {
        console.log("Sending signed userAction transaction...");

        const publicClient = createPublicClient({
          chain: getChain(process.env.NEXT_PUBLIC_CHAIN_NAME as string),
          transport: http(),
        });

        const userActionTransactionHash = await publicClient.sendRawTransaction({
          serializedTransaction: transactionSignature as `0x${string}`,
        });

        console.log("userActionTransactionHash:", userActionTransactionHash);

        setConsumeTransactionHash(userActionTransactionHash);
      };
      sendUserActionTransaction();
    }
  }, [transactionSignature]);

  useEffect(() => {
    if (consumeTransactionHash.length > 0) {
      console.log("transactionHash has been updated:", consumeTransactionHash);
      getContentItem();
      setLinkClicked(false);
    }
  }, [consumeTransactionHash]);

  useEffect(() => {
    if (fetchedTitle.length > 0) {
      console.log("fetchedTitle has been updated:", fetchedTitle);

      const proposedContentItemHash = getContentItemHash(userInputUrl, fetchedTitle);

      console.log("Sending proposeContentItem transaction to blockchain...");
      console.log("... proposeContentItemHash:", proposedContentItemHash);
      console.log("... userInputUrl:", userInputUrl);
      console.log("... fetchedTitle:", fetchedTitle);
      writeAsync({
        args: [
          proposedContentItemHash,
          chainlinkFunctionsRequestSource, // source
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
    eventName: "Response",
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
  useScaffoldEventSubscriber({
    contractName: contractName,
    eventName: "ValidProposalRewarded",
    listener: logs => {
      logs.map(log => {
        const { _proposer, _contentItemHash, _proposalReward, _totalProposerPoints } = log.args;
        console.log("📡 ValidationResponseReceived event", _proposer, _contentItemHash, _proposalReward, _totalProposerPoints);
        notification.success(`Proposal accepted! You earned ${_proposalReward} points!`, { icon: "🎉" });
      });
    },
  });

  // The return statement of the component, which renders the UI
  // TODO: display a quiz/form with the questions and answers after the user has clicked the link
  //       when the user submits the correct answer, the userAction function should be called
  return (
    <div>
      <MetaHeader />
      {/* JSX code to render various parts of the page like links, forms, counters, etc. */}
      <div className="flex items-center flex-col flex-grow pt=10 my-10">
        <h1>Financial Literacy Dapp</h1>
      </div>
      <div className="flex items-center flex-col flex-grow pt=10 my-10">
        {contentItemUrl && contentItemTitle && (
          <div>
            Read this to earn rewards:{" "}
            <a href={contentItemUrl} target="_blank" rel="noopener noreferrer" onClick={handleLinkClick}>
              {contentItemTitle}
            </a>
            {consumeTransactionHash.length > 0 && <div>Success! Transaction Hash: {consumeTransactionHash}</div>}
          </div>
        )}
      </div>
      <div className="flex items-center flex-col flex-grow pt=10 my-10">
        {linkClicked && question && answers.length > 0 && (
          <form onSubmit={handleSubmit} className="flex flex-col items-center">
            <h2>{question}</h2>
            {answers.map((answer, index) => (
              <label key={index}>
                <input
                  type="radio"
                  name="answer"
                  value={answer}
                  onChange={e => setSelectedAnswer(e.target.value)}
                  className="radio radio-accent"
                />
                {answer}
              </label>
            ))}
            <button type="submit" className="btn btn-outline btn-primary">
              Submit Answer
            </button>
          </form>
        )}
      </div>
      <div className="flex items-center flex-col flex-grow pt=10 my-10">
        <h2>🤓 Total Items Consumed 📚</h2>
        <div className="p-4 text-4xl">{totalItemsConsumed?.toString()}</div>
      </div>
      <div className="flex items-center flex-col flex-grow pt=10 my-10">
        <h2>Total Points</h2>
        <div className="p-4 text-4xl">{Number(totalPoints) * pointsUIMultiplier}</div>
      </div>
      <div className="flex items-center flex-col flex-grow pt=10 my-10">
        <h2>Your Points</h2>
        <Address address={address} />
        <div className="p-4 text-4xl">{Number(totalUserPoints) * pointsUIMultiplier}</div>
      </div>
      <></>
      {/* Form for proposing a new content item */}
      <div className="flex items-center flex-col flex-grow pt=10 my-10">
        <h2>Propose</h2>
        <p>Propose financial literacy and well-being content to earn rewards!</p>
        <form onSubmit={handleUrlSubmit} className="flex flex-col items-center">
          <InputBase
            name="url"
            placeholder="URL"
            value={userInputUrl}
            onChange={setUserInputUrl}
            error={fetchTitleErrorMessage.length > 0}
          />
          <button type="submit" className="btn btn-primary my-4">
            Propose Content
          </button>
        </form>
        {isTitleFetched && <p>Title from URL successfully obtained! Sending to the blockchain...</p>}
        {proposeTransactionHash.length > 0 && <p>Successfully proposed! Transaction Hash: {proposeTransactionHash}</p>}
        {fetchTitleErrorMessage && <p>{fetchTitleErrorMessage}</p>}
      </div>
    </div>
  );
};

export default Home;
