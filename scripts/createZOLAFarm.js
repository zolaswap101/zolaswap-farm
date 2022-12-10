const hre = require("hardhat");

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function sleep() {
  return await timeout(10000);
}


async function createTestFarms(_lpToken) {
  console.log("create farm " + _lpToken)
  const signers = await hre.ethers.getSigners();
  const nonce = await hre.ethers.provider.getTransactionCount(signers[0].address)
  const { chainId } = await hre.ethers.provider.getNetwork();
  //const blockNumber = await ethers.provider.getBlockNumber();
  const data = get(chainId)
  const ZOLAFarm = await hre.ethers.getContractAt("ZOLAFarm", data.ZOLAFarm);
  const _allocPoint  = "100"
  const _withUpdate = true
  const SousPool = await ZOLAFarm.add(_allocPoint,_lpToken, _withUpdate, { nonce, gasLimit: 9000000 })
  await sleep()
  return true
}

function get(chainId) {
  const fs = require("fs");

  const filename = '../zola-addresses/' + chainId + '.json'

  const data = fs.existsSync(filename) ? JSON.parse(fs.readFileSync(filename, "utf8")) : {}

  return data;
}

async function main() {

  const { chainId } = await hre.ethers.provider.getNetwork();
  
  const data = get(chainId)

  console.log("data:  ", data)
  
  const name = "MATIC_ZOLA_LP"
  await createTestFarms(data[name].pair);
  
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
