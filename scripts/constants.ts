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
        "0x0000b94d74ab821c0cd4b33783b1b31e8355afc7",
        "0x0000a3b4b431fc55a4f480eddbf4aa375c056a06",
        "0x111101a2ec7ca87fe24e35fd3330efb435861ce6",
      ],
      tokenLinks: [
        {
          name: "ETH",
          fromNameOrAddress: "BridgeTokenETH",
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
      cosaddrs: [
        "0xa5582370a17e58bb9ebb88f8a3042f8331acd388",
        "0x0006377ecf869f98d4072bf3750fd5119c275d29",
        "0x0000b17a94e0d4f9fa3e71675a82364ee16f3e1b",
      ],
      tokenLinks: [
        {
          name: "ETH",
          fromNameOrAddress: "0x0000000000000000000000000000000000000000",
          toNameOrAddress: "BridgeTokenETH",
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
        name: "Syndicate ETH",
        symbol: "ETH",
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
