import { deployments, ethers } from "hardhat";
import { GaslessNFT } from "../typechain";
import { CallWithERC2771Request, GelatoRelay } from "@gelatonetwork/relay-sdk";

const main = async () => {
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  const SPONSOR_KEY = process.env.SPONSOR_KEY;

  if (!PRIVATE_KEY) throw new Error("PRIVATE_KEY missing in .env");
  if (!SPONSOR_KEY) throw new Error("SPONSOR_KEY missing in .env");

  const wallet = new ethers.Wallet(PRIVATE_KEY, ethers.provider);

  const { address } = await deployments.get("GaslessNFT");
  const nft = (await ethers.getContractAt("GaslessNFT", address)) as GaslessNFT;

  const { data } = await nft.populateTransaction.mint();
  if (!data) throw new Error("Invalid transaction");

  const request: CallWithERC2771Request = {
    target: nft.address,
    data: data,
    chainId: await wallet.getChainId(),
    user: wallet.address,
  };

  const relay = new GelatoRelay();

  const { taskId } = await relay.sponsoredCallERC2771(
    request,
    wallet,
    SPONSOR_KEY
  );

  console.log("https://api.gelato.digital/tasks/status/" + taskId);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
