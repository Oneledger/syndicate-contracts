import { bridgeTokenBuilder } from "../utils";
import { OneLedgerChains } from "../utils/chains";

export default bridgeTokenBuilder(
  "Syndicate Wrapped ETH",
  "WETH",
  18,
  OneLedgerChains
);
