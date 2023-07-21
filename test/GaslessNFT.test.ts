import { setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { CallWithERC2771Request } from "@gelatonetwork/relay-sdk";
import { deployments, ethers } from "hardhat";
import { sponsoredCallERC2771Local } from "../src/__mock__/relay-sdk";
import { expect } from "chai";
import { GaslessNFT } from "../typechain";

describe("GaslessNFT", () => {
  let nft: GaslessNFT;

  before(async () => {
    await deployments.fixture();

    const { address } = await deployments.get("GaslessNFT");
    nft = (await ethers.getContractAt("GaslessNFT", address)) as GaslessNFT;
    setBalance(address, ethers.utils.parseEther("1"));
  });

  it.only("mint", async () => {
    const [deployer] = await ethers.getSigners();
    const chainId = await deployer.getChainId();

    const { data } = await nft.populateTransaction.mint();
    if (!data) throw new Error("Invalid transaction");

    const request: CallWithERC2771Request = {
      target: nft.address,
      data: data,
      chainId: chainId,
      user: deployer.address,
    };

    await expect(sponsoredCallERC2771Local(request, "", "")).to.emit(
      nft,
      "Transfer"
    );
  });
});
