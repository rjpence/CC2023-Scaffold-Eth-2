// Importing necessary modules and components from libraries and other files
import React, { useEffect, useState } from "react";
// React library for building user interfaces
import type { NextPage } from "next";
// Next.js types for typing components
import { Hex, createWalletClient, hashMessage, http, recoverMessageAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
// Viem library functions for blockchain interactions
import { hardhat } from "viem/chains";
// Importing a specific blockchain environment from Viem
import { useAccount } from "wagmi";
// Wagmi hooks for wallet account management and message signing
import { MetaHeader } from "~~/components/MetaHeader";
// Custom component for the meta header
import { Address } from "~~/components/scaffold-eth/Address";
// Custom component to display blockchain addresses
import { useDeployedContractInfo, useScaffoldEventSubscriber } from "~~/hooks/scaffold-eth";
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
  const [url, setUrl] = useState<string>("");
  // ... (similar useState declarations for other pieces of data like title, question, etc.)
  const [title, setTitle] = useState<string>("");
  const [question, setQuestion] = useState<string>("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [contentItemHash, setContentItemHash] = useState<string>("");
  const [transactionHash, setTransactionHash] = useState<string>("");
  const [transactionSignature, setTransactionSignature] = useState<string>("");
  // Hook to sign a message (blockchain transaction) with the user's private key
  // const { data: signedContentItemHash, signMessage } = useSignMessage({ message: { raw: contentItemHash } });
  const [signedContentItemHash, setSignedContentItemHash] = useState<Hex>(`0x${""}`);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [linkClicked, setLinkClicked] = useState<boolean>(false);

  const userWalletClient = createWalletClient({
    transport: http(),
    chain: hardhat,
  });

  useScaffoldEventSubscriber({
    contractName: "YourContract",
    eventName: "Blerg",
    // The listener function is called whenever a GreetingChange event is emitted by the contract.
    // Parameters emitted by the event can be destructed using the below example
    // for this example: event GreetingChange(address greetingSetter, string newGreeting, bool premium, uint256 value);
    listener: logs => {
      logs.map(log => {
        const { _signer, _user, _contentItemHash: cih } = log.args;
        console.log("Blerg Event!!!!!!!!!!!!!!");
        console.log("Signer:", _signer);
        console.log("User:", _user);
        console.log("Content Item Hash:", cih);
      });
    },
  });

  // useEffect hooks are used to perform side effects in the component, like API calls, data fetching, etc.
  useEffect(() => {
    // Make sure the address is available before making the API call
    if (address) getContentItem(); // Fetch content item if the address is available
  }, [address]); // This effect runs whenever 'address' changes

  // ... (other useEffect hooks for different actions like signing messages, sending transactions, etc.)
  useEffect(() => {
    console.log("contentItemHash has been updated:", contentItemHash);

    // TODO: determine how to get user to sign message with their wallet in the browser
    // NOTE: Randy, to run this on your machine, you will need to add a `.env.local` file to the `packages/nextjs` directory and add the following line:
    // NEXT_PUBLIC_USER_PRIVATE_KEY=your_private_key_here
    // WE WILL NOT DO THIS IN PRODUCTION, THIS IS JUST FOR TESTING PURPOSES
    const signMessage = async () => {
      console.log("Signing contentItemHash,", contentItemHash, "with userWalletClient:", address);
      const signedMessage = await userWalletClient.signMessage({
        account: privateKeyToAccount(process.env.NEXT_PUBLIC_USER_PRIVATE_KEY as `0x${string}`),
        message: { raw: contentItemHash as `0x${string}` },
      });

      setSignedContentItemHash(signedMessage);
    };

    signMessage();
  }, [contentItemHash]);

  useEffect(() => {
    const blerg = async () => {
      return await recoverMessageAddress({
        message: { raw: contentItemHash as `0x${string}` },
        signature: signedContentItemHash as `0x${string}`,
      });
    };

    try {
      console.log("Signing contentItemHash...");

      console.log("Signer is:", blerg());

      console.log("Sending signed message to backend...");

      console.log("Signed contentItemHash:", signedContentItemHash);

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
  }, [signedContentItemHash, address, deployedContractData]);

  useEffect(() => {
    console.log("transactionSignature has been updated:", transactionSignature);
    const sendUserActionTransaction = async () => {
      console.log("Sending signed userAction transaction...");

      // const client = createPublicClient({
      //   chain: hardhat,
      //   transport: http(),
      // });

      const userActionTransactionHash = await userWalletClient.sendRawTransaction({
        serializedTransaction: transactionSignature as `0x${string}`,
      });

      console.log("userActionTransactionHash:", userActionTransactionHash);

      setTransactionHash(userActionTransactionHash);
    };

    sendUserActionTransaction();
  }, [transactionSignature]);

  useEffect(() => {
    console.log("transactionHash has been updated:", transactionHash);
    getContentItem();
    setLinkClicked(false);
  }, [transactionHash]);

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
    if (selectedAnswer) {
      console.log("selectedAnswer:", selectedAnswer);

      setContentItemHash(hashMessage(`${selectedAnswer}`));
    }
  };

  // Function to fetch a content item from an API
  const getContentItem = () => {
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
        setUrl(data.url);
        setTitle(data.title);
        setQuestion(data.question);
        setAnswers(data.answers);
      });
  };

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
        {url && title && (
          <div>
            Read this to earn rewards:{" "}
            <a href={url} target="_blank" rel="noopener noreferrer" onClick={handleLinkClick}>
              {title}
            </a>
            {transactionHash.length > 0 && <div>Success! Transaction Hash: {transactionHash}</div>}
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
      <div className="flex items-center flex-col flex-grow pt=10">Total Reads</div>
      <div className="flex items-center flex-col flex-grow pt=10">
        <div className="p-4 text-4xl">{totalReadCount?.toString()}</div>
      </div>
      <div className="flex items-center flex-col flex-grow pt=10">Your Contract</div>
      <div className="flex items-center flex-col flex-grow pt=10">
        <Address address={address} />
        <div className="p-4 text-4xl">{userReadCount?.toString()}</div>
      </div>
      <></>
    </div>
  );
};

export default Home;
