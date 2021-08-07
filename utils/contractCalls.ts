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

export async function unlockShares(id, amount,to, provider, contract) {
  const unlockAbi = [
    "function unlockShares(uint256 _tokenId,uint256 _amount,address _to)"
  ];
  const signer = await loadSigner(provider);
  const customContract = new Contract(contract, unlockAbi, signer);
  let receipt;
  let tx = await customContract.unlockShares(id, amount, to)
  try{
    receipt = await tx.wait();
  }catch(e){
    receipt = 'Error: ',e.toString()
  }
  console.log('Transaction receipt');
  console.log(receipt);
  return receipt;
}

export async function lockShares(id, amount,to, provider, contract) {
  const lockAbi = [
    "function lockShares(uint256 _tokenId,uint256 _amount,address _to)"
  ];
  const signer = await loadSigner(provider);
  const customContract = new Contract(contract, lockAbi, signer);
  let receipt;
  let tx = await customContract.lockShares(id, amount, to)
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

export async function listItem(tokenId,amount,price,type,provider,contractAddress){
  const listItemAbi = [
    "function listItem(uint256 _tokenId,uint256 _price,uint256 _numberOfShares,string _type)"
  ];
  const signer = await loadSigner(provider);
  const customContract = new Contract(contractAddress, listItemAbi, signer);
  let receipt;
  let tx = await customContract.listItem(tokenId, price, amount, type)
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
export async function sellerClaim(tokenId, provider, contractAddress){
  const rescueEthAbi = [
    "function rescueEth(uint256 _tokenId)"
  ];
  const signer = await loadSigner(provider);
  const customContract = new Contract(contractAddress, rescueEthAbi, signer);
  let receipt;
  const override = {gasLimit:60000}
  let tx = await customContract.rescueEth(tokenId,override)
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
    "function buy(address from,uint256 _tokenId,uint256 _numberOfShares) payable"
  ];
  const signer = await loadSigner(provider);
  const override = {value:value, gasLimit:160000}
  const customContract = new Contract(contractAddress, buyAbi, signer);
  let receipt;
  let tx = await customContract.buy(seller, tokenId, amount, override)
  try{
    receipt = await tx.wait();
  }catch(e){
    receipt = 'Error: ',e.toString()
  }
  console.log('Transaction receipt');
  console.log(receipt);
  return receipt;
}
