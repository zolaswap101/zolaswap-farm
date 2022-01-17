function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function sleep() {
  return await timeout(10000);
}

async function createTestFarms(_lpToken) {
  console.log("create farm " + _lpToken);
  const signers = await ethers.getSigners();
  const nonce = await ethers.provider.getTransactionCount(signers[0]._address);
  const { chainId } = await ethers.provider.getNetwork();
  //const blockNumber = await ethers.provider.getBlockNumber();
  const data = get(chainId);

  if (data.AstroFarm == null) throw "expected AstroFarm";

  const AstroFarm = await ethers.getContractAt("AstroFarm", data.AstroFarm);
  const _allocPoint = "100";
  const _withUpdate = true;
  const SousPool = await AstroFarm.add(_allocPoint, _lpToken, _withUpdate, {
    nonce,
    gasLimit: 9000000,
  });
  await sleep();
  return true;
}

function get(chainId) {
  const fs = require("fs");

  const filename = "../astro-addresses/" + chainId + ".json";

  const data = fs.existsSync(filename)
    ? JSON.parse(fs.readFileSync(filename, "utf8"))
    : {};

  return data;
}

async function main() {
  const { chainId } = await ethers.provider.getNetwork();

  const data = get(chainId);

  const admins = JSON.parse(
    require("fs").readFileSync("../astro-addresses/admins.json", "utf8")
  );

  const defaultTokens = admins.defaultTokens[chainId.toString()];

  for (var j = 0; j < defaultTokens.length; j++) {
    const name = "VLX_" + defaultTokens[j] + "_LP";
    await createTestFarms(data[name].pair);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
