import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const initializeYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const yourContract = await hre.ethers.getContract("YourContract", deployer);
  console.log(`YourContract Address: ${yourContract.address}`);

  const chainlinkFunctionsRequestSource =
    'const url = "https://api.openai.com/v1/chat/completions";\n' +
    'const openAIApiKey = "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";\n' +
    "const contentItemUrl = args[0];\n" +
    "const contentItemTitle = args[1];\n" +
    "const messageContent =\n" +
    "    `Your task is to determine whether, true or false, an item of web content ` +\n" +
    "    `is likely to contain reliable information that improves or promotes financial literacy or financial well-being ` +\n" +
    '    `using only the URL, "${contentItemUrl}", and the title, "${contentItemTitle}", for the web content. ` +\n' +
    "    `You do not need to visit the URL or search online. ` +\n" +
    "    `Return your response as either true or false in JSON. ` +\n" +
    "    `To complete the task: ` +\n" +
    "    `1. Read the URL. ` +\n" +
    "    `2. Determine whether the URL is from a well - known and reputable source—do not guess or make anything up. ` +\n" +
    "    `3. If the URL is not from a known and reputable source or you are unfamiliar with the source, return false. ` +\n" +
    "    `4. If the URL is from a known and reputable source, read the title. ` +\n" +
    "    `5. Determine whether, true or false, the title implies that the web content ` +\n" +
    "    `improves or promotes financial literacy or financial well-being. ` +\n" +
    "    `6. If the title does not imply that the web content improves or promotes ` +\n" +
    "    `financial literacy or financial well-being, return false, otherwise return true.\\n` +\n" +
    "    `Return your response in JSON as true or false.`;\n" +
    "const data = {\n" +
    '  model: "gpt-3.5-turbo-1106",\n' +
    '  response_format: { type: "json_object" },\n' +
    '  messages: [{ role: "system", content: messageContent }],\n' +
    "  max_tokens: 256,\n" +
    "  temperature: 0,\n" +
    "  stream: false\n" +
    "};\n" +
    "\n" +
    "const openAIRequest = Functions.makeHttpRequest({\n" +
    "    url: url,\n" +
    "    method: 'POST',\n" +
    "    headers: {\n" +
    "        'Content-Type': 'application/json',\n" +
    "        'Authorization': `Bearer ${openAIApiKey}`\n" +
    "    },\n" +
    "    data: data,\n" +
    "});\n" +
    "\n" +
    "const openAIResponse = await openAIRequest;\n" +
    "\n" +
    "if (openAIResponse.error) {\n" +
    "  throw Error(JSON.stringify(openAIResponse));\n" +
    "}\n" +
    "\n" +
    "const openAIResponseContent = JSON.parse(openAIResponse.data.choices[0].message.content);\n" +
    "\n" +
    'const isValid = Object.values(openAIResponseContent)[0] === "true" ? 1 : 0;\n' +
    "\n" +
      "return Functions.encodeUint256(isValid);";
    
    const response = await yourContract.functions.setChainlinkFunctionsSource(chainlinkFunctionsRequestSource);
    const receipt = await response.wait();
    console.log(`Transaction receipt: ${receipt}`);

};

export default initializeYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
initializeYourContract.tags = ["Init"];
