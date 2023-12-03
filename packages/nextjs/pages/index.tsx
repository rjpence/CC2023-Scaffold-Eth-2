// Importing necessary modules and components from libraries and other files
import React, { useEffect, useState } from "react";
// React library for building user interfaces
import type { NextPage } from "next";
// Next.js types for typing components
import { createPublicClient, http, keccak256, stringToBytes } from "viem";
// Viem library functions for blockchain interactions
import { hardhat } from "viem/chains";
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

// Creating a functional component for the homepage
const Home: NextPage = () => {
  // State management hooks to store different pieces of information
  const { address } = useAccount(); // Retrieves the current user's blockchain address
  const contractName = "YourContract"; // Name of the smart contract to interact with
  // Hooks to read data from the deployed contract using its name
  const { data: deployedContractData } = useDeployedContractInfo(contractName);
  const { data: totalReadCount } = useScaffoldContractRead({
    contractName: contractName,
    functionName: "readCounter",
  });

  const { data: userReadCount } = useScaffoldContractRead({
    contractName: contractName,
    functionName: "userReadCounter",
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
    args: [undefined, undefined, undefined],
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

  // useEffect hooks are used to perform side effects in the component, like API calls, data fetching, etc.
  useEffect(() => {
    // Make sure the address is available before making the API call
    if (address && contentItemUrl.length === 0 && contentItemTitle.length === 0) getContentItem(); // Fetch content item if the address is available
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

        // TODO: move API URL to .env file
        fetch("http://localhost:50321/functions/v1/contentConsumptionProver", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0`,
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
          chain: hardhat,
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

      const proposeContentItemHash = getContentItemHash(userInputUrl, fetchedTitle);

      console.log("Sending proposeContentItem transaction to blockchain...");
      console.log("... proposeContentItemHash:", proposeContentItemHash);
      console.log("... userInputUrl:", userInputUrl);
      console.log("... fetchedTitle:", fetchedTitle);
      writeAsync({ args: [proposeContentItemHash, userInputUrl, fetchedTitle] });
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
      // TODO: move API URL to .env file
      fetch("http://localhost:50321/functions/v1/contentItemServer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // TODO: move bearer token to .env file
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0`,
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
    // TODO: move API URL to .env file
    fetch("http://localhost:50321/functions/v1/proposedContentTitleGetter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // TODO: move bearer token to .env file
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0`,
      },
      body: JSON.stringify({ userAddress: address }),
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
        const { _proposer, _contentItemHash, _url, _title } = log.args;
        console.log("📡 ContentItemProposed event", _proposer, _contentItemHash, _url, _title);
      });
    },
  });
  useScaffoldEventSubscriber({
    contractName: contractName,
    eventName: "ValidationRequested",
    listener: logs => {
      logs.map(log => {
        const { _requestId, _contentItemHash } = log.args;
        console.log("📡 ContentItemProposed event", _requestId, _contentItemHash);
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
        <h2>Total Reads</h2>
        {/* </div>
      <div className="flex items-center flex-col flex-grow pt=10"> */}
        <div className="p-4 text-4xl">{totalReadCount?.toString()}</div>
      </div>
      <div className="flex items-center flex-col flex-grow pt=10 my-10">
        <h2>Your Count</h2>
        {/* </div>
      <div className="flex items-center flex-col flex-grow pt=10"> */}
        <Address address={address} />
        <div className="p-4 text-4xl">{userReadCount?.toString()}</div>
      </div>
      <></>
      {/* Form for proposing a new content item */}
      <div className="flex items-center flex-col flex-grow pt=10 my-10">
        <h2>Propose</h2>
        <p>Propose financial literacy and well-being content to earn rewards!</p>
        {/* </div>
      <div className="flex items-center flex-col flex-grow pt=10"> */}
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
