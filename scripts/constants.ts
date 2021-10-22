interface TokenLink {
  name: string;
  fromNameOrAddress: string;
  toNameOrAddress: string;
}

interface ERC20Token {
  name: string;
  symbol: string;
  decimals: number;
}

interface InfoData {
  cosaddrs: Array<string>;
  tokenLinks: Array<TokenLink>;
}

interface Bridge {
  name: string;
}

interface InitData {
  bridge: Bridge;
  tokenList: Array<ERC20Token>;
}

interface Data<T> {
  [network: string]: T;
}

interface NetworkData<T> {
  [network: string]: Data<T>;
}

export const DeploymentCrossDomainUpdateData: NetworkData<InfoData> = {
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

export const DeploymentUpdateData: Data<InitData> = {
  ropsten: {
    bridge: {
      name: "Rokstedi",
    },
    tokenList: [
      {
        name: "Syndicate OneLedger Token",
        symbol: "OLT",
        decimals: 18,
      },
    ],
  },
  ethereum: {
    bridge: {
      name: "Shredder",
    },
    tokenList: [
      {
        name: "Syndicate OneLedger Token",
        symbol: "OLT",
        decimals: 18,
      },
    ],
  },
  frankenstein: {
    bridge: {
      name: "Bibop",
    },
    tokenList: [
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
  },
  oneledger: {
    bridge: {
      name: "Splinter",
    },
    tokenList: [
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
  },
};
