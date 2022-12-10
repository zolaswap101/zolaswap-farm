const hre = require("hardhat");

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function sleep() {
  return await timeout(10000);
}

function save(chainId, name, value) {

  const fs = require("fs");

  const filename = './zola-addresses/' + chainId + '.json'

  console.log("Filename for save:", filename)
  
  const data = fs.existsSync(filename) ? JSON.parse(fs.readFileSync(filename, "utf8")) : {}

  data[name] = value;

  fs.writeFileSync(filename, JSON.stringify(data, null, 4))

}

async function deploy(name, args=[]) {
  const signers = await hre.ethers.getSigners();
  const nonce = await hre.ethers.provider.getTransactionCount(signers[0].getAddress())
  const { chainId } = await hre.ethers.provider.getNetwork();
  const Token = await hre.ethers.getContractFactory(name);
  const finalArgs = [...args, { nonce }] 
  const token = await Token.deploy.apply(Token, finalArgs);
  
  save(chainId, name, token.address); 
  console.log("deployed ", name, "args", args, "contract address: ", token.address);
  await sleep()
  return token.address

}

async function main() {
  // We get the contract to deploy

  const signers = await hre.ethers.getSigners();

  const { chainId } = await hre.ethers.provider.getNetwork();

  save(chainId, "owner", signers[0].address);
  
  // usage is here
  //https://github.com/wagyu-swap/wagyu-swap-interface/blob/dev/src/constants/multicall/index.ts
  
  
  const SKILYNEToken = await deploy("SKILYNEToken");

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
