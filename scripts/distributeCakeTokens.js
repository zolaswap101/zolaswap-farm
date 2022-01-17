function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function sleep() {
  return await timeout(10000);
}

async function mint(address, amount) {
  console.log("mint " + address, amount, "---");
  const signers = await ethers.getSigners();
  console.log("signers ");
  const nonce = await ethers.provider.getTransactionCount(signers[0]._address);
  console.log("nonce", nonce);
  const { chainId } = await ethers.provider.getNetwork();
  console.log("chainId", chainId);
  const data = get(chainId);
  console.log("chainId");
  if (data.AstroToken == null) throw "expected AstroToken";
  console.log("AstroToken", data.AstroToken, address, amount);

  const AstroToken = await ethers.getContractAt("AstroToken", data.AstroToken);

  try {
    const token = await AstroToken["mint(address,uint256)"](address, amount, {
      nonce,
      gasLimit: 9000000,
    });
    console.log("done ", token);
  } catch (err) {
    console.log(err);
  }

  await sleep(3000);
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

async function getAllPoolAddresses(index) {
  const { chainId } = await ethers.provider.getNetwork();

  const data = get(chainId);

  if (data.AstroStakingFactory == null) throw "expected AstroStakingFactory";

  const AstroStakingFactory = await ethers.getContractAt(
    "AstroStakingFactory",
    data.AstroStakingFactory
  );

  var poolAddress = null;

  try {
    poolAddress = await AstroStakingFactory.poolAddresses(index);
  } catch (err) {
    return [];
  }

  const rest = await getAllPoolAddresses(index + 1);

  return [poolAddress, ...rest];
}

async function main() {
  // We get the contract to deploy

  const { chainId } = await ethers.provider.getNetwork();

  if (chainId.toString() === "111") {
    const addreses = await getAllPoolAddresses(0);

    for (var i = 0; i < addreses.length; i++) {
      await mint(addreses[i], "100000000000000000000000");
    }
  }

  const admins = JSON.parse(
    require("fs").readFileSync("../astro-addresses/admins.json", "utf8")
  );

  const airdrop = admins.airdrop[chainId.toString()];

  if (chainId.toString() === "111") {
    for (var i = 0; i < airdrop.length; i++) {
      await mint(airdrop[i], "100000000000000000000000");
    }
  }

  await mint(admins._devaddr, "500000000" + "000000000000000000");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
