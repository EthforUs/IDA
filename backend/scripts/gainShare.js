const hre = require("hardhat");
const ethers = hre.ethers;
const { Framework } = require("@superfluid-finance/sdk-core");
const TokenSpreaderJSON = require("../artifacts/contracts/TokenSpreader.sol/TokenSpreader.json");
const TokenSpreaderABI = TokenSpreaderJSON.abi;
require("dotenv").config();
const url = `${process.env.GOERLI_URL}`;
const provider = new ethers.providers.JsonRpcProvider(url);
const deployedTokenSpreaderAddress = process.env.TOKENSPREADER_ADDRESS; // INPUT YOUR OWN DEPLOYED TOKENSPREADER ADDRESS IN .ENV FILE
async function main() {
  // Get signer objects from private key as potential receivers of unit from gainShare
  let alice;
  let bob;
  let carol;
  let mallory;
  [alice, bob, carol, mallory] = await ethers.getSigners();
  const your_private_key_string =
    "f114eb083ee133687f60fa27f6e8a5c83f642a26cdb0c881b69280d65d3c36f1";
  bob = new ethers.Wallet(your_private_key_string, provider);

  let shareGainer = bob; // SELECT FROM ALICE, BOB, CAROL, OR MALLORY at your discretion
  console.log(bob, carol, mallory);
  // Setting up network object - this is set as the goerli url, but can be changed to reflect your RPC URL and network of choice
  const url = `${process.env.GOERLI_URL}`;
  const customHttpProvider = new ethers.providers.JsonRpcProvider(url);
  const network = await customHttpProvider.getNetwork();

  // Getting tokenSpreader contract object
  const tokenSpreader = new ethers.Contract(
    deployedTokenSpreaderAddress,
    TokenSpreaderABI,
    customHttpProvider
  );

  const sf = await Framework.create({
    chainId: network.chainId,
    provider: customHttpProvider,
  });

  // Getting the Goerli fDAIx Super Token object from the Framework object
  // This is fDAIx on goerli - you can change this token to suit your network and desired token address
  const daix = await sf.loadSuperToken("fDAIx");

  console.log("Running gainShare() script...");

  // View shares that shareGainer has
  console.log(
    `Original ${shareGainer.address} units held:`,
    (
      await daix.getSubscription({
        publisher: tokenSpreader.address,
        indexId: await tokenSpreader.INDEX_ID(),
        subscriber: shareGainer.address,
        providerOrSigner: alice,
      })
    ).units
  );

  try {
    // shareGainer will subscribe to tokenSpreader's index so that tokens will successfully go through to them
    // NOTE: if an account is not subscribed, but receives a distribution, its tokens will essentially “hang in limbo” until the account subscribes, after which they will go through
    const subscribeOperation = daix.approveSubscription({
      indexId: await tokenSpreader.INDEX_ID(),
      publisher: tokenSpreader.address,
    });
    await subscribeOperation.exec(shareGainer);
  } catch (err) {
    // if shareGainer already approved subscription, carry on past error
    if (
      err.errorObject.errorObject.error.reason ==
      "execution reverted: IDA: E_SUBS_APPROVED"
    ) {
      console.log("shareGainer already approved subscription. moving on ->");
    }
  }

  // Give shareGainer a share
  const gainShareTx = await tokenSpreader
    .connect(alice)
    .gainShare(shareGainer.address);
  await gainShareTx.wait();

  // View shares that shareGainer has
  console.log(
    `New ${shareGainer.address} units held:`,
    (
      await daix.getSubscription({
        publisher: tokenSpreader.address,
        indexId: await tokenSpreader.INDEX_ID(),
        subscriber: shareGainer.address,
        providerOrSigner: alice,
      })
    ).units
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
