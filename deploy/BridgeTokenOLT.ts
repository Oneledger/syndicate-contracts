import { bridgeTokenBuilder } from "../utils";
import { EthereumChains } from "../utils/chains";

export default bridgeTokenBuilder(
  "Syndicate OneLedger Token",
  "OLT",
  18,
  EthereumChains
);
