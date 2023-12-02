import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

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

  const userActionFunction = useScaffoldContractWrite({
    contractName: "YourContract",
    functionName: "userAction",
  });

  return (
    <>
      <MetaHeader />
      <div className="flex items-center flex-col flex-grow pt=10">Total Reads</div>
      <div className="flex items-center flex-col flex-grow pt=10">
        <div className="p-4 text-4xl">{totalReadCount?.toString()}</div>
      </div>
      <div className="flex items-center flex-col flex-grow pt=10">Your Contract</div>
      <div className="flex items-center flex-col flex-grow pt=10">
        <Address address={address} />
        <div className="p-4 text-4xl">{userReadCount?.toString()}</div>
      </div>
      <div>
        <button className="btn btn-primary" onClick={() => userActionFunction.writeAsync()}>
          Send TX
        </button>
      </div>
      <div className="flex items-center flex-col flex-grow pt=10">
        Please enter the url of an article covering financial literacy
      </div>

      <></>
    </>
  );
};
export default Home;
