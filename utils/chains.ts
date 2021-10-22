export const OneLedgerChains = [
  "4216137055", // frankenstein
  "311752642", // oneldger
];

export const EthereumChains = [
  "1", // ethereum
  "3", // ropsten
  "4", // rinkeby
  "5", // goerli
];

export const SupportedChains = OneLedgerChains.concat(EthereumChains);

const wethMap = new Map();

wethMap.set("4216137055", "0x5d21746690f4A332DA81FD239f8e970FfDC624E0");
wethMap.set("311752642", null);
wethMap.set("1", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
wethMap.set("3", "0xc778417e063141139fce010982780140aa0cd5ab");
wethMap.set("4", "0xc778417e063141139fce010982780140aa0cd5ab");
wethMap.set("5", "0x0bb7509324ce409f7bbc4b701f932eaca9736ab7");

export const GetWETHAddress = (chainId: string): string | null =>
  wethMap.get(chainId);
