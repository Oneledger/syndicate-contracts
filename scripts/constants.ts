interface TokenLink {
  name: string;
  fromNameOrAddress: string;
  toNameOrAddress: string;
}

interface InfoData {
  cosaddrs: string[];
  tokenLinks: TokenLink[];
}

interface NetworkData {
  [network: string]: InfoData;
}

interface InitData {
  [network: string]: NetworkData;
}

interface ERC20Token {
  name: string;
  symbol: string;
  decimals: number;
}

interface TokenListMap {
  [network: string]: Array<ERC20Token>;
}

// oneledger
const OneLedgerNetwork = "311752642";
const FrankensteinNetwork = "4216137055";

// ethereum
const EthereumNetwork = "1";
const RopstenNetwork = "3";

export const DeploymentInitData: InitData = {
  frankenstein: {
    ropsten: {
      cosaddrs: [
        "0xdC430c2417bd94AF2f2601B8B08032599eed0040",
        "0x8f5ebE62b1C558423f7210161d77F5091181E158",
        "0x490B6580C558FaA452701f367369b4464775EDEb",
      ],
      tokenLinks: [
        {
          name: "WETH",
          fromNameOrAddress: "BridgeTokenWETH",
          toNameOrAddress: "0x0000000000000000000000000000000000000000",
        },
        {
          name: "USDT",
          fromNameOrAddress: "BridgeTokenUSDT",
          toNameOrAddress: "0x110a13FC3efE6A245B50102D2d79B3E76125Ae83",
        },
        {
          name: "OLT",
          fromNameOrAddress: "0x0000000000000000000000000000000000000000",
          toNameOrAddress: "BridgeTokenOLT",
        },
      ],
    },
  },
  ropsten: {
    frankenstein: {
      // TODO: Generate separate cosigners for frank
      cosaddrs: [
        "0xdC430c2417bd94AF2f2601B8B08032599eed0040",
        "0x8f5ebE62b1C558423f7210161d77F5091181E158",
        "0x490B6580C558FaA452701f367369b4464775EDEb",
      ],
      tokenLinks: [
        {
          name: "WETH",
          fromNameOrAddress: "0x0000000000000000000000000000000000000000",
          toNameOrAddress: "BridgeTokenWETH",
        },
        {
          name: "USDT",
          fromNameOrAddress: "0x110a13FC3efE6A245B50102D2d79B3E76125Ae83",
          toNameOrAddress: "BridgeTokenUSDT",
        },
        {
          name: "OLT",
          fromNameOrAddress: "BridgeTokenOLT",
          toNameOrAddress: "0x0000000000000000000000000000000000000000",
        },
      ],
    },
  },
};

export const DeploymentTokenListMap: TokenListMap = {
  [RopstenNetwork]: [
    {
      name: "Syndicate OneLedger Token",
      symbol: "OLT",
      decimals: 18,
    },
  ],
  [EthereumNetwork]: [
    {
      name: "Syndicate OneLedger Token",
      symbol: "OLT",
      decimals: 18,
    },
  ],
  [FrankensteinNetwork]: [
    {
      name: "Syndicate Tether USD",
      symbol: "USDT",
      decimals: 6,
    },
    {
      name: "Syndicate Wrapped ETH",
      symbol: "WETH",
      decimals: 18,
    },
  ],
  [OneLedgerNetwork]: [
    {
      name: "Syndicate DAI Stablecoin",
      symbol: "DAI",
      decimals: 18,
    },
    {
      name: "Syndicate USD Coin",
      symbol: "USDC",
      decimals: 18,
    },
    {
      name: "Syndicate Tether USD",
      symbol: "USDT",
      decimals: 6,
    },
    {
      name: "Syndicate Wrapped BTC",
      symbol: "WBTC",
      decimals: 18,
    },
    {
      name: "Syndicate Wrapped ETH",
      symbol: "WETH",
      decimals: 18,
    },
  ],
};
