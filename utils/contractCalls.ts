import { Contract } from "@ethersproject/contracts";

export async function transferToken(tokenId, subId, amount, to, signer, contractAddress) {
  const transferAbi = [
    "function makeSafeTransfer(address _to,uint256 _tokenId,uint256 _subId,uint256 _amount)"
  ];
  console.log('inputs',tokenId,subId,amount,to,signer,contractAddress)
  const customContract = new Contract(contractAddress, transferAbi, signer);
  let receipt;
  let tx = await customContract.makeSafeTransfer(to, tokenId, subId,amount)
  try{
    receipt = await tx.wait();
  }catch(e){
    receipt = 'Error: ',e.toString() //test this
  }
  console.log('Transaction receipt');
  console.log(receipt);
  return receipt;
}

export async function unlockShares(id, amount,to, signer, contract) {
  const unlockAbi = [
    "function unlockShares(uint256 _tokenId,uint256 _amount,address _to)"
  ];
  const customContract = new Contract(contract, unlockAbi, signer);
  let receipt;
  let tx = await customContract.unlockShares(id, amount, to)
  try{
    receipt = await tx.wait();
  }catch(e){
    receipt = 'Error: ',e.toString() //test this
  }
  console.log('Transaction receipt');
  console.log(receipt);
  return receipt;
}

export async function lockShares(id, amount,to, signer, contract) {
  const lockAbi = [
    "function lockShares(uint256 _tokenId,uint256 _amount,address _to)"
  ];
  console.log('inputs',id,amount,to,signer,contract)
  const customContract = new Contract(contract, lockAbi, signer);
  let receipt;
  let tx = await customContract.lockShares(id, amount, to) // fails on cannot estimate gas. with pre-settings passes.
  try{
    receipt = await tx.wait();
  }catch(e){
    receipt = 'Error: ',e.toString() //test this
  }
  console.log('Transaction receipt');
  console.log(receipt);
  return receipt;
}

export async function createNFT(hash, signer, contractAddress,optionalBytecode){
    const mintAbi = [
      "function mint(string tokenURI)"
    ];
    // console.log('hash', hash, 'signer', signer, 'contract', contractAddress)
    const customContract = new Contract(contractAddress, mintAbi, signer);
    if (optionalBytecode) customContract.bytecode = optionalBytecode; // for overwriting contract instance
    let receipt;
    let tx = await customContract.mint(hash) // fails on cannot estimate gas. with pre-settings passes.
    try{
      receipt = await tx.wait();
    }catch(e){
      receipt = 'Error: ',e.toString() //test this
    }
    console.log('Transaction receipt');
    console.log(receipt);
    return receipt;
}

export async function listItem(tokenId,amount,price,type,signer,contractAddress){
  const listItemAbi = [
    "function listItem(uint256 _tokenId,uint256 _price,uint256 _numberOfShares,string _type)"
  ];
  console.log('inputs',tokenId,amount,price,signer,contractAddress)
  const customContract = new Contract(contractAddress, listItemAbi, signer);
  let receipt;
  let tx = await customContract.listItem(tokenId, price, amount, type)
  try{
    receipt = await tx.wait();
  }catch(e){
    receipt = 'Error: ',e.toString() //test this
  }
  console.log('Transaction receipt');
  console.log(receipt);
  return receipt;
}

export async function unlistItem(tokenId, signer, contractAddress){
  const unlistItemAbi = [
    "function unlistItem(uint256 _tokenId)"
  ];
  const customContract = new Contract(contractAddress, unlistItemAbi, signer);
  let receipt;
  let tx = await customContract.unlistItem(tokenId)
  try{
    receipt = await tx.wait();
  }catch(e){
    receipt = 'Error: ',e.toString() //test this
  }
  console.log('Transaction receipt');
  console.log(receipt);
  return receipt;
}
export async function sellerClaim(tokenId, signer, contractAddress){
  const rescueEthAbi = [
    "function rescueEth(uint256 _tokenId)"
  ];
  const customContract = new Contract(contractAddress, rescueEthAbi, signer);
  let receipt;
  let tx = await customContract.rescueEth(tokenId)
  try{
    receipt = await tx.wait();
  }catch(e){
    receipt = 'Error: ',e.toString()
  }
  console.log('Transaction receipt');
  console.log(receipt);
  return receipt;
}

export async function buyFraktions(seller, tokenId,amount,value,signer,contractAddress){
  const buyAbi = [
    "function buy(address from,uint256 _tokenId,uint256 _numberOfShares) payable"
  ];
  console.log('inputs',tokenId,amount,seller, value)
  const override = {value:value, gasLimit:160000}
  const customContract = new Contract(contractAddress, buyAbi, signer);
  let receipt;
  let tx = await customContract.buy(seller, tokenId, amount, override)
  try{
    receipt = await tx.wait();
  }catch(e){
    receipt = 'Error: ',e.toString() //test this
  }
  console.log('Transaction receipt');
  console.log(receipt);
  return receipt;
}
