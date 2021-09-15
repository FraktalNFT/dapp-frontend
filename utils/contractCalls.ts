import { Contract } from "@ethersproject/contracts";
import { loadSigner } from './helpers';



export async function transferToken(tokenId, subId, amount, to, provider, contractAddress) {
  const transferAbi = [
    "function makeSafeTransfer(address _to,uint256 _tokenId,uint256 _subId,uint256 _amount)"
  ];
  const signer = await loadSigner(provider);
  const customContract = new Contract(contractAddress, transferAbi, signer);
  let receipt;
  let tx = await customContract.makeSafeTransfer(to, tokenId, subId,amount)
  try{
    receipt = await tx.wait();
  }catch(e){
    receipt = 'Error: ',e.toString()
  }
  console.log('Transaction receipt');
  console.log(receipt);
  return receipt;
}

export async function fraktionalize(id, provider, contract){
  const fraktionalizeAbi = [
    "function fraktionalize(uint256 _tokenId)"
  ]
  const signer = await loadSigner(provider);
  const customContract = new Contract(contract, fraktionalizeAbi, signer);
  let receipt;
  let tx = await customContract.fraktionalize(id)
  try{
    receipt = await tx.wait();
  }catch(e){
    receipt = 'Error: ',e.toString()
  }
  console.log('Transaction receipt');
  console.log(receipt);
  return receipt;
}
export async function defraktionalize(id, provider, contract){
  const defraktionalizeAbi = [
    "function defraktionalize(uint256 _tokenId)"
  ]
  const signer = await loadSigner(provider);
  const customContract = new Contract(contract, defraktionalizeAbi, signer);
  let receipt;
  let tx = await customContract.defraktionalize(id)
  try{
    receipt = await tx.wait();
  }catch(e){
    receipt = 'Error: ',e.toString()
  }
  console.log('Transaction receipt');
  console.log(receipt);
  return receipt;
}

export async function getApproved(account, marketContract, provider, tokenContract) {
  const getApprovedAbi = [
    "function isApprovedForAll(address account,address operator) external view returns (bool)"
  ];
  const customContract = new Contract(tokenContract, getApprovedAbi, provider);
  let approved = await customContract.isApprovedForAll(account, marketContract)
  return approved;
}

export async function getMinimumOffer(tokenAddress, provider, marketContract) {
  const getMaxPriceAbi = [
    "function maxPriceRegistered(address) view returns (uint256)"
  ];
  const customContract = new Contract(marketContract, getMaxPriceAbi, provider);
  let maxPrice = await customContract.maxPriceRegistered(tokenAddress)
  return maxPrice;
}

export async function getLocked(account, tokenAddress, provider) {
  const getLockedSharesAbi = [
    "function lockedShares(address) public view returns (uint256)"
  ];
  const customContract = new Contract(tokenAddress, getLockedSharesAbi, provider);
  let lockedShares = await customContract.lockedShares(account)
  // console.log('res ',lockedShares.toNumber())
  return lockedShares.toNumber();
}


export async function approveMarket(to, provider, contract) {
  const approveAbi = [
    "function setApprovalForAll(address operator, bool approved)"
  ]
  const signer = await loadSigner(provider);
  const customContract = new Contract(contract, approveAbi, signer);
  let receipt;
  let tx = await customContract.setApprovalForAll(to, true)
  try{
    receipt = await tx.wait();
  }catch(e){
    receipt = 'Error: ',e.toString()
  }
  console.log('Transaction receipt');
  console.log(receipt);
  return receipt;
}

export async function unlockShares(to, provider, tokenContract) {
  const unlockAbi = [
    "function unlockSharesTransfer(address _to)"
  ];
  const signer = await loadSigner(provider);
  const customContract = new Contract(tokenContract, unlockAbi, signer);
  let receipt;
  let tx = await customContract.unlockSharesTransfer(to)
  try{
    receipt = await tx.wait();
  }catch(e){
    receipt = 'Error: ',e.toString()
  }
  console.log('Transaction receipt');
  console.log(receipt);
  return receipt;
}

export async function lockShares(amount,to, provider, tokenContract) {
  const lockAbi = [
    "function lockSharesTransfer(uint numShares, address _to)"
  ];
  const signer = await loadSigner(provider);
  const customContract = new Contract(tokenContract, lockAbi, signer);
  let receipt;
  let tx = await customContract.lockSharesTransfer(amount, to)
  try{
    receipt = await tx.wait();
  }catch(e){
    receipt = 'Error: ',e.toString()
  }
  console.log('Transaction receipt');
  console.log(receipt);
  return receipt;
}

export async function createNFT(hash, provider, contractAddress,optionalBytecode){
    const mintAbi = [
      "function mint(string tokenURI)"
    ];
    const signer = await loadSigner(provider);
    const customContract = new Contract(contractAddress, mintAbi, signer);
    if (optionalBytecode) customContract.bytecode = optionalBytecode;
    let receipt;
    let tx = await customContract.mint(hash)
    try{
      receipt = await tx.wait();
    }catch(e){
      receipt = 'Error: ',e.toString()
    }
    console.log('Transaction receipt');
    console.log(receipt);
    return receipt;
}

export async function listItem(tokenId,amount,price,provider,contractAddress){
  const listItemAbi = [
    "function listItem(uint256 _tokenId,uint256 _price,uint16 _numberOfShares)"
  ];
  const override = {gasLimit:300000}
  const signer = await loadSigner(provider);
  const customContract = new Contract(contractAddress, listItemAbi, signer);
  let receipt;
  let tx = await customContract.listItem(tokenId, price, amount, override)
  try{
    receipt = await tx.wait();
  }catch(e){
    receipt = 'Error: ',e.toString()
  }
  console.log('Transaction receipt');
  console.log(receipt);
  return receipt;
}

export async function unlistItem(tokenId, provider, contractAddress){
  const unlistItemAbi = [
    "function unlistItem(uint256 _tokenId)"
  ];
  const signer = await loadSigner(provider);
  const customContract = new Contract(contractAddress, unlistItemAbi, signer);
  let receipt;
  let tx = await customContract.unlistItem(tokenId)
  try{
    receipt = await tx.wait();
  }catch(e){
    receipt = 'Error: ',e.toString()
  }
  console.log('Transaction receipt');
  console.log(receipt);
  return receipt;
}
export async function rescueEth(provider, contractAddress){
  const rescueEthAbi = [
    "function rescueEth()"
  ];
  const signer = await loadSigner(provider);
  const customContract = new Contract(contractAddress, rescueEthAbi, signer);
  let receipt;
  const override = {gasLimit:100000}
  let tx = await customContract.rescueEth(override)
  try{
    receipt = await tx.wait();
  }catch(e){
    receipt = 'Error: ',e.toString()
  }
  console.log('Transaction receipt');
  console.log(receipt);
  return receipt;
}

export async function buyFraktions(seller, tokenId,amount,value,provider,contractAddress){
  const buyAbi = [
    "function buyFraktions(address from, uint256 _tokenId, uint16 _numberOfShares) payable"
  ];
  const signer = await loadSigner(provider);
  const override = {value:value, gasLimit:300000}
  const customContract = new Contract(contractAddress, buyAbi, signer);
  let receipt;
  let tx = await customContract.buyFraktions(seller, tokenId, amount, override)
  try{
    receipt = await tx.wait();
  }catch(e){
    receipt = 'Error: ',e.toString()
  }
  console.log('Transaction receipt');
  console.log(receipt);
  return receipt;
}

export async function createRevenuePayment(value, provider, fraktalAddress){
  const revenueAbi = [
    "function createRevenuePayment() payable"
  ];
  const signer = await loadSigner(provider);
  const override = {value: value, gasLimit:700000}
  const customContract = new Contract(fraktalAddress, revenueAbi, signer);
  let receipt;
  let tx = await customContract.createRevenuePayment(override)
  try{
    receipt = await tx.wait();
  }catch(e){
    receipt = 'Error: ',e.toString()
  }
  console.log('Transaction receipt');
  console.log(receipt);
  return receipt;
}
export async function release(provider, revenueAddress){
  const releaseAbi = [
    "function release()"
  ];
  const signer = await loadSigner(provider);
  const override = {gasLimit:160000}
  const customContract = new Contract(revenueAddress, releaseAbi, signer);
  let receipt;
  let tx = await customContract.release(override)
  try{
    receipt = await tx.wait();
  }catch(e){
    receipt = 'Error: ',e.toString()
  }
  console.log('Transaction receipt');
  console.log(receipt);
  return receipt;
}
export async function claimFraktalSold(tokenId, provider, marketAddress){
  const claimAbi = [
    "function claimFraktal(uint256 _tokenId)"
  ];
  const signer = await loadSigner(provider);
  const override = {gasLimit:700000}
  const customContract = new Contract(marketAddress, claimAbi, signer);
  let receipt;
  let tx = await customContract.claimFraktal(tokenId, override)
  try{
    receipt = await tx.wait();
  }catch(e){
    receipt = 'Error: ',e.toString()
  }
  console.log('Transaction receipt');
  console.log(receipt);
  return receipt;
}

export async function voteOffer(offerer, tokenAddress, provider, marketAddress){
  const voteAbi = [
    "function voteOffer(address offerer, address tokenAddress)"
  ];
  const signer = await loadSigner(provider);
  const override = {gasLimit:2000000}
  const customContract = new Contract(marketAddress, voteAbi, signer);
  let receipt;
  let tx = await customContract.voteOffer(offerer, tokenAddress, override)
  try{
    receipt = await tx.wait();
  }catch(e){
    receipt = 'Error: ',e.toString()
  }
  console.log('Transaction receipt');
  console.log(receipt);
  return receipt;
}
export async function importERC721(tokenId, tokenAddress, provider, marketAddress){
  const importERC721Abi = [
    "function importERC721(address _tokenAddress, uint256 _tokenId)"
  ];
  const signer = await loadSigner(provider);
  const override = {gasLimit:2000000}
  console.log(tokenId)
  console.log(tokenAddress)
  const customContract = new Contract(marketAddress, importERC721Abi, signer);
  let receipt;
  let tx = await customContract.importERC721(tokenAddress,tokenId, override)
  try{
    receipt = await tx.wait();
  }catch(e){
    receipt = 'Error: ',e.toString()
  }
  console.log('Transaction receipt');
  console.log(receipt);
  return receipt;
}
export async function importERC1155(tokenId, tokenAddress, provider, marketAddress){
  const importERC1155Abi = [
    "function importERC1155(address _tokenAddress, uint256 _tokenId)"
  ];
  const signer = await loadSigner(provider);
  const override = {gasLimit:2000000}
  console.log('importing ERC1155 address:',tokenAddress, ' and id: ',tokenId)
  const customContract = new Contract(marketAddress, importERC1155Abi, signer);
  let receipt;
  // get max tokenId (uin256) and override it..
  try{
    let tx = await customContract.importERC1155(tokenAddress,tokenId, override)
    receipt = await tx.wait();
  }catch(e){
    receipt = 'Error: ',e.toString()
  }
  console.log('Transaction receipt');
  console.log(receipt);
  return receipt;
}
//     function makeOffer(address tokenAddress, uint256 _value) public payable
export async function makeOffer(value, tokenAddress, provider, marketAddress){
  const makeOfferAbi = [
    "function makeOffer(address tokenAddress, uint256 _value) payable"
  ];
  const signer = await loadSigner(provider);
  const override = {gasLimit:2000000, value: value}
  const customContract = new Contract(marketAddress, makeOfferAbi, signer);
  let receipt;
  let tx = await customContract.makeOffer(tokenAddress,value, override)
  try{
    receipt = await tx.wait();
  }catch(e){
    receipt = 'Error: ',e.toString()
  }
  console.log('Transaction receipt');
  console.log(receipt);
  return receipt;
}
