import {
  chainUrls,
  networkCurrencies,
  networkLabels,
  networkNames,
} from "./constants";
import { utils } from "ethers";
import {
  rescueEth,
  claimFraktalSold,
  fraktionalize,
  importFraktal,
  claimERC1155,
  claimERC721,
  approveMarket,
  importERC721,
  importERC1155,
  getApproved,
  getLockedTo,
  makeOffer
} from './contractCalls';


export const timezone = (timestamp) => {return new Date(timestamp*1000).toLocaleDateString("en-US")}
export const getNetworkName = (chainId: number) => networkNames[chainId || 1];
export const getNetworkLabel = (chainId: number) => networkLabels[chainId || 1];
export const getRPCUrl = (chainId: number) => chainUrls[chainId || 1].rpc;
export const getExplorerUrl = (chainId: number) =>
  (chainUrls[chainId] || chainUrls[1]).explorer;
export const getNetworkCurrency = chainId =>
  networkCurrencies[chainId] || { name: "Unknown", symbol: "Unknown" };

export const shortenHash = (hash) => {
	if (typeof hash !== 'undefined') {
		return `${hash.slice(0, 4)}...${hash.slice(hash.length - 4, hash.length)}`
	}
};

export const addChainToMetaMask = async (
  chainId: number,
  isNativeEthereumChain: boolean = false
) => {
  const { name, symbol } = getNetworkCurrency(chainId);
  return isNativeEthereumChain
    ? window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [
          {
            chainId: utils.hexValue(chainId),
          },
        ],
      })
    : window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: utils.hexValue(chainId),
            chainName: getNetworkName(chainId),
            nativeCurrency: {
              name,
              symbol,
              decimals: 18,
            },
            rpcUrls: [getRPCUrl(chainId)],
            blockExplorerUrls: [getExplorerUrl(chainId)],
          },
        ],
      });
};

export async function loadSigner(provider) { //Load contract instance
  if (typeof provider !== "undefined") {
    try {
      let signer;
      const accounts = await provider.listAccounts();
      if (accounts && accounts.length > 0) {
        signer = provider.getSigner();// get signer
      } else {
        signer = provider; // or use RPC (cannot sign tx's. should call a connect warning)
      }
      return signer;
    } catch (e) {
      console.log("ERROR LOADING SIGNER", e);
    }
  }
}

export function getParams(type){
  const url = `https://testnet.fraktal.io/${type}/`;
  let address;
  if(window.location.href.startsWith('http://localhost')){
    address = window.location.href.split(`http://localhost:3000/${type}/`);
  }else{
    address = window.location.href.split(url);
  }
  return address[1];
}

export async function processTx(tx){
  let receipt;
  try{
    receipt = await tx.wait();
  } catch(e) {
    receipt = {error: `Error: ${e}`}
  }
  console.log('Transaction receipt');
  return receipt;
}

export const awaitTokenAddress = async (tx) => {
  let receipt;
  try {
    receipt = await tx.wait();
  } catch (error) {
    receipt = {error: `Error: ${error}`};
  }
  if (receipt?.error) {
    return receipt;
  }
  const abi = new utils.Interface([
    'event Minted(address creator,string urlIpfs,address tokenAddress,uint nftId)',
  ]);
  const eventFragment = abi.events[Object.keys(abi.events)[0]];
  const eventTopic = abi.getEventTopic(eventFragment);
  const event = receipt.logs.find((e) => e.topics[0] === eventTopic);
  if (!event) return '';
  const decodedLog = abi.decodeEventLog(
    eventFragment,
    event.data,
    event.topics,
  );
  return decodedLog.tokenAddress;
};
