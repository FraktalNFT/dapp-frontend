import { Contract } from "@ethersproject/contracts";

export async function transferToken(tokenId, subId, amount, to, signer, contractAddress) {
  const transferAbi = [
    "function makeSafeTransfer(address _to,uint256 _tokenId,uint256 _subId,uint256 _amount)"
  ];
  console.log('inputs',tokenId,subId,amount,to,signer,contractAddress)
  const customContract = new Contract(contractAddress, transferAbi, signer);
  let receipt;
  let tx = await customContract.makeSafeTransfer(to, tokenId, subId,amount) // fails on cannot estimate gas. with pre-settings passes.
  try{
    receipt = await tx.wait();
  }catch(e){
    receipt = 'Error: ',e.toString() //test this
  }
  console.log('Transaction receipt');
  console.log(receipt);
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
}

export async function createNFT(hash, signer, contractAddress,optionalBytecode){
    const mintAbi = [
      "function mint(string tokenURI)"
    ];
    const customContract = new Contract(contractAddress, mintAbi, signer);
    if (optionalBytecode) customContract.bytecode = optionalBytecode; // for overwriting contract instance
    let receipt;
    let tx = await contract.mint(hash) // fails on cannot estimate gas. with pre-settings passes.
    try{
      receipt = await tx.wait();
    }catch(e){
      receipt = 'Error: ',e.toString() //test this
    }
    console.log('Transaction receipt');
    console.log(receipt);
}
