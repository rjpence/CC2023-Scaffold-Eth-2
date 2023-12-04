import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Chainlink Avalanche Fuji details
  // https://docs.chain.link/chainlink-functions/supported-networks#avalanche-fuji-testnet
  const functionsRouterAvalancheFuji = "0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0";
  // const linkTokenAvalancheFuji = "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846";
  // const donIDString = "fun-avalanche-fuji-1";

  await deploy("YourContract", {
    from: deployer,
    // Contract constructor arguments
    // "deployer" is just to have a valid address—to be updated with the actual address of the Chainlink Functions Router
    args: [10, functionsRouterAvalancheFuji],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract
  // const yourContract = await hre.ethers.getContract("YourContract", deployer);
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["YourContract"];
