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
  bridgeNames: string[];
  tokenList: Array<ERC20Token>;
}

interface BridgeData<T> {
  [name: string]: T;
}

interface NetworkCompanionData<T> {
  [network: string]: BridgeData<T>;
}

interface NetworkData<T> {
  [network: string]: NetworkCompanionData<T>;
}

export const DeploymentCrossDomainUpdateData: NetworkData<InfoData> = {
  frankenstein: {
    ropsten: {
      bebop: {
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
  },
  ropsten: {
    frankenstein: {
      rocksteady: {
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
  },
};

const checkBridgeLinks = (elements: Set<Array<string>>) => {
  const keysMap: Map<string, boolean> = new Map();
  for (const link of elements) {
    if (link.length !== 2) {
      throw Error(`Expected link pair, got "${link}"`);
    }
    for (const bridgeName of link) {
      const exist = keysMap.get(bridgeName);
      if (exist) {
        throw Error(`Found duplicated key "${bridgeName}" in link "${link}"`);
      }
      keysMap.set(bridgeName, true);
    }
    const revLink = [link[1], link[0]];
    if (elements.has(revLink)) {
      throw Error(
        `Found duplicated reversed key "${revLink}" in link "${link}"`
      );
    }
  }
};

const bridgeLinks: Set<Array<string>> = new Set([["bebop", "rocksteady"]]);

checkBridgeLinks(bridgeLinks);

export const BridgeConnection: Map<string, string> = new Map();
for (const bridgeLink of bridgeLinks.keys())
  BridgeConnection.set(bridgeLink[0], bridgeLink[1]);

export const DeploymentUpdateData: BridgeData<InitData> = {
  frankenstein: {
    bridgeNames: ["bebop"],
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
    bridgeNames: ["rocksteady"],
    tokenList: [
      {
        name: "Syndicate OneLedger Token",
        symbol: "OLT",
        decimals: 18,
      },
    ],
  },
};
