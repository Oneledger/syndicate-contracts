interface TokenLink {
  name: string;
  fromNameOrAddress: string;
  toNameOrAddress: string;
  isExperimental?: boolean;
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
  // mainnets
  oneledger: {
    ethereum: {
      cosaddrs: [
        "0xacba170ab0d5d349e0f876f7c98eab80508ca12d",
        "0x1234567e67998c828451a36260498e4007e35d78",
        "0x0a6ff81182e2cf8f80c698eabff7c76d55420529",
      ],
      tokenLinks: [
        {
          name: "OLT",
          fromNameOrAddress: "0x0000000000000000000000000000000000000000",
          toNameOrAddress: "BridgeTokenOLT",
        },
      ],
    },
    bsc: {
      cosaddrs: [
        "0xc2944433c7b03bc94c8e2f8750a0dbdb0dd522df",
        "0x995e8a2f08d97d3e77c773df4d2cd7a0cb71abcd",
        "0x425670662664e2f0e849d839c4e1977e97597717",
      ],
      tokenLinks: [
        {
          name: "OLT",
          fromNameOrAddress: "0x0000000000000000000000000000000000000000",
          toNameOrAddress: "BridgeTokenOLT",
        },
      ],
    },
    polygon: {
      cosaddrs: [
        "0x37788c06742206e29639d8bbe275f5be0955c49f",
        "0xdead77bff7c314c78eaef25e74f32162d0577c12",
        "0x159738a1b9e60e3d6e9d896c1e1430fa23a35639",
      ],
      tokenLinks: [
        {
          name: "OLT",
          fromNameOrAddress: "0x0000000000000000000000000000000000000000",
          toNameOrAddress: "BridgeTokenOLT",
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
          name: "OLT",
          fromNameOrAddress: "BridgeTokenOLT",
          toNameOrAddress: "0x0000000000000000000000000000000000000000",
        },
      ],
    },
  },
  bsc: {
    oneledger: {
      cosaddrs: [
        "0x0c09852280ffd2c260c69fd7bb901a1ce739ec13",
        "0x51515d6258dc6cc93a45dbacf6b7c512af6cb751",
        "0x6874965d89cfd3e88909bdc75a3c24ac1aa6f23e",
      ],
      tokenLinks: [
        {
          name: "OLT",
          fromNameOrAddress: "BridgeTokenOLT",
          toNameOrAddress: "0x0000000000000000000000000000000000000000",
        },
      ],
    },
  },
  polygon: {
    oneledger: {
      cosaddrs: [
        "0xaee2232034a573008aa7bc5d2cb2b9bdafa21e62",
        "0x12348de08b844f860f33e16f863b764feedae52d",
        "0x82970eb31295e8dde76c77a52f71c2fa01d0b130",
      ],
      tokenLinks: [
        {
          name: "OLT",
          fromNameOrAddress: "BridgeTokenOLT",
          toNameOrAddress: "0x0000000000000000000000000000000000000000",
        },
      ],
    },
  },

  // testnets
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
          isExperimental: true,
        },
        {
          name: "USDT",
          fromNameOrAddress: "BridgeTokenUSDT",
          toNameOrAddress: "0x110a13FC3efE6A245B50102D2d79B3E76125Ae83",
          isExperimental: true,
        },
        {
          name: "OLT",
          fromNameOrAddress: "0x0000000000000000000000000000000000000000",
          toNameOrAddress: "BridgeTokenOLT",
          isExperimental: true,
        },
      ],
    },
    bsc_testnet: {
      cosaddrs: [
        "0xaaa14d9f70fd9fc8fb4b0c6d03a9bb06c3d20b2c",
        "0x0007087d0c1c4f639660eafa99360cc605753ad6",
        "0xccc018e22834258f1e37e10333ac47699dcaf3d2",
      ],
      tokenLinks: [
        {
          name: "OLT",
          fromNameOrAddress: "0x0000000000000000000000000000000000000000",
          toNameOrAddress: "BridgeTokenOLT",
          isExperimental: true,
        },
      ],
    },
    mumbai: {
      cosaddrs: [
        "0x444d20be8e2dd51c2a01464d1cfd0fd5a5f1bbf9",
        "0x501757f22225385935480e92e73a9cad11880000",
        "0x98319cea6d2e29a3c57fbbb6c6faacd59fdd1c1b",
      ],
      tokenLinks: [
        {
          name: "OLT",
          fromNameOrAddress: "0x0000000000000000000000000000000000000000",
          toNameOrAddress: "BridgeTokenOLT",
          isExperimental: true,
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
          isExperimental: true,
        },
        {
          name: "USDT",
          fromNameOrAddress: "0x110a13FC3efE6A245B50102D2d79B3E76125Ae83",
          toNameOrAddress: "BridgeTokenUSDT",
          isExperimental: true,
        },
        {
          name: "OLT",
          fromNameOrAddress: "BridgeTokenOLT",
          toNameOrAddress: "0x0000000000000000000000000000000000000000",
          isExperimental: true,
        },
      ],
    },
  },
  bsc_testnet: {
    frankenstein: {
      cosaddrs: [
        "0x1e858c2f492529dcff103a48fd440b9a9afc4386",
        "0x1233b2cbd1d7b6cb8f9f160ba15b11413f5a3599",
        "0x5554feeeeeac9626ffaa7aca13035ff2606a718c",
      ],
      tokenLinks: [
        {
          name: "OLT",
          fromNameOrAddress: "BridgeTokenOLT",
          toNameOrAddress: "0x0000000000000000000000000000000000000000",
          isExperimental: true,
        },
      ],
    },
  },
  mumbai: {
    frankenstein: {
      cosaddrs: [
        "0x357922c7eb3d8582729fede30365a62c112b9893",
        "0xa1a2b95feddee60687be7434b4fd43fafcaabf34",
        "0xa33797aabcdfb71325f699a8b4b156b23469e34f",
      ],
      tokenLinks: [
        {
          name: "OLT",
          fromNameOrAddress: "BridgeTokenOLT",
          toNameOrAddress: "0x0000000000000000000000000000000000000000",
          isExperimental: true,
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
  ethereum: {
    tokenList: [
      {
        name: "Syndicate OneLedger Token",
        symbol: "OLT",
        decimals: 18,
      },
    ],
  },
  bsc: {
    tokenList: [
      {
        name: "Syndicate OneLedger Token",
        symbol: "OLT",
        decimals: 18,
      },
    ],
  },
  polygon: {
    tokenList: [
      {
        name: "Syndicate OneLedger Token",
        symbol: "OLT",
        decimals: 18,
      },
    ],
  },
  frankenstein: {
    tokenList: [
      {
        name: "Syndicate USDT",
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
  bsc_testnet: {
    tokenList: [
      {
        name: "Syndicate OneLedger Token",
        symbol: "OLT",
        decimals: 18,
      },
    ],
  },
  mumbai: {
    tokenList: [
      {
        name: "Syndicate OneLedger Token",
        symbol: "OLT",
        decimals: 18,
      },
    ],
  },
};
