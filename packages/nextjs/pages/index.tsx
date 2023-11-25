import React, { useCallback, useEffect, useState } from "react";
import type { NextPage } from "next";
import { hashMessage } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { useAccount, useSignMessage } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import { Address } from "~~/components/scaffold-eth/Address";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth/useScaffoldContractRead";

interface ApiResponse {
  url: string;
  title: string;
}

interface SignedDataPayload {
  address: string;
  contentItemHash: string | null;
  signature: string | null;
}

const Home: NextPage = () => {
  const { address } = useAccount();
  const { data: totalReadCount } = useScaffoldContractRead({
    contractName: "YourContract",
    functionName: "readCounter",
  });

  const { data: userReadCount } = useScaffoldContractRead({
    contractName: "YourContract",
    functionName: "userReadCounter",
    args: [address],
  });

  const { writeAsync, isSuccess: userActionIsSuccess } = useScaffoldContractWrite({
    contractName: "YourContract",
    functionName: "userAction",
    // Hardhat dev Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
    // This private key is just for testing purposes--the backend should be signing the message
    account: privateKeyToAccount("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"),
    onBlockConfirmation: txnReceipt => {
      console.log("Transaction hash", txnReceipt.transactionHash);
      setTransactionHash(txnReceipt.transactionHash);
    },
  });

  const [url, setUrl] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [contentItemHash, setContentItemHash] = useState<string>("");
  const [transactionHash, setTransactionHash] = useState<string>("");
  const { data: signedContentItemHash, signMessage } = useSignMessage({ message: contentItemHash });

  // Mock API function
  // TODO: Replace with backend API endpoints
  const mockApi = useCallback(
    async (endpoint: string, payload: SignedDataPayload): Promise<ApiResponse | any> => {
      if (endpoint === "your-api-endpoint") {
        console.log("Calling backend to get content item for address:", payload.address);
        return Promise.resolve({
          url: "https://blog.eras.fyi/blog/everybody-dance-now-starting-saving-in-your-40s",
          title: "Everybody Dance Now: Starting Saving in Your 40s",
          question: "Example Question",
          answers: ["Answer 1", "Answer 2", "Answer 3"],
        });
      } else if (endpoint === "your-different-api-endpoint") {
        console.log("Sending userAction payload to backend to send to the blockchain:", JSON.stringify(payload));
        await writeAsync();
        return Promise.resolve({ success: true });
      }
      throw new Error("Invalid endpoint");
    },
    [writeAsync],
  );

  useEffect(() => {
    if (address) {
      mockApi("your-api-endpoint", { address } as SignedDataPayload).then(data => {
        setUrl(data.url);
        setTitle(data.title);
      });
    }
  }, [address, mockApi]);

  useEffect(() => {
    console.log("contentItemHash has been updated:", contentItemHash);

    // TODO: update to actually send a transaction to the smart contract on the locally-running blockchain
    // TODO: update to expect a blockchain transaction receipt in response
    const sendToBackend = async () => {
      const response = await mockApi("your-different-api-endpoint", {
        address,
        contentItemHash,
        signature: signedContentItemHash,
      } as SignedDataPayload);

      console.log("Response from backend:", response);

      if (response.success) {
        console.log("Success!");
      } else {
        console.error("Error:", response.error);
        throw response.error;
      }
    };

    try {
      console.log("Signing contentItemHash...");
      signMessage();

      console.log("Sending signed message to backend...");
      sendToBackend();
    } catch (error) {
      console.error("Error signing message:", error);
    }
  }, [contentItemHash, signedContentItemHash, signMessage, address, mockApi]);

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
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                setContentItemHash(hashMessage(`${url}: ${title}`));
              }}
            >
              {`"${title}"`}
            </a>
            {/* TODO: Replace signature with the transaction hash received from the backend */}
            {userActionIsSuccess && <div>Success! Transaction Hash: {transactionHash}</div>}
          </div>
        )}
      </div>
      <div className="flex items-center flex-col flex-grow pt=10">Total Reads</div>
      <div className="flex items-center flex-col flex-grow pt=10">
        <div className="p-4 text-4xl">{totalReadCount?.toString()}</div>
      </div>
      <div className="flex items-center flex-col flex-grow pt=10">Financial Literacy Tracker</div>
      <div className="flex items-center flex-col flex-grow pt=10">
        <Address address={address} />
        <div className="p-4 text-4xl">{userReadCount?.toString()}</div>
      </div>
      <></>
    </div>
  );
};

export default Home;
