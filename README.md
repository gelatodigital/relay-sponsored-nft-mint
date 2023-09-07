# NFT EIP2771 Relay ready Contract

This is a very basic implementation of a NFT ERC721 TOKEN with additional EIP2771 support.

The contract can be found in the NFTRelay.sol file

Main changes compared to classic ERC721

```ts
    function mint() external onlyTrustedForwarder {

        _tokenId.increment();
        _safeMint(_msgSender(), _tokenId.current());

    }
```
 where we can see that we substitute the `msg.sender` for the `_msg.sender()` that extracts the user from the signed payload.

 The other point worth noticing is the modifier `onlyTrustedForwarder` where we restric only calls coming from Gelato Relay to allow to execute the mint function:

The contract for demo purposes has been deployed on Linea [https://goerli.lineascan.build/address/0x2bf28b8675e4ee0cd45bd4150dbaa906cf72c935](https://goerli.lineascan.build/address/0x2bf28b8675e4ee0cd45bd4150dbaa906cf72c935) 

# 🏄‍♂️ Dev Quick Start

1. Install project dependencies:
```
yarn install
```

2. Create a `.env` file with your private config:

```
cp .env.example .env
```

3. Compile the code

```bash
npx hardhat compile
```

4. Deploy your contract

You will have to pass the symbol and name for your token in the deployment script.

```bash
npx hardhat run scripts/deploy.ts
```

5. Verify your contract

Once the contract is deployed, you can pick up the address and the contructor arguments, paste them into the verify task and verify the contract.

```bash
npx hardhat etherscan-verify
```

6. See the relayer in Action

In order to see the relayer in action we need to fund our 1balance account, to do that, we will go to the [1Balance UI](https://relay.gelato.network), deposit some goerliETH (also for Mumbai), then switch tab to "Relay Apps" and input your contract and function you want to transform to Gasless. After doing that, simply copy the sponsor key as we will need for our request.

Now we are ready to relay a mint transaction with 
```bash
npx hardhat run scripts/relay.ts
```
and here you can see how we instantiate the sdk and prepare the request
```ts
import {  GelatoRelay } from "@gelatonetwork/relay-sdk";
const relay = new GelatoRelay();

async function main() {
  const deployer_provider = hre.ethers.provider;
  const privKeyDEPLOYER = process.env["PRIVATE_KEY"] as BytesLike;
  const deployer_wallet = new Wallet(privKeyDEPLOYER);
  const deployer = await deployer_wallet.connect(deployer_provider);

  const NftRelayABI = ["function mint() external"];
  const nftRelay = new Contract("0x2BF28B8675E4eE0cD45Bd4150DbaA906CF72c935", NftRelayABI, deployer);

  const { data } = await nftRelay.populateTransaction.mint();

  const request = {
    chainId: 59140, // Mumbai in this case
    target: "0x2BF28B8675E4eE0cD45Bd4150DbaA906CF72c935", // target contract address
    data: data!, // encoded transaction datas
    user: deployer.address!, //user sending the trasnaction
  };

  const sponsorApiKey = process.env.SPONSOR_KEY ?? "";

  const relayResponse = await relay.sponsoredCallERC2771(request, deployer, sponsorApiKey);


  let taskId = relayResponse.taskId;

  console.log(`https://relay.gelato.digital/tasks/status/${taskId}`);
}
```
