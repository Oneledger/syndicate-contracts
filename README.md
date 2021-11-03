# Syndicate bridge contracts

Semi-centralized bridge solution for cross chain token linking.

Supported bridges:
 * frankenstein -> ropsten;

### How to launch
Prerequisites: node.js v.11.4.0+ is required
1. Install dependencies:
```yarn```
3. Set up an environment variables to `.env` file (or just copy from `.env.example`):
```
ETHERSCAN_API_KEY=ABC123ABC123ABC123ABC123ABC123ABC1

ETH_NODE_URI_FRANKENSTEIN=https://frankenstein-rpc.oneledger.network
ETH_NODE_URI_ROPSTEN=https://speedy-nodes-nyc.moralis.io/6be9c674e3a0ba73d6ba649d/eth/ropsten

MNEMONIC_FRANKENSTEIN=test test test test test test test test test test test junk
MNEMONIC_ROPSTEN=test test test test test test test test test test test junk
```
 - `ETHERSCAN_API_KEY` - api key for smart contract verification;
 - `ETH_NODE_URI_<network_name>` - url for web3 rpc connection;
 - `MNEMONIC_<network_name>` - HD wallet for contract deployment and ownership set up;
2. Deploy contracts:
```ENTER_NETWORK=frankenstein EXIT_NETWORK=ropsten ./src/autodeploy.sh```

Mostly all contracts already deployed, so the second step is not mandatory (in case you want to have this contracts on own)


### Flow
So basically the flow consist of such parts (where `<source>` - OneLedger and `<target>` - Ethereum as bridge examples):
1. Send token to the `<source>` bridge (function `enter` | `enterETH`);
2. Wait for cosigners to take a proof and sign it;
3. Withdraw a tokens from `<target>` bridge (function `exit`);

So users is simply paying for their transaction on cross chains. It is always 2 txs. Bridge operation could not be revertable.

### Bridge benefits
| Pros                                       | Cons                    |
|--------------------------------------------|-------------------------|
| Very fast (depends on confirmation period) | Semi-centralized        |
| Straightforward flow                       | Could not be canceled   |
| Easy to maintain and upgrade               |                         |


### Etherscan verification

To try out Etherscan verification, you first need to deploy a contract to an Ethereum network that's supported by Etherscan, such as Ropsten.

```shell
hh verify-latest-deploy --network ropsten
```