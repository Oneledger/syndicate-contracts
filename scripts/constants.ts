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

interface InitData {
  tokenList: Array<ERC20Token>;
}

interface NetworkCompanionData<T> {
  [network: string]: T;
}

interface NetworkData<T> {
  [network: string]: NetworkCompanionData<T>;
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

export const DeploymentUpdateData: NetworkCompanionData<InitData> = {
  // for testing fixtures
  hardhat: {
    tokenList: [
      {
        name: "Syndicate OneLedger Token",
        symbol: "OLT",
        decimals: 18,
      },
      {
        name: "Syndicate Local Non Mintable ETH",
        symbol: "lnmETH",
        decimals: 18,
      },
      {
        name: "Syndicate Remote Non Mintable ETH",
        symbol: "rnmETH",
        decimals: 18,
      },
      {
        name: "Syndicate Local Mintable ETH",
        symbol: "lmETH",
        decimals: 18,
      },
      {
        name: "Syndicate Remote Mintable ETH",
        symbol: "rmETH",
        decimals: 18,
      },
    ],
  },
  frankenstein: {
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
  ropsten: {
    tokenList: [
      {
        name: "Syndicate OneLedger Token",
        symbol: "OLT",
        decimals: 18,
      },
    ],
  },
};
