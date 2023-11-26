import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import { createPublicClient, hashMessage, http } from "viem";
import { hardhat } from "viem/chains";
import { useAccount, useSignMessage } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import { Address } from "~~/components/scaffold-eth/Address";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth/useScaffoldContractRead";

const Home: NextPage = () => {
  const { address } = useAccount();
  const contractName = "YourContract";
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

  const [url, setUrl] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [question, setQuestion] = useState<string>("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [contentItemHash, setContentItemHash] = useState<string>("");
  const [transactionHash, setTransactionHash] = useState<string>("");
  const [transactionSignature, setTransactionSignature] = useState<string>("");
  const { data: signedContentItemHash, signMessage } = useSignMessage({ message: contentItemHash });
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [linkClicked, setLinkClicked] = useState<boolean>(false);

  useEffect(() => {
    // Make sure the address is available before making the API call
    if (address) getContentItem();
  }, [address]);

  useEffect(() => {
    console.log("contentItemHash has been updated:", contentItemHash);

    try {
      console.log("Signing contentItemHash...");

      signMessage();

      console.log("Sending signed message to backend...");

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
  }, [contentItemHash, signedContentItemHash, address, deployedContractData, signMessage]);

  useEffect(() => {
    console.log("transactionSignature has been updated:", transactionSignature);
    const sendUserActionTransaction = async () => {
      console.log("Sending signed userAction transaction...");

      const client = createPublicClient({
        chain: hardhat,
        transport: http(),
      });

      const userActionTransactionHash = await client.sendRawTransaction({
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

  const handleLinkClick = () => {
    setLinkClicked(true);
  };

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
  // TODO: display a quiz/form with the questions and answers after the user has clicked the link
  //       when the user submits the correct answer, the userAction function should be called
  return (
    <div>
      <MetaHeader />
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
