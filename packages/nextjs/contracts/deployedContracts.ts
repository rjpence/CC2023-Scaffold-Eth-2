/**
 * This file is autogenerated by Scaffold-ETH.
 * You should not edit it manually or your changes might be overwritten.
 */
import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

const deployedContracts = {
  31337: {
    YourContract: {
      address: "0x4039De7C4bAa31b0F93ad232c656DC3e8387AE7a",
      abi: [
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_proposalReward",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "router",
              type: "address",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          inputs: [],
          name: "EmptyArgs",
          type: "error",
        },
        {
          inputs: [],
          name: "EmptySecrets",
          type: "error",
        },
        {
          inputs: [],
          name: "EmptySource",
          type: "error",
        },
        {
          inputs: [],
          name: "NoInlineSecrets",
          type: "error",
        },
        {
          inputs: [],
          name: "OnlyRouterCanFulfill",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "requestId",
              type: "bytes32",
            },
          ],
          name: "UnexpectedRequestID",
          type: "error",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "string",
              name: "_source",
              type: "string",
            },
          ],
          name: "ChainlinkFunctionsSourceChanged",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "_consumer",
              type: "address",
            },
            {
              indexed: true,
              internalType: "bytes32",
              name: "_contentItemHash",
              type: "bytes32",
            },
            {
              indexed: false,
              internalType: "address",
              name: "_signer",
              type: "address",
            },
          ],
          name: "ContentItemConsumed",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "_proposer",
              type: "address",
            },
            {
              indexed: true,
              internalType: "bytes32",
              name: "_contentItemHash",
              type: "bytes32",
            },
            {
              indexed: false,
              internalType: "string[]",
              name: "_contentItemArgs",
              type: "string[]",
            },
          ],
          name: "ContentItemProposed",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "to",
              type: "address",
            },
          ],
          name: "OwnershipTransferRequested",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "to",
              type: "address",
            },
          ],
          name: "OwnershipTransferred",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint256",
              name: "_proposalReward",
              type: "uint256",
            },
          ],
          name: "ProposalRewardChanged",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "bytes32",
              name: "id",
              type: "bytes32",
            },
          ],
          name: "RequestFulfilled",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "bytes32",
              name: "id",
              type: "bytes32",
            },
          ],
          name: "RequestSent",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "bytes32",
              name: "requestId",
              type: "bytes32",
            },
            {
              indexed: false,
              internalType: "bytes",
              name: "response",
              type: "bytes",
            },
            {
              indexed: false,
              internalType: "bytes",
              name: "err",
              type: "bytes",
            },
          ],
          name: "Response",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "_proposer",
              type: "address",
            },
            {
              indexed: true,
              internalType: "bytes32",
              name: "_contentItemHash",
              type: "bytes32",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_proposalReward",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_totalProposerPoints",
              type: "uint256",
            },
          ],
          name: "ValidProposalRewarded",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "bytes32",
              name: "_requestId",
              type: "bytes32",
            },
            {
              indexed: true,
              internalType: "bytes32",
              name: "_contentItemHash",
              type: "bytes32",
            },
          ],
          name: "ValidationRequested",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "bytes32",
              name: "_requestId",
              type: "bytes32",
            },
            {
              indexed: true,
              internalType: "bytes32",
              name: "_contentItemHash",
              type: "bytes32",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "_isContentItemValid",
              type: "bool",
            },
          ],
          name: "ValidationResponseReceived",
          type: "event",
        },
        {
          inputs: [],
          name: "acceptOwnership",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "chainlinkFunctionsSource",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "_contentItemHash",
              type: "bytes32",
            },
            {
              internalType: "bytes",
              name: "_encryptedSecretsUrls",
              type: "bytes",
            },
            {
              internalType: "uint8",
              name: "_donHostedSecretsSlotID",
              type: "uint8",
            },
            {
              internalType: "uint64",
              name: "_donHostedSecretsVersion",
              type: "uint64",
            },
            {
              internalType: "string[]",
              name: "_contentItemArgs",
              type: "string[]",
            },
            {
              internalType: "bytes[]",
              name: "_bytesArgs",
              type: "bytes[]",
            },
            {
              internalType: "uint64",
              name: "_subscriptionId",
              type: "uint64",
            },
            {
              internalType: "uint32",
              name: "_gasLimit",
              type: "uint32",
            },
            {
              internalType: "bytes32",
              name: "_donId",
              type: "bytes32",
            },
          ],
          name: "extProposeContentItem",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "requestId",
              type: "bytes32",
            },
            {
              internalType: "bytes",
              name: "response",
              type: "bytes",
            },
            {
              internalType: "bytes",
              name: "err",
              type: "bytes",
            },
          ],
          name: "handleOracleFulfillment",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          name: "hashesToProposers",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "owner",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "points",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "proposalReward",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          name: "requestIdsToHashes",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "s_lastError",
          outputs: [
            {
              internalType: "bytes",
              name: "",
              type: "bytes",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "s_lastRequestId",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "s_lastResponse",
          outputs: [
            {
              internalType: "bytes",
              name: "",
              type: "bytes",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "string",
              name: "_source",
              type: "string",
            },
          ],
          name: "setChainlinkFunctionsSource",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_proposalReward",
              type: "uint256",
            },
          ],
          name: "setProposalReward",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "totalItemsConsumed",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "totalPoints",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
          ],
          name: "transferOwnership",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_user",
              type: "address",
            },
            {
              internalType: "bytes32",
              name: "_contentItemHash",
              type: "bytes32",
            },
            {
              internalType: "bytes",
              name: "_signedContentItemHash",
              type: "bytes",
            },
          ],
          name: "userAction",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
    },
  },
  43113: {
    YourContract: {
      address: "0x9318fFf8C5Bd8ff92c49a501B9981721528496e9",
      abi: [
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_proposalReward",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "router",
              type: "address",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          inputs: [],
          name: "EmptyArgs",
          type: "error",
        },
        {
          inputs: [],
          name: "EmptySecrets",
          type: "error",
        },
        {
          inputs: [],
          name: "EmptySource",
          type: "error",
        },
        {
          inputs: [],
          name: "NoInlineSecrets",
          type: "error",
        },
        {
          inputs: [],
          name: "OnlyRouterCanFulfill",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "requestId",
              type: "bytes32",
            },
          ],
          name: "UnexpectedRequestID",
          type: "error",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "_consumer",
              type: "address",
            },
            {
              indexed: true,
              internalType: "bytes32",
              name: "_contentItemHash",
              type: "bytes32",
            },
            {
              indexed: false,
              internalType: "address",
              name: "_signer",
              type: "address",
            },
          ],
          name: "ContentItemConsumed",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "_proposer",
              type: "address",
            },
            {
              indexed: true,
              internalType: "bytes32",
              name: "_contentItemHash",
              type: "bytes32",
            },
            {
              indexed: false,
              internalType: "string[]",
              name: "_contentItemArgs",
              type: "string[]",
            },
          ],
          name: "ContentItemProposed",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "to",
              type: "address",
            },
          ],
          name: "OwnershipTransferRequested",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "to",
              type: "address",
            },
          ],
          name: "OwnershipTransferred",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint256",
              name: "_proposalReward",
              type: "uint256",
            },
          ],
          name: "ProposalRewardChanged",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "bytes32",
              name: "id",
              type: "bytes32",
            },
          ],
          name: "RequestFulfilled",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "bytes32",
              name: "id",
              type: "bytes32",
            },
          ],
          name: "RequestSent",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "bytes32",
              name: "requestId",
              type: "bytes32",
            },
            {
              indexed: false,
              internalType: "bytes",
              name: "response",
              type: "bytes",
            },
            {
              indexed: false,
              internalType: "bytes",
              name: "err",
              type: "bytes",
            },
          ],
          name: "Response",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "_proposer",
              type: "address",
            },
            {
              indexed: true,
              internalType: "bytes32",
              name: "_contentItemHash",
              type: "bytes32",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_proposalReward",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_totalProposerPoints",
              type: "uint256",
            },
          ],
          name: "ValidProposalRewarded",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "bytes32",
              name: "_requestId",
              type: "bytes32",
            },
            {
              indexed: true,
              internalType: "bytes32",
              name: "_contentItemHash",
              type: "bytes32",
            },
          ],
          name: "ValidationRequested",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "bytes32",
              name: "_requestId",
              type: "bytes32",
            },
            {
              indexed: true,
              internalType: "bytes32",
              name: "_contentItemHash",
              type: "bytes32",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "_isContentItemValid",
              type: "bool",
            },
          ],
          name: "ValidationResponseReceived",
          type: "event",
        },
        {
          inputs: [],
          name: "acceptOwnership",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "chainlinkFunctionsSource",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "_contentItemHash",
              type: "bytes32",
            },
            {
              internalType: "bytes",
              name: "_encryptedSecretsUrls",
              type: "bytes",
            },
            {
              internalType: "uint8",
              name: "_donHostedSecretsSlotID",
              type: "uint8",
            },
            {
              internalType: "uint64",
              name: "_donHostedSecretsVersion",
              type: "uint64",
            },
            {
              internalType: "string[]",
              name: "_contentItemArgs",
              type: "string[]",
            },
            {
              internalType: "bytes[]",
              name: "_bytesArgs",
              type: "bytes[]",
            },
            {
              internalType: "uint64",
              name: "_subscriptionId",
              type: "uint64",
            },
            {
              internalType: "uint32",
              name: "_gasLimit",
              type: "uint32",
            },
            {
              internalType: "bytes32",
              name: "_donId",
              type: "bytes32",
            },
          ],
          name: "extProposeContentItem",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "requestId",
              type: "bytes32",
            },
            {
              internalType: "bytes",
              name: "response",
              type: "bytes",
            },
            {
              internalType: "bytes",
              name: "err",
              type: "bytes",
            },
          ],
          name: "handleOracleFulfillment",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          name: "hashesToProposers",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "owner",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "points",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "proposalReward",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          name: "requestIdsToHashes",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "s_lastError",
          outputs: [
            {
              internalType: "bytes",
              name: "",
              type: "bytes",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "s_lastRequestId",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "s_lastResponse",
          outputs: [
            {
              internalType: "bytes",
              name: "",
              type: "bytes",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "string",
              name: "_source",
              type: "string",
            },
          ],
          name: "setChainlinkFunctionsSource",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_proposalReward",
              type: "uint256",
            },
          ],
          name: "setProposalReward",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "totalItemsConsumed",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "totalPoints",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
          ],
          name: "transferOwnership",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_user",
              type: "address",
            },
            {
              internalType: "bytes32",
              name: "_contentItemHash",
              type: "bytes32",
            },
            {
              internalType: "bytes",
              name: "_signedContentItemHash",
              type: "bytes",
            },
          ],
          name: "userAction",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
    },
  },
} as const;

export default deployedContracts satisfies GenericContractsDeclaration;
