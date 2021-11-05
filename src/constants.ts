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
  oneledger: {
    ethereum: {
      cosaddrs: [
        "0xacba170ab0d5d349e0f876f7c98eab80508ca12d",
        "0x1234567e67998c828451a36260498e4007e35d78",
        "0x0a6ff81182e2cf8f80c698eabff7c76d55420529",
      ],
      tokenLinks: [
        {
          name: "sOLT",
          fromNameOrAddress: "0x0000000000000000000000000000000000000000",
          toNameOrAddress: "BridgeTokensOLT",
        },
      ],
    },
  },
  ethereum: {
    oneledger: {
      cosaddrs: [
        "0xfbc17afe92c8f1717f60dca80cb2e744bb27f7ae",
        "0x88885faa76d2f7807a147f4d3c96ddd575746b5d",
        "0x472054f358367ebaa1c44f3a8060217b457e6c6b",
      ],
      tokenLinks: [
        {
          name: "sOLT",
          fromNameOrAddress: "BridgeTokensOLT",
          toNameOrAddress: "0x0000000000000000000000000000000000000000",
        },
      ],
    },
  },
  frankenstein: {
    ropsten: {
      cosaddrs: [
        "0x0000b94d74ab821c0cd4b33783b1b31e8355afc7",
        "0x0000a3b4b431fc55a4f480eddbf4aa375c056a06",
        "0x111101a2ec7ca87fe24e35fd3330efb435861ce6",
      ],
      tokenLinks: [
        {
          name: "sETH",
          fromNameOrAddress: "BridgeTokensETH",
          toNameOrAddress: "0x0000000000000000000000000000000000000000",
        },
        {
          name: "sUSDT",
          fromNameOrAddress: "BridgeTokensUSDT",
          toNameOrAddress: "0x110a13FC3efE6A245B50102D2d79B3E76125Ae83",
        },
        {
          name: "sOLT",
          fromNameOrAddress: "0x0000000000000000000000000000000000000000",
          toNameOrAddress: "BridgeTokensOLT",
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
          name: "sETH",
          fromNameOrAddress: "0x0000000000000000000000000000000000000000",
          toNameOrAddress: "BridgeTokensETH",
        },
        {
          name: "sUSDT",
          fromNameOrAddress: "0x110a13FC3efE6A245B50102D2d79B3E76125Ae83",
          toNameOrAddress: "BridgeTokensUSDT",
        },
        {
          name: "sOLT",
          fromNameOrAddress: "BridgeTokensOLT",
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
  oneledger: {
    tokenList: [],
  },
  frankenstein: {
    tokenList: [
      {
        name: "Syndicate USDT",
        symbol: "sUSDT",
        decimals: 6,
      },
      {
        name: "Syndicate ETH",
        symbol: "sETH",
        decimals: 18,
      },
    ],
  },
  ethereum: {
    tokenList: [
      {
        name: "Syndicate OneLedger Token",
        symbol: "sOLT",
        decimals: 18,
      },
    ],
  },
  ropsten: {
    tokenList: [
      {
        name: "Syndicate OLT",
        symbol: "sOLT",
        decimals: 18,
      },
    ],
  },
};
