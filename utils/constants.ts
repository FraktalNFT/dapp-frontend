import { BigNumber } from "ethers";

export const LARGEST_UINT256 = BigNumber.from(
  "115792089237316195423570985008687907853269984665640564039457584007913129639935"
);

export const contracts = [ // old ones
  {providerChainId:1, address:'0x0000000000000000000000000000000000000000'},
  {providerChainId:4, address:'0xFf3532447a93497471279150602B6ec24ae1170f'},
  {providerChainId:5, address:'0xA916BbdB90bA3BA7DCca09F2D3B249180f7fE0D2'}
]
export const marketContracts = [
  {providerChainId:1, address:'0x0000000000000000000000000000000000000000'},
  // {providerChainId:4, address:'0xABE7c1cEbA60591f1Bd0deE5453589Dc7E6C83E1'}, // OLD proxy
  {providerChainId:4, address:'0xE592641ddA55049dF27b6738D12cA977e68b3bB5'}, // proxy
  // {providerChainId:4, address:'0xDD301042351A08512b5E728154B1B3E81908A628'}, logic
]
export const factoryContracts = [
  {providerChainId:1, address:'0x0000000000000000000000000000000000000000'},
  {providerChainId:4, address:'0x7edb6a54D10B4e3039Fd11D1A59582a6294a6ffE'},
]

export const networkNames = {
  1: "ETH Mainnet",
  42: "Kovan Testnet",
  3: "Ropsten Testnet",
  4: "Rinkeby Testnet",
  5: "Göerli Testnet",
};

export const networkLabels = {
  1: "Mainnet",
  3: "Ropsten",
  4: "Rinkeby",
  5: "Görli",
  42: "Kovan",
};

export const networkCurrencies = {
  1: {
    name: "Ethereum",
    symbol: "ETH",
  },
  3: {
    name: "Ethereum",
    symbol: "ETH",
  },
  4: {
    name: "Ethereum",
    symbol: "ETH",
  },
  5: {
    name: "Ethereum",
    symbol: "ETH",
  },
  42: {
    name: "Ethereum",
    symbol: "ETH",
  },
};

export const chainUrls = {
  1: {
    rpc: "https://mainnet.infura.io/v3/" + process.env.NEXT_PUBLIC_INFURA_ID,
    explorer: "https://etherscan.io/",
    chainId: 1,
    name: networkNames[1],
  },
  3: {
    rpc: "https://ropsten.infura.io/v3/" + process.env.NEXT_PUBLIC_INFURA_ID,
    explorer: "https://ropsten.etherscan.io/",
    chainId: 3,
    name: networkNames[3],
  },
  4: {
    rpc: "https://rinkeby.infura.io/v3/" + process.env.NEXT_PUBLIC_INFURA_ID,
    explorer: "https://rinkeby.etherscan.io/",
    chainId: 4,
    name: networkNames[4],
  },
  5: {
    rpc: "https://kovan.infura.io/v3/" + process.env.NEXT_PUBLIC_INFURA_ID,
    explorer: "https://kovan.etherscan.io/",
    chainId: 5,
    name: networkNames[5],
  },
  42: {
    rpc: "https://goerli.infura.io/v3/" + process.env.NEXT_PUBLIC_INFURA_ID,
    explorer: "https://goerli.etherscan.io/",
    chainId: 42,
    name: networkNames[42],
  },
};
