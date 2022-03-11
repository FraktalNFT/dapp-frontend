import { BigNumber } from "ethers";

export const LARGEST_UINT256 = BigNumber.from(
  "115792089237316195423570985008687907853269984665640564039457584007913129639935"
);

export const contracts = [ // old ones
  {providerChainId:1, address: '0x0000000000000000000000000000000000000000'},
  {providerChainId:4, address: '0xFf3532447a93497471279150602B6ec24ae1170f'},
  {providerChainId:5, address: '0xA916BbdB90bA3BA7DCca09F2D3B249180f7fE0D2'}
]
export const marketContracts = [
    {providerChainId:1, address: '0x0000000000000000000000000000000000000000'},
    {providerChainId:4, address:  process.env.NEXT_PUBLIC_RINKEBY_MARKET_CONTRACT
          ? process.env.NEXT_PUBLIC_RINKEBY_MARKET_CONTRACT : '0x1379cf637fc4cf09D89CDc9131C38DD4dd15D1c7'},
]
export const factoryContracts = [
    {providerChainId:1, address: '0x0000000000000000000000000000000000000000'},
    {providerChainId:4, address:  process.env.NEXT_PUBLIC_RINKEBY_FACTORY_CONTRACT
          ? process.env.NEXT_PUBLIC_RINKEBY_FACTORY_CONTRACT : '0x9c27b4310F128Fdb6cfE6b2eA32Af3774Bf6778e'},
]
export const fraktalTokenContracts = [
    {providerChainId:1, address:'0x0000000000000000000000000000000000000000'},
    {providerChainId:4, address:'0x468065C8B00C7cB3cd6B9fD76dAe9dD49e1C30e0'},
];
export const lpTokenContracts = [
    {providerChainId:1, address:'0x0000000000000000000000000000000000000000'},
    {providerChainId:4, address:'0x9A18671771a15CA42442F0970852670A3972A789'},
];
export const airdropContract = [
    {providerChainId:1, address:'0x0000000000000000000000000000000000000000'},
    {providerChainId:4, address:'0xdA64d4c447476Ef26FD929d63Ec8f1C81C267854'},
];
export const lpStakingContracts = [
    {providerChainId:1, address:'0x0000000000000000000000000000000000000000'},
    {providerChainId:4, address:'0x85F625355a5DeCebb5F1609c7197597F3B125411'},
]
export const tradingRewardsContracts = [
    {providerChainId:1, address:'0x0000000000000000000000000000000000000000'},
    {providerChainId:4, address:'0x92E52AF0D07b1d4cE0DA9041C1a2eC164c75174e'},
]
export const feeSharingContracts = [
    {providerChainId:1, address:'0x0000000000000000000000000000000000000000'},
    {providerChainId:4, address:'0xe398a2Cfa41440e7d33bbdC76f0a65C9Ca3D8373'},
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
