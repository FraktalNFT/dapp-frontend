// TODO:
// sintetize all functions (or view vs state)

import { Contract } from "@ethersproject/contracts";
import { loadSigner, processTx, awaitTokenAddress } from "./helpers";
//tested
const factoryAbi = [
  "function mint(string urlIpfs, uint16 majority)",
  "function importERC721(address _tokenAddress, uint256 _tokenId, uint16 majority)",
  "function importERC1155(address _tokenAddress, uint256 _tokenId, uint16 majority)",
  "function claimERC721(uint256 _tokenId)",
  "function claimERC1155(uint256 _tokenId)",
];
const marketAbi = [
  "function importFraktal(address tokenAddress, uint256 fraktionsIndex)",
  "function rescueEth()",
  "function buyFraktions(address from, address tokenAddress, uint256 _numberOfShares) payable",
  "function claimFraktal(address tokenAddress)",
  "function voteOffer(address offerer, address tokenAddress)",
  "function makeOffer(address tokenAddress, uint256 _value) payable",
  "function listItem(address _tokenAddress,uint256 _price,uint256 _numberOfShares) external returns (bool)",
  "function unlistItem(address tokenAddress)",
  "function maxPriceRegistered(address) view returns (uint256)",
  "function exportFraktal(address tokenAddress)",
];
const tokenAbi = [
  "function isApprovedForAll(address account,address operator) external view returns (bool)",
  "function makeSafeTransfer(address _to,uint256 _tokenId,uint256 _subId,uint256 _amount)",
  "function getLockedShares(uint256 index, address who) public view returns(uint)",
  "function getFraktionsIndex() public view returns (uint256)",
  "function getLockedToTotal(uint256 index, address who) public view returns(uint)",
  "function fraktionalize(uint256 _tokenId)",
  "function defraktionalize() public",
  "function setApprovalForAll(address operator, bool approved)",
  "function unlockSharesTransfer(address from, address _to)",
  "function lockSharesTransfer(address from, uint numShares, address _to)",
  "function createRevenuePayment() payable",
  "function balanceOf(address account, uint256 id) external view returns (uint256)",
  "function majority() public view returns (uint)",
  "function fraktionsIndex() public view returns (uint256)",
  "function indexUsed(uint256) view returns (bool)",
];
const revenuesAbi = [
  "function shares(address account) external view returns (uint256)",
  "function released(address account) public view returns (uint256)",
  "function release() public",
];

// TODO
const transferAbi = [
  "function makeSafeTransfer(address _to,uint256 _tokenId,uint256 _subId,uint256 _amount)",
];

export async function getShares(account, provider, revenueContract) {
  try {
    const customContract = new Contract(revenueContract, revenuesAbi, provider);
    let shares = await customContract.shares(account);
    return shares.toNumber();
  } catch {
    return "error getting shares";
  }
}
export async function getReleased(account, provider, revenueContract) {
  try {
    const customContract = new Contract(revenueContract, revenuesAbi, provider);
    let released = await customContract.released(account);
    return released;
  } catch {
    return "error getting released";
  }
}

export async function release(provider, revenueAddress) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(revenueAddress, revenuesAbi, signer);
  let tx = await customContract.release();
  let receipt = processTx(tx);
  return receipt;
}

// View functions
///////////////////////////////////////////////////////////
export async function getApproved(
  account,
  checkContract,
  provider,
  tokenContract
) {
  const customContract = new Contract(tokenContract, tokenAbi, provider);
  let approved = await customContract.isApprovedForAll(account, checkContract);
  return approved;
}
export async function getIndexUsed(index, provider, tokenContract) {
  const customContract = new Contract(tokenContract, tokenAbi, provider);
  let isUsed = await customContract.indexUsed(index);
  return isUsed;
}
export async function getMajority(provider, tokenContract) {
  try {
    const customContract = new Contract(tokenContract, tokenAbi, provider);
    let majority = await customContract.majority();
    return majority.toNumber();
  } catch {
    return "error";
  }
}
export async function getFraktionsIndex(provider, tokenContract) {
  try {
    const customContract = new Contract(tokenContract, tokenAbi, provider);
    let index = await customContract.fraktionsIndex();
    return index.toNumber();
  } catch {
    return "not Fraktal";
  }
}
export async function getBalanceFraktions(account, provider, tokenContract) {
  const customContract = new Contract(tokenContract, tokenAbi, provider);
  let index = await customContract.getFraktionsIndex();
  let balanceOfId = await customContract.balanceOf(account, index);
  return balanceOfId.toNumber();
}
export async function isFraktalOwner(account, provider, tokenContract) {
  const customContract = new Contract(tokenContract, tokenAbi, provider);
  let isOwner = await customContract.balanceOf(account, 0);
  return isOwner.toNumber();
}

export async function getMinimumOffer(tokenAddress, provider, marketContract) {
  const customContract = new Contract(marketContract, marketAbi, provider);
  let maxPrice = await customContract.maxPriceRegistered(tokenAddress);
  return maxPrice;
}

export async function getLocked(account, tokenAddress, provider) {
  const customContract = new Contract(tokenAddress, tokenAbi, provider);
  let index = await customContract.getFraktionsIndex();
  let lockedShares = await customContract.getLockedShares(index, account);
  return lockedShares.toNumber();
}

export async function getLockedTo(account, tokenAddress, provider) {
  const customContract = new Contract(tokenAddress, tokenAbi, provider);
  let index = await customContract.getFraktionsIndex();
  let lockedShares = await customContract.getLockedToTotal(index, account);
  return lockedShares.toNumber();
}

// State functions
///////////////////////////////////////////////////////////
export async function transferToken(
  tokenId,
  subId,
  amount,
  to,
  provider,
  contractAddress
) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(contractAddress, transferAbi, signer);
  let tx = await customContract.makeSafeTransfer(to, tokenId, subId, amount);
  let receipt = processTx(tx);
  return receipt;
}

export async function fraktionalize(id, provider, contract) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(contract, tokenAbi, signer);
  let tx = await customContract.fraktionalize(id);
  let receipt = processTx(tx);
  return receipt;
}
export async function claimERC721(marketId, provider, contract) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(contract, factoryAbi, signer);
  let tx = await customContract.claimERC721(marketId);
  let receipt = processTx(tx);
  return receipt;
}
export async function claimERC1155(marketId, provider, contract) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(contract, factoryAbi, signer);
  let tx = await customContract.claimERC1155(marketId);
  let receipt = processTx(tx);
  return receipt;
}
export async function defraktionalize(provider, contract) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(contract, tokenAbi, signer);
  let tx = await customContract.defraktionalize();
  let receipt = processTx(tx);
  return receipt;
}

export async function approveMarket(to, provider, contract) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(contract, tokenAbi, signer);
  let tx = await customContract.setApprovalForAll(to, true);
  let receipt = await processTx(tx);
  return receipt;
}

export async function unlockShares(from, to, provider, tokenContract) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(tokenContract, tokenAbi, signer);
  let tx = await customContract.unlockSharesTransfer(from, to);
  let receipt = processTx(tx);
  return receipt;
}

export async function lockShares(from, to, provider, tokenContract) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(tokenContract, tokenAbi, signer);
  let tx = await customContract.lockSharesTransfer(from, to);
  let receipt = processTx(tx);
  return receipt;
}

const defaultMajority = 8000; //later give this argument to the creator (or owner)

export async function createNFT(hash, provider, contractAddress) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(contractAddress, factoryAbi, signer);
  let tx = await customContract.mint(hash, defaultMajority);
  let tokenAddress = awaitTokenAddress(tx);
  // let receipt = processTx(tx);
  return tokenAddress;
}

export async function importFraktal(
  tokenAddress,
  fraktionsIndex,
  provider,
  marketAddress
) {
  const signer = await loadSigner(provider);
  const override = { gasLimit: 2000000 };
  const customContract = new Contract(marketAddress, marketAbi, signer);
  let tx = await customContract.importFraktal(
    tokenAddress,
    fraktionsIndex,
    override
  );
  let receipt = processTx(tx);
  return receipt;
}
export async function exportFraktal(tokenAddress, provider, marketAddress) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(marketAddress, marketAbi, signer);
  let tx = await customContract.exportFraktal(tokenAddress);
  let receipt = processTx(tx);
  return receipt;
}

export async function importERC721(
  tokenId,
  tokenAddress,
  provider,
  factoryAddress
) {
  const signer = await loadSigner(provider);
  const override = { gasLimit: 1000000 };
  const customContract = new Contract(factoryAddress, factoryAbi, signer);
  let tx = await customContract.importERC721(
    tokenAddress,
    tokenId,
    defaultMajority,
    override
  );
  // let receipt = processTx(tx);
  // let receipt = processTx(tx);
  let mintedTokenAddress = awaitTokenAddress(tx);
  return mintedTokenAddress;
}

export async function importERC1155(
  tokenId,
  tokenAddress,
  provider,
  factoryAddress
) {
  const signer = await loadSigner(provider);
  const override = { gasLimit: 1000000 };
  const customContract = new Contract(factoryAddress, factoryAbi, signer);
  let tx = await customContract.importERC1155(
    tokenAddress,
    tokenId,
    defaultMajority,
    override
  );
  // let receipt = processTx(tx);
  // return receipt;
  let mintedTokenAddress = awaitTokenAddress(tx);
  return mintedTokenAddress;
}

export async function listItem(
  tokenAddress,
  amount,
  price,
  provider,
  marketAddress
) {
  const override = { gasLimit: 300000 };
  const signer = await loadSigner(provider);
  const customContract = new Contract(marketAddress, marketAbi, signer);
  let tx = await customContract.listItem(tokenAddress, price, amount, override);
  let receipt = processTx(tx);
  return receipt;
}

export async function unlistItem(tokenAddress, provider, marketAddress) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(marketAddress, marketAbi, signer);
  let tx = await customContract.unlistItem(tokenAddress);
  let receipt = processTx(tx);
  return receipt;
}

export async function rescueEth(provider, marketAddress) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(marketAddress, marketAbi, signer);
  const override = { gasLimit: 100000 };
  let tx = await customContract.rescueEth(override);
  let receipt = processTx(tx);
  return receipt;
}

export async function buyFraktions(
  seller,
  tokenAddress,
  amount,
  value,
  provider,
  marketAddress
) {
  const signer = await loadSigner(provider);
  const override = { value: value, gasLimit: 300000 };
  const customContract = new Contract(marketAddress, marketAbi, signer);
  let tx = await customContract.buyFraktions(
    seller,
    tokenAddress,
    amount,
    override
  );
  let receipt = processTx(tx);
  return receipt;
}

export async function createRevenuePayment(value, provider, fraktalAddress) {
  const signer = await loadSigner(provider);
  const override = { value: value, gasLimit: 700000 };
  const customContract = new Contract(fraktalAddress, tokenAbi, signer);
  let tx = await customContract.createRevenuePayment(override);
  let receipt = processTx(tx);
  return receipt;
}

export async function claimFraktalSold(tokenId, provider, marketAddress) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(marketAddress, marketAbi, signer);
  let tx = await customContract.claimFraktal(tokenId);
  let receipt = processTx(tx);
  return receipt;
}

export async function voteOffer(
  offerer,
  tokenAddress,
  provider,
  marketAddress
) {
  const signer = await loadSigner(provider);
  const override = { gasLimit: 2000000 };
  const customContract = new Contract(marketAddress, marketAbi, signer);
  let tx = await customContract.voteOffer(offerer, tokenAddress, override);
  let receipt = processTx(tx);
  return receipt;
}
export async function makeOffer(value, tokenAddress, provider, marketAddress) {
  const signer = await loadSigner(provider);
  const override = { gasLimit: 2000000, value: value };
  const customContract = new Contract(marketAddress, marketAbi, signer);
  let tx = await customContract.makeOffer(tokenAddress, value, override);
  let receipt = processTx(tx);
  return receipt;
}
