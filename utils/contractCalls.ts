// TODO:
// sintetize all functions (or view vs state)

import { Contract } from "@ethersproject/contracts";
import { loadSigner, processTx } from './helpers';

const transferAbi = ["function makeSafeTransfer(address _to,uint256 _tokenId,uint256 _subId,uint256 _amount)"];
const fraktionalizeAbi = ["function fraktionalize(uint256 _tokenId)"];
const defraktionalizeAbi = ["function defraktionalize(uint256 _tokenId)"];
const getApprovedAbi = ["function isApprovedForAll(address account,address operator) external view returns (bool)"];
const getMaxPriceAbi = ["function maxPriceRegistered(address) view returns (uint256)"];
const getLockedSharesAbi = ["function lockedShares(address) public view returns (uint256)"];
const getLockedToAbi = ["function lockedToTotal(address) public view returns (uint256)"];
const approveAbi = ["function setApprovalForAll(address operator, bool approved)"];
const unlockAbi = ["function unlockSharesTransfer(address _to)"];
const lockAbi = ["function lockSharesTransfer(uint numShares, address _to)"];
const mintAbi = ["function mint(string tokenURI)"];
const listItemAbi = ["function listItem(uint256 _tokenId,uint256 _price,uint16 _numberOfShares)"];
const unlistItemAbi = ["function unlistItem(uint256 _tokenId)"];
const rescueEthAbi = ["function rescueEth()"];
const buyAbi = ["function buyFraktions(address from, uint256 _tokenId, uint16 _numberOfShares) payable"];
const revenueAbi = ["function createRevenuePayment() payable"];
const releaseAbi = ["function release()"];
const claimAbi = ["function claimFraktal(uint256 _tokenId)"];
const voteAbi = ["function voteOffer(address offerer, address tokenAddress)"];
const importERC721Abi = ["function importERC721(address _tokenAddress, uint256 _tokenId)"];
const importERC1155Abi = ["function importERC1155(address _tokenAddress, uint256 _tokenId)"];
const claimERC721Abi = ['function claimERC721(uint256 _tokenId)'];
const claimERC1155Abi = ['function claimERC1155(uint256 _tokenId)'];
const makeOfferAbi = ["function makeOffer(address tokenAddress, uint256 _value) payable"];

const calls = [
  {name:'Transfer', abi: transferAbi, contract:'token'},
  {name:'Fraktionalize', abi: fraktionalizeAbi, contract:'token'},
  {name:'Defraktionalize', abi: defraktionalizeAbi,contract:'token'},
  {name:'getApproved', abi: getApprovedAbi,contract:'token'},
  {name:'getMaxPrice', abi: getMaxPriceAbi,contract:'token'},
  {name:'getLocked', abi: getLockedSharesAbi,contract:'token'},
  {name:'getLockedTo', abi: getLockedToAbi,contract:'token'},
  {name:'Approve', abi: approveAbi,contract:'token'},
  {name:'Unlock', abi: unlockAbi,contract:'token'},
  {name:'Lock', abi: lockAbi,contract:'token'},
  {name:'Mint', abi: mintAbi,contract:'market'},
  {name:'ListItem', abi: listItemAbi,contract:'market'},
  {name:'UnlistItem', abi: unlistItemAbi,contract:'market'},
  {name:'Rescue', abi: rescueEthAbi,contract:'market'},
  {name:'Buy', abi: buyAbi,contract:'market'},
  {name:'Revenue', abi: revenueAbi,contract:'token'},
  {name:'Release', abi: releaseAbi,contract:'revenue'},
  {name:'Claim', abi: claimAbi,contract:'market'},
  {name:'Vote', abi: voteAbi,contract:'market'},
  {name:'ImportERC721', abi: importERC721Abi,contract:'market'},
  {name:'ImportERC1155', abi: importERC1155Abi,contract:'market'},
  {name:'MakeOffer', abi: makeOfferAbi,contract:'market'}
]

// View functions
///////////////////////////////////////////////////////////
export async function getApproved(account, marketContract, provider, tokenContract) {
  const customContract = new Contract(tokenContract, getApprovedAbi, provider);
  let approved = await customContract.isApprovedForAll(account, marketContract)
  return approved;
}

export async function getMinimumOffer(tokenAddress, provider, marketContract) {
  const customContract = new Contract(marketContract, getMaxPriceAbi, provider);
  let maxPrice = await customContract.maxPriceRegistered(tokenAddress)
  return maxPrice;
}

export async function getLocked(account, tokenAddress, provider) {
  const customContract = new Contract(tokenAddress, getLockedSharesAbi, provider);
  let lockedShares = await customContract.lockedShares(account)
  return lockedShares.toNumber();
}

export async function getLockedTo(account, tokenAddress, provider) {
  const customContract = new Contract(tokenAddress, getLockedSharesAbi, provider);
  let lockedShares = await customContract.lockedShares(account)
  return lockedShares.toNumber();
}

// State functions
///////////////////////////////////////////////////////////
export async function transferToken(tokenId, subId, amount, to, provider, contractAddress) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(contractAddress, transferAbi, signer);
  let tx = await customContract.makeSafeTransfer(to, tokenId, subId,amount)
  processTx(tx);
}

export async function fraktionalize(id, provider, contract){
  const signer = await loadSigner(provider);
  const customContract = new Contract(contract, fraktionalizeAbi, signer);
  let tx = await customContract.fraktionalize(id)
  processTx(tx);
}
export async function claimERC721(marketId, provider, contract){
  const signer = await loadSigner(provider);
  const customContract = new Contract(contract, claimERC721Abi, signer);
  let tx = await customContract.claimERC721(marketId)
  processTx(tx);
}
export async function claimERC1155(marketId, provider, contract){
  const signer = await loadSigner(provider);
  const customContract = new Contract(contract, claimERC1155Abi, signer);
  let tx = await customContract.claimERC1155(marketId)
  processTx(tx);
}
export async function defraktionalize(id, provider, contract){
  const signer = await loadSigner(provider);
  const customContract = new Contract(contract, defraktionalizeAbi, signer);
  let tx = await customContract.defraktionalize(id)
  processTx(tx);
}

export async function approveMarket(to, provider, contract) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(contract, approveAbi, signer);
  let tx = await customContract.setApprovalForAll(to, true)
  processTx(tx);
}

export async function unlockShares(to, provider, tokenContract) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(tokenContract, unlockAbi, signer);
  let tx = await customContract.unlockSharesTransfer(to)
  processTx(tx);
}

export async function lockShares(amount,to, provider, tokenContract) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(tokenContract, lockAbi, signer);
  let tx = await customContract.lockSharesTransfer(amount, to)
  processTx(tx);
}

export async function createNFT(hash, provider, contractAddress){
  const signer = await loadSigner(provider);
  const customContract = new Contract(contractAddress, mintAbi, signer);
  let tx = await customContract.mint(hash)
  processTx(tx);
}

export async function listItem(tokenId,amount,price,provider,contractAddress){
  const override = {gasLimit:300000}
  const signer = await loadSigner(provider);
  const customContract = new Contract(contractAddress, listItemAbi, signer);
  let tx = await customContract.listItem(tokenId, price, amount, override)
  processTx(tx);
}

export async function unlistItem(tokenId, provider, contractAddress){
  const signer = await loadSigner(provider);
  const customContract = new Contract(contractAddress, unlistItemAbi, signer);
  let tx = await customContract.unlistItem(tokenId)
  processTx(tx);
}
export async function rescueEth(provider, contractAddress){
  const signer = await loadSigner(provider);
  const customContract = new Contract(contractAddress, rescueEthAbi, signer);
  const override = {gasLimit:100000}
  let tx = await customContract.rescueEth(override)
  processTx(tx);
}

export async function buyFraktions(seller, tokenId,amount,value,provider,contractAddress){
  const signer = await loadSigner(provider);
  const override = {value:value, gasLimit:300000}
  const customContract = new Contract(contractAddress, buyAbi, signer);
  let tx = await customContract.buyFraktions(seller, tokenId, amount, override)
  processTx(tx);
}

export async function createRevenuePayment(value, provider, fraktalAddress){
  const signer = await loadSigner(provider);
  const override = {value: value, gasLimit:700000}
  const customContract = new Contract(fraktalAddress, revenueAbi, signer);
  let tx = await customContract.createRevenuePayment(override)
  processTx(tx);
}
export async function release(provider, revenueAddress){
  const signer = await loadSigner(provider);
  const override = {gasLimit:160000}
  const customContract = new Contract(revenueAddress, releaseAbi, signer);
  let tx = await customContract.release(override)
  processTx(tx);
}
export async function claimFraktalSold(tokenId, provider, marketAddress){
  const signer = await loadSigner(provider);
  const override = {gasLimit:700000}
  const customContract = new Contract(marketAddress, claimAbi, signer);
  let tx = await customContract.claimFraktal(tokenId, override)
  processTx(tx);
}

export async function voteOffer(offerer, tokenAddress, provider, marketAddress){
  const signer = await loadSigner(provider);
  const override = {gasLimit:2000000}
  const customContract = new Contract(marketAddress, voteAbi, signer);
  let tx = await customContract.voteOffer(offerer, tokenAddress, override)
  processTx(tx);
}
export async function importERC721(tokenId, tokenAddress, provider, marketAddress){
  const signer = await loadSigner(provider);
  const override = {gasLimit:2000000}
  const customContract = new Contract(marketAddress, importERC721Abi, signer);
  let tx = await customContract.importERC721(tokenAddress,tokenId, override)
  processTx(tx);
}
export async function importERC1155(tokenId, tokenAddress, provider, marketAddress){
  const signer = await loadSigner(provider);
  const override = {gasLimit:2000000}
  const customContract = new Contract(marketAddress, importERC1155Abi, signer);
  let tx = await customContract.importERC1155(tokenAddress,tokenId, override)
  processTx(tx);
}
export async function makeOffer(value, tokenAddress, provider, marketAddress){
  const signer = await loadSigner(provider);
  const override = {gasLimit:2000000, value: value}
  const customContract = new Contract(marketAddress, makeOfferAbi, signer);
  let tx = await customContract.makeOffer(tokenAddress,value, override)
  processTx(tx);
}
