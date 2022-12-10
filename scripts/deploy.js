function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function sleep() {
  return await timeout(10000);
}

function save(chainId, name, value) {
  const fs = require("fs");

  const filename = "../zola-addresses/" + chainId + ".json";

  const data = fs.existsSync(filename)
    ? JSON.parse(fs.readFileSync(filename, "utf8"))
    : {};

  data[name] = value;

  fs.writeFileSync(filename, JSON.stringify(data, null, 4));
}

async function deploy(name, args = []) {
  const signers = await ethers.getSigners();
  const nonce = await ethers.provider.getTransactionCount(signers[0]._address);
  const { chainId } = await ethers.provider.getNetwork();
  const Token = await ethers.getContractFactory(name);
  const finalArgs = [...args, { nonce }];
  const token = await Token.deploy.apply(Token, finalArgs);

  save(chainId, name, token.address);
  console.log(
    "deployed ",
    name,
    "args",
    args,
    "contract address: ",
    token.address
  );
  await sleep();
  return token.address;
}

async function main() {
  // We get the contract to deploy

  const signers = await ethers.getSigners();

  const { chainId } = await ethers.provider.getNetwork();

  save(chainId, "owner", signers[0]._address);

  // usage is here
  //https://github.com/astro-swap/astro-swap-interface/blob/dev/src/constants/multicall/index.ts

  //const Multicall = await deploy("Multicall2");
  // const ZolaToken = await deploy("ZolaToken");
  // const AdaToken = await deploy("AdaToken");

  // const WVLX = await deploy("WVLX");

  // const admins = JSON.parse(
  //   require("fs").readFileSync("../astro-addresses/admins.json", "utf8")
  // );

  // const defaultTokens = admins.defaultTokens[chainId.toString()];

  // const ZolaToken = admins.tokens[chainId.toString()].zola;
  // const AdaToken = admins.tokens[chainId.toString()].ada;
  // const WVLX = admins.tokens[chainId.toString()].wvlx;
  // save(chainId, "ZolaToken", ZolaToken);
  // save(chainId, "AdaToken", AdaToken);
  // save(chainId, "WVLX", WVLX);

  // //deplay WETH, BUSD, USDT, USDC
  // for (var i = 0; i < defaultTokens.length; i++) {
  //   await deploy(defaultTokens[i]);
  // }

  const ZolaToken = "0x8a226293bC6f697A681B0b29f825c149655fEC2d";

  const ZolaStake = await deploy("ZolaStake", [ZolaToken]);

  const _cakePerSecond = "13000000000000000000";

  //const blockNumber = await ethers.provider.getBlockNumber();

  // const _startTimestamp = parseInt(new Date().getTime() / 1000);
  // const _endTimestamp = _startTimestamp + 3600 * 24 * 365;
  const _startTimestamp = 1643464800;
  const _endTimestamp = _startTimestamp + 3600 * 24 * 365;
  const _devaddr = "0x0eFf70b92e1aDF79830dEA6f4EEA015CaD4f8483";
  //const bonusPeriodSeconds = 10000
  //const bonusEndTimestamp = _startTimestamp + bonusPeriodSeconds
  //const vlxStakingRewardPerSecond = '42000000000000000'

  //Timelock
  const Timelock = await deploy("Timelock", [_devaddr, 21700]);

  const ZolaFarm = await deploy("ZolaFarm", [
    ZolaToken,
    ZolaStake,
    _devaddr,
    _cakePerSecond,
    _startTimestamp,
    _endTimestamp,
  ]);

  const ZolaVault = await deploy("ZolaVault", [
    ZolaToken,
    ZolaStake,
    ZolaFarm,
    _devaddr,
    _devaddr,
  ]);

  await deploy("VaultOwner", [ZolaVault]);

  //await deploy("VLXStaking", [WVLX, ZolaToken, vlxStakingRewardPerSecond, _startTimestamp, bonusEndTimestamp, _devaddr, WVLX]);

  // await deploy("ZolaStakingFactory");

  //MasterChef _chef, IBEP20 _astro, address _admin, address _receiver
  //const LotteryRewardPool = await deploy("LotteryRewardPool", [ZolaFarm, WagyuToken, _devaddr, _devaddr]);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
