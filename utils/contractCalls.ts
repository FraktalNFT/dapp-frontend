import { Contract } from '@ethersproject/contracts';
import { loadSigner, processTx, awaitTokenAddress } from './helpers';
import { useMintingContext } from '@/contexts/NFTIsMintingContext';
import { BigNumber, ethers, utils } from 'ethers';
import {LARGEST_UINT256} from './constants';
import store from '../redux/store';
import {
  ActionOpts,
  approvedTransaction,
  callContract,
  CLAIM_CONTRIBUTED_ETH,
  CLAIM_DEPOSITED_FRAKTIONS,
  CLAIM_NFT,
  EXPORT_FRAKTAL,
  PARTICIPATE_AUCTION,
  rejectContract,
  REJECT_OFFER,
  UNLIST_AUCTION_NFT,
  UNLIST_NFT,
} from '../redux/actions/contractActions';
import {
  APPROVE_TOKEN,
  BUYING_FRAKTIONS,
  CLAIMING_BUYOUTS,
  CLAIMING_FRAKTIONS_PROFIT,
  CLAIMING_REVENUE,
  DEPOSIT_REVENUE,
  IMPORT_FRAKTAL,
  IMPORT_NFT,
  MINT_NFT,
  LISTING_NFT,
  OFFERING_BUYOUT,
  VOTING_BUYOUTS,
} from '../redux/actions/contractActions';

//tested
const factoryAbi = [
    'function mint(string urlIpfs, uint16 majority, string _name, string _symbol)',
    'function importERC721(address _tokenAddress, uint256 _tokenId, uint16 majority)',
    'function importERC1155(address _tokenAddress, uint256 _tokenId, uint16 majority)',
    'function claimERC721(uint256 _tokenId)',
    'function claimERC1155(uint256 _tokenId)',
];
const marketAbi = [
    'function importFraktal(address tokenAddress, uint256 fraktionsIndex)',
    'function rescueEth()',
    'function buyFraktions(address from, address tokenAddress, uint256 _numberOfShares) payable',
    'function claimFraktal(address tokenAddress)',
    'function voteOffer(address offerer, address tokenAddress)',
    'function makeOffer(address tokenAddress, uint256 _value) payable',
    'function listItem(address _tokenAddress,uint256 _price,uint256 _numberOfShares, string _name) external returns (bool)',
    'function unlistItem(address tokenAddress)',
    'function maxPriceRegistered(address) view returns (uint256)',
    'function exportFraktal(address tokenAddress)',
    'function rejectOffer(address from, address to, address tokenAddress) external',
    'function redeemAuctionSeller(address _tokenAddress,address _seller,uint256 _sellerNonce) external',
    'function redeemAuctionParticipant(address _tokenAddress,address _seller,uint256 _sellerNonce) external',
    'function participateAuction(address tokenAddress,address seller,uint256 sellerNonce) external payable',
    'function listItemAuction(address _tokenAddress,uint256 _reservePrice,uint256 _numberOfShares, string _name) external returns (uint256)',
    'function unlistAuctionItem(address tokenAddress,uint256 sellerNonce) external',
    'function auctionReserve(address, uint256) public view returns (uint256)',
    'function participantContribution(address, uint256, address) public view returns (uint256)',
    'function auctionListings(address, address, uint256) public view returns (address, uint256, uint256, uint256)',
    'function getListingAmount(address _listOwner, address tokenAddress) external view returns (uint256)',
];
const tokenAbi = [
    'function isApprovedForAll(address account,address operator) external view returns (bool)',
    'function makeSafeTransfer(address _to,uint256 _tokenId,uint256 _subId,uint256 _amount)',
    'function getLockedShares(uint256 index, address who) public view returns(uint)',
    'function getFraktionsIndex() public view returns (uint256)',
    'function getLockedToTotal(uint256 index, address who) public view returns(uint)',
    'function fraktionalize(uint256 _tokenId)',
    'function defraktionalize() public',
    'function setApprovalForAll(address operator, bool approved)',
    'function unlockSharesTransfer(address from, address _to)',
    'function lockSharesTransfer(address from, uint numShares, address _to)',
    'function createRevenuePayment(address _marketAddress) payable',
    'function balanceOf(address account, uint256 id) external view returns (uint256)',
    'function majority() public view returns (uint)',
    'function fraktionsIndex() public view returns (uint256)',
    'function indexUsed(uint256) view returns (bool)',
];
const revenuesAbi = [
    'function shares(address account) external view returns (uint256)',
    'function released(address account) public view returns (uint256)',
    'function release() public',
    'function totalShares() external view returns (uint256)',
];
const airdropABI = [
  'function claim(uint256,bytes32[],address) external',
  'function canClaim(address,uint256,bytes32[]) external view returns (bool)'
];
const lpStakingABI = [
  'function deposit(uint256) external',
  'function harvest() external',
  'function withdraw(uint256) external',
  'function calculatePendingRewards(address) external view returns (uint256)',
  'function userInfo(address user) external view returns (uint256,uint256)'
];
const tradingRewardsABI = [
  'function canClaim(address,uint256,bytes32[]) external view returns (bool,uint256)',
  'function claim(uint256,bytes32[]) external'
];
const feeSharingABI = [
  'function deposit(uint256,bool) external',
  'function harvest() external',
  'function calculatePendingRewards(address) external view returns (uint256)',
  'function withdraw(uint256,bool) external',
  'function withdrawAll(bool) external',
  'function userInfo(address user) external view returns (uint256,uint256,uint256)'
];
const erc20ABI = [
  'function balanceOf(address account) external view returns (uint256)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)'
];

// TODO
const transferAbi = [
  'function makeSafeTransfer(address _to,uint256 _tokenId,uint256 _subId,uint256 _amount)',
];

export async function getShares(account, provider, revenueContract) {
  try {
    const customContract = new Contract(revenueContract, revenuesAbi, provider);
    let shares = await customContract.shares(account);
    return shares;
  } catch {
    return 'error getting shares';
  }
}

export async function getTotalShares(provider, revenueContract) {
  try {
    const customContract = new Contract(revenueContract, revenuesAbi, provider);
    let shares = await customContract.totalShares();
    return shares;
  } catch {
    return 'error getting shares';
  }
}
export async function getReleased(account, provider, revenueContract) {
  try {
    const customContract = new Contract(revenueContract, revenuesAbi, provider);
    let released = await customContract.released(account);
    return released;
  } catch {
    return 'error getting released';
  }
}

export async function release(provider, revenueAddress, tokenAddress) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(revenueAddress, revenuesAbi, signer);
  try {
    let tx = await customContract.release();
    store.dispatch(callContract(CLAIMING_REVENUE, tx));
    let receipt = await processTx(tx);
    store.dispatch(approvedTransaction(CLAIMING_REVENUE, tx, tokenAddress));
    return receipt;
  } catch (e) {
    throw e;
  }
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
    return 'error';
  }
}
export async function getFraktionsIndex(provider, tokenContract) {
  try {
    const customContract = new Contract(tokenContract, tokenAbi, provider);
    let index = await customContract.fraktionsIndex();
    return index.toNumber();
  } catch {
    return 'not Fraktal';
  }
}
export async function getBalanceFraktions(account, provider, tokenContract, index) {
   const customContract = new Contract(tokenContract, tokenAbi, provider);
   let balanceOfId: BigNumber = await customContract.balanceOf(account, index);
   balanceOfId = balanceOfId.div(utils.parseEther('1'));
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
  return utils.formatEther(lockedShares);
}

export async function getLockedTo(account, tokenAddress, provider) {
  const customContract = new Contract(tokenAddress, tokenAbi, provider);
  let index = await customContract.getFraktionsIndex();
  let lockedShares = await customContract.getLockedToTotal(index, account);
  return lockedShares.toNumber();
}
export async function getListingAmount(
  sellerAddress,
  tokenAddress,
  provider,
  marketContract
) {
  const customContract = new Contract(marketContract, marketAbi, provider);
  let listingAmount = await customContract.getListingAmount(
    sellerAddress,
    tokenAddress
  );
  return listingAmount;
}
export async function getSellerNonce(sellerAddress, provider, marketContract) {
  const customContract = new Contract(marketContract, marketAbi, provider);
  let nonce = await customContract.auctionNonce(sellerAddress);
  return nonce;
}
export async function getAuctionReserve(
  sellerAddress,
  sellerNonce,
  provider,
  marketContract
) {
  const customContract = new Contract(marketContract, marketAbi, provider);
  let nonce = await customContract.auctionReserve(sellerAddress, sellerNonce);
  return nonce;
}
export async function getAuctionListings(
  tokenAddress,
  sellerAddress,
  sellerNonce,
  provider,
  marketContract
) {
  const customContract = new Contract(marketContract, marketAbi, provider);
  let nonce = await customContract.auctionListings(
    tokenAddress,
    sellerAddress,
    sellerNonce
  );
  return nonce;
}
export async function getParticipantContribution(
  sellerAddress,
  sellerNonce,
  participantAddress,
  provider,
  marketContract
) {
  const customContract = new Contract(marketContract, marketAbi, provider);
  let nonce = await customContract.participantContribution(
    sellerAddress,
    sellerNonce,
    participantAddress
  );
  return nonce;
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
  let receipt = await processTx(tx);
  return receipt;
}

export async function fraktionalize(id, provider, contract) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(contract, tokenAbi, signer);
  let tx = await customContract.fraktionalize(id);
  let receipt = await processTx(tx);
  return receipt;
}
export async function claimERC721(
  marketId,
  provider,
  contract,
  opts?: ActionOpts
) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(contract, factoryAbi, signer);
  let tx = await customContract.claimERC721(marketId);
  store.dispatch(callContract(CLAIM_NFT, tx, opts));
  let receipt = await processTx(tx);
  if (!receipt?.error) {
    store.dispatch(approvedTransaction(CLAIM_NFT, tx, contract, opts));
  }
  return receipt;
}
export async function claimERC1155(
  marketId,
  provider,
  contract,
  opts?: ActionOpts
) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(contract, factoryAbi, signer);
  let tx = await customContract.claimERC1155(marketId);
  store.dispatch(callContract(CLAIM_NFT, tx, opts));
  let receipt = await processTx(tx);
  if (!receipt?.error) {
    store.dispatch(approvedTransaction(CLAIM_NFT, tx, contract, opts));
  }
  return receipt;
}
export async function defraktionalize(provider, contract) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(contract, tokenAbi, signer);
  let tx = await customContract.defraktionalize();
  let receipt = await processTx(tx);
  return receipt;
}

export async function approveMarket(to, provider, contract, opts?: ActionOpts) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(contract, tokenAbi, signer);
  try {
    let tx = await customContract.setApprovalForAll(to, true);
    store.dispatch(callContract(APPROVE_TOKEN, tx, opts));
    let receipt = await processTx(tx);
    if (!receipt?.error) {
      store.dispatch(approvedTransaction(APPROVE_TOKEN, tx, contract, opts));
    }
    return receipt;
  } catch (e) {
    throw e;
  }
}

export async function unlockShares(from, to, provider, tokenContract) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(tokenContract, tokenAbi, signer);
  let tx = await customContract.unlockSharesTransfer(from, to);
  let receipt = await processTx(tx);
  return receipt;
}

export async function lockShares(from, to, provider, tokenContract) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(tokenContract, tokenAbi, signer);
  let tx = await customContract.lockSharesTransfer(from, to);
  let receipt = await processTx(tx);
  return receipt;
}

const defaultMajority = 8000; //later give this argument to the creator (or owner)

export async function createNFT(
  hash,
  provider,
  contractAddress,
  opts?: ActionOpts
) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(contractAddress, factoryAbi, signer);
  try {
    let tx = await customContract.mint(hash, defaultMajority, "", "");
    store.dispatch(callContract(MINT_NFT, tx, opts));
    let receipt = await awaitTokenAddress(tx);
    
    if (!receipt?.error) {
      store.dispatch(approvedTransaction(MINT_NFT, tx, receipt, opts));
    }
    return receipt;
  } catch (e) {
    throw e;
  }
}

export async function importFraktal(
  tokenAddress,
  fraktionsIndex,
  provider,
  marketAddress,
  opts?: ActionOpts
) {
  const signer = await loadSigner(provider);
  const override = { gasLimit: 500000 };
  const customContract = new Contract(marketAddress, marketAbi, signer);
  try {
    let tx = await customContract.importFraktal(
      tokenAddress,
      fraktionsIndex,
      override
    );
    store.dispatch(callContract(IMPORT_FRAKTAL, tx, opts));
    let receipt = await processTx(tx);
    if (!receipt?.error) {
      store.dispatch(
        approvedTransaction(IMPORT_FRAKTAL, tx, tokenAddress, opts)
      );
    }
    return receipt;
  } catch (e) {
    throw e;
  }
}

export async function exportFraktal(
  tokenAddress,
  provider,
  marketAddress,
  opts?: ActionOpts
) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(marketAddress, marketAbi, signer);
  let tx = await customContract.exportFraktal(tokenAddress);
  store.dispatch(callContract(EXPORT_FRAKTAL, tx, opts));
  let receipt = await processTx(tx);
  if (!receipt?.error) {
    store.dispatch(approvedTransaction(EXPORT_FRAKTAL, tx, tokenAddress, opts));
  }
  return receipt;
}

export async function importERC721(
  tokenId,
  tokenAddress,
  provider,
  factoryAddress,
  opts?: ActionOpts
) {
  const signer = await loadSigner(provider);
  const override = { gasLimit: 1000000 };
  const customContract = new Contract(factoryAddress, factoryAbi, signer);
  try {
    let tx = await customContract.importERC721(
      tokenAddress,
      tokenId,
      defaultMajority,
      override
    );
    store.dispatch(callContract(IMPORT_NFT, tx, opts));
    let mintedTokenAddress = await awaitTokenAddress(tx);
    if (!mintedTokenAddress?.error) {
      store.dispatch(
        approvedTransaction(IMPORT_NFT, tx, mintedTokenAddress, opts)
      );
    }
    return mintedTokenAddress;
  } catch (e) {
    throw e;
  }
}

export async function importERC1155(
  tokenId,
  tokenAddress,
  provider,
  factoryAddress,
  opts?: ActionOpts
) {
  const signer = await loadSigner(provider);
  const override = { gasLimit: 1000000 };
  const customContract = new Contract(factoryAddress, factoryAbi, signer);

  try {
    let tx = await customContract.importERC1155(
      tokenAddress,
      tokenId,
      defaultMajority,
      override
    );
    store.dispatch(callContract(IMPORT_NFT, tx, opts));
    let mintedTokenAddress = await awaitTokenAddress(tx);
    if (!mintedTokenAddress?.error) {
      store.dispatch(
        approvedTransaction(IMPORT_NFT, tx, mintedTokenAddress, opts)
      );
    }
    return mintedTokenAddress;
  } catch (e) {
    throw e;
  }
}

export async function listItem(
  tokenAddress,
  amount,
  price,
  provider,
  marketAddress,
  name,
  opts?: ActionOpts
) {
  const override = { gasLimit: 300000 };
  const signer = await loadSigner(provider);
  const customContract = new Contract(marketAddress, marketAbi, signer);
  try {
    let tx = await customContract.listItem(tokenAddress, price, amount, name, override);
    store.dispatch(callContract(LISTING_NFT, tx, opts));
    let receipt = await processTx(tx);
    if (!receipt?.error) {
      store.dispatch(approvedTransaction(LISTING_NFT, tx, tokenAddress, opts));
    }
    return receipt;
  } catch (e) {
    throw e;
  }
}

export async function unlistItem(
  tokenAddress,
  provider,
  marketAddress,
  opts?: ActionOpts
) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(marketAddress, marketAbi, signer);
  let tx = await customContract.unlistItem(tokenAddress);
  store.dispatch(callContract(UNLIST_NFT, tx, opts));
  let receipt = await processTx(tx);
  if (!receipt?.error) {
    store.dispatch(approvedTransaction(UNLIST_NFT, tx, tokenAddress, opts));
  }
  return receipt;
}

/**
 * CLAIMING_BUYOUTS? - Rescue Eth
 * @param provider
 * @param marketAddress
 * @returns {Promise<any>}
 */
export async function rescueEth(provider, marketAddress) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(marketAddress, marketAbi, signer);
  const override = { gasLimit: 100000 };
  try {
    let tx = await customContract.rescueEth(override);
    store.dispatch(callContract(CLAIMING_BUYOUTS, tx));
    let receipt = await processTx(tx);
    if (!receipt?.error) {
      store.dispatch(approvedTransaction(CLAIMING_BUYOUTS, tx, receipt));
    }
    return receipt;
  } catch (e) {
    throw e;
  }
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
  try {
    let tx = await customContract.buyFraktions(
      seller,
      tokenAddress,
      amount,
      override
    );
    tx.amount = amount;
    store.dispatch(callContract(BUYING_FRAKTIONS, tx));
    let receipt = await processTx(tx);
    if (!receipt?.error) {
      store.dispatch(approvedTransaction(BUYING_FRAKTIONS, tx, tokenAddress));
    }
    return receipt;
  } catch (e) {
    throw e;
  }
}

export async function createRevenuePayment(
  value,
  provider,
  fraktalAddress,
  marketAddress
) {
  const signer = await loadSigner(provider);
  const override = { value: value, gasLimit: 700000 };
  const customContract = new Contract(fraktalAddress, tokenAbi, signer);
  try {
    let tx = await customContract.createRevenuePayment(marketAddress, override);
    store.dispatch(callContract(DEPOSIT_REVENUE, tx));
    let receipt = await processTx(tx);
    if (!receipt?.error) {
      store.dispatch(approvedTransaction(DEPOSIT_REVENUE, tx, fraktalAddress));
    }
    return receipt;
  } catch (e) {
    throw e;
  }
}

export async function claimFraktalSold(tokenId, provider, marketAddress) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(marketAddress, marketAbi, signer);
  try {
    let tx = await customContract.claimFraktal(tokenId);
    store.dispatch(callContract(CLAIMING_FRAKTIONS_PROFIT, tx));
    let receipt = await processTx(tx);
    if (!receipt?.error) {
      store.dispatch(
        approvedTransaction(CLAIMING_FRAKTIONS_PROFIT, tx, tokenId)
      );
    } else {
      throw Error(receipt?.error);
    }
    return receipt;
  } catch (e) {
    throw e;
  }
}

export async function rejectOffer(
  from,
  to,
  tokenAddress,
  provider,
  marketAddress
) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(marketAddress, marketAbi, signer);
  let tx = await customContract.rejectOffer(from, to, tokenAddress);
  store.dispatch(callContract(REJECT_OFFER, tx));
  let receipt = await processTx(tx);
  if (!receipt?.error) {
    store.dispatch(approvedTransaction(REJECT_OFFER, tx, tokenAddress));
  } else {
    throw Error(receipt?.error);
  }
  return receipt;
}

/**
 * Voting Out
 * @param offerer
 * @param tokenAddress
 * @param provider
 * @param marketAddress
 * @returns {Promise<any>}
 */
export async function voteOffer(
  offerer,
  tokenAddress,
  provider,
  marketAddress
) {
  const signer = await loadSigner(provider);
  const override = { gasLimit: 2000000 };
  const customContract = new Contract(marketAddress, marketAbi, signer);
  try {
    let tx = await customContract.voteOffer(offerer, tokenAddress, override);
    store.dispatch(callContract(VOTING_BUYOUTS, tx));
    let receipt = await processTx(tx);
    if (!receipt?.error) {
      store.dispatch(approvedTransaction(VOTING_BUYOUTS, tx, tokenAddress));
    }
    return receipt;
  } catch (e) {
    throw e;
  }
}

/**
 * Make Offer Buyout
 * @param value
 * @param tokenAddress
 * @param provider
 * @param marketAddress
 * @returns {Promise<any>}
 */
export async function makeOffer(value, tokenAddress, provider, marketAddress) {
  const signer = await loadSigner(provider);
  const override = { gasLimit: 2000000, value: value };
  const customContract = new Contract(marketAddress, marketAbi, signer);
  try {
    let tx = await customContract.makeOffer(tokenAddress, value, override);
    store.dispatch(callContract(OFFERING_BUYOUT, tx));
    let receipt = await processTx(tx);
    if (!receipt?.error) {
      store.dispatch(approvedTransaction(OFFERING_BUYOUT, tx, tokenAddress));
    } else {
      throw Error(receipt?.error);
    }
    return receipt;
  } catch (e) {
    throw e;
  }
}

export async function redeemAuctionSeller(
  tokenAddress,
  seller,
  sellerNonce,
  provider,
  marketAddress
) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(marketAddress, marketAbi, signer);
  let tx = await customContract.redeemAuctionSeller(
    tokenAddress,
    seller,
    sellerNonce
  );
  store.dispatch(callContract(CLAIM_CONTRIBUTED_ETH, tx));
  let receipt = await processTx(tx);
  if (!receipt?.error) {
    store.dispatch(
      approvedTransaction(CLAIM_CONTRIBUTED_ETH, tx, tokenAddress)
    );
  }
  return receipt;
}

export async function estimateRedeemAuctionSeller(
  tokenAddress,
  seller,
  sellerNonce,
  provider,
  marketAddress
) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(marketAddress, marketAbi, signer);
  let tx = await customContract.estimateGas.redeemAuctionSeller(
    tokenAddress,
    seller,
    sellerNonce
  );
  return tx;
}

export async function redeemAuctionParticipant(
  tokenAddress,
  seller,
  sellerNonce,
  provider,
  marketAddress
) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(marketAddress, marketAbi, signer);
  let tx = await customContract.redeemAuctionParticipant(
    tokenAddress,
    seller,
    sellerNonce
  );
  store.dispatch(callContract(CLAIM_DEPOSITED_FRAKTIONS, tx));
  let receipt = await processTx(tx);
  if (!receipt?.error) {
    store.dispatch(
      approvedTransaction(CLAIM_DEPOSITED_FRAKTIONS, tx, tokenAddress)
    );
  }
  return receipt;
}
export async function participateAuction(
  tokenAddress,
  seller,
  sellerNonce,
  value,
  provider,
  marketAddress
) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(marketAddress, marketAbi, signer);

  let override = {};
  if (value != 0) {
    override = { value: value };
  }
  let tx = await customContract.participateAuction(
    tokenAddress,
    seller,
    sellerNonce,
    override
  );
  store.dispatch(callContract(PARTICIPATE_AUCTION, tx));
  let receipt = await processTx(tx);
  if (!receipt?.error) {
    store.dispatch(approvedTransaction(PARTICIPATE_AUCTION, tx, tokenAddress));
  }
  return receipt;
}
export async function listItemAuction(
  tokenAddress,
  reservePrice,
  numberOfShares,
  provider,
  marketAddress,
  name,
  opts?: ActionOpts
) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(marketAddress, marketAbi, signer);
  try {
    let tx = await customContract.listItemAuction(
      tokenAddress,
      reservePrice,
      numberOfShares,
      name
    );
    store.dispatch(callContract(LISTING_NFT, tx, opts));
    let receipt = await processTx(tx);
    if (!receipt?.error) {
      store.dispatch(approvedTransaction(LISTING_NFT, tx, tokenAddress, opts));
    }
    return receipt;
  } catch (e) {
    throw e;
  }
}
export async function unlistAuctionItem(
  tokenAddress,
  sellerNonce,
  provider,
  marketAddress,
  opts?: ActionOpts
) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(marketAddress, marketAbi, signer);
  let tx = await customContract.unlistAuctionItem(tokenAddress, sellerNonce);
  store.dispatch(callContract(UNLIST_AUCTION_NFT, tx));
  let receipt = await processTx(tx);
  if (!receipt?.error) {
    store.dispatch(
      approvedTransaction(UNLIST_AUCTION_NFT, tx, tokenAddress, opts)
    );
  }
  return receipt;
}

// const airdropABI = [
//   'function claim(uint256,bytes32[],address) external',
//   'function canClaim(address,uint256,bytes32[]) external view returns (bool)'
// ];
export async function claimAirdrop(
  amount,
  merkleProof,
  listedTokenAddress,
  provider,
  airdropAddress,
  opts?: ActionOpts
) {
  console.log({amount,merkleProof,listedTokenAddress,provider,airdropAddress});
  
  const signer = await loadSigner(provider);
  console.log({provider,airdropAddress, airdropABI, signer});
  const customContract = new Contract(airdropAddress, airdropABI, signer);
  let tx = await customContract.claim(amount,merkleProof,listedTokenAddress);
  let receipt = await processTx(tx);
  return receipt;
}
export async function canClaimAirdrop(
  userAddress,
  amount,
  merkleProof,
  provider,
  airdropAddress,
  opts?: ActionOpts
) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(airdropAddress, airdropABI, signer);
  let tx = await customContract.canClaim(userAddress,amount,merkleProof);
  return tx;
}


// const lpStakingABI = [
//   'function deposit(uint256) external',
//   'function harvest() external',
//   'function withdraw(uint256) external',
//   'function calculatePendingRewards(address) external view returns (uint256)'
//    'function userInfo(address user) external view returns (uint256,uint256)'
// ];

export async function lpStakingUserInfo(
  userAddress,
  provider,
  lpStakingAddress,
  opts?: ActionOpts
) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(lpStakingAddress, lpStakingABI, signer);
  let tx = await customContract.userInfo(userAddress);
  return tx;
}
export async function lpStakingHarvest(
  provider,
  lpStakingAddress,
  opts?: ActionOpts
) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(lpStakingAddress, lpStakingABI, signer);
  let tx = await customContract.harvest();
  let receipt = await processTx(tx);
  return receipt;
}
export async function lpStakingWithdraw(
  amount,
  provider,
  lpStakingAddress,
  opts?: ActionOpts
) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(lpStakingAddress, lpStakingABI, signer);
  let tx = await customContract.withdraw(amount);
  let receipt = await processTx(tx);
  return receipt;
}
export async function lpStakingCalculateRewards(
  userAddress,
  provider,
  lpStakingAddress,
  opts?: ActionOpts
) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(lpStakingAddress, lpStakingABI, signer);
  let tx = await customContract.calculatePendingRewards(userAddress);
  return tx;
}

export async function lpStakingDeposit(
  amount,
  provider,
  lpStakingAddress,
  opts?: ActionOpts
) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(lpStakingAddress, lpStakingABI, signer);
  let tx = await customContract.deposit(amount);
  let receipt = await processTx(tx);
  return receipt;
}


// const tradingRewardsABI = [
//   'function canClaim(address,uint256,bytes32[]) external view returns (bool,uint256)',
//   'function claim(uint256,bytes32[]) external'
// ];

export async function tradingRewardsCanClaim(
  userAddress,
  amount,
  merkleProof,
  provider,
  tradingRewardsAddress,
  opts?: ActionOpts
) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(tradingRewardsAddress, tradingRewardsABI, signer);
  let tx = await customContract.canClaim(userAddress,amount,merkleProof);
  return tx;
}

export async function tradingRewardsClaim(
  amount,
  merkleProof,
  provider,
  tradingRewardsAddress,
  opts?: ActionOpts
) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(tradingRewardsAddress, tradingRewardsABI, signer);
  let tx = await customContract.claim(amount,merkleProof);
  let receipt = await processTx(tx);
  return receipt;
}


// const feeSharingABI = [
//   'function deposit(uint256,bool) external',
//   'function harvest() external',
//   'function calculatePendingRewards(address) external view returns (uint256)',
//   'function withdraw(uint256,bool) external',
//   'function withdrawAll(bool) external'
  // 'function userInfo(address) external return (uint256,uint256,uint256)'
// ];

export async function feeSharingUserInfo(
  userAddress,
  provider,
  feeSharingAddress,
  opts?: ActionOpts
) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(feeSharingAddress, feeSharingABI, signer);
  let tx = await customContract.userInfo(userAddress);
  return tx;
}
export async function feeSharingDeposit(
  amount,
  claimReward,
  provider,
  feeSharingAddress,
  opts?: ActionOpts
) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(feeSharingAddress, feeSharingABI, signer);
  let tx = await customContract.deposit(amount,claimReward);
  let receipt = await processTx(tx);
  return receipt;
}

export async function feeSharingHarvest(
  provider,
  feeSharingAddress,
  opts?: ActionOpts
) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(feeSharingAddress, feeSharingABI, signer);
  let tx = await customContract.harvest();
  let receipt = await processTx(tx);
  return receipt;
}

export async function feeSharingCalculatePendingRewards(
  userAddress,
  provider,
  feeSharingAddress,
  opts?: ActionOpts
) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(feeSharingAddress, feeSharingABI, signer);
  let tx = await customContract.calculatePendingRewards(userAddress);
  return tx;
}

export async function feeSharingWithdraw(
  amount,
  claimReward,
  provider,
  feeSharingAddress,
  opts?: ActionOpts
) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(feeSharingAddress, feeSharingABI, signer);
  let tx = await customContract.withdraw(amount,claimReward);
  let receipt = await processTx(tx);
  return receipt;
}

export async function feeSharingWithdrawAll(
  claimReward,
  provider,
  feeSharingAddress,
  opts?: ActionOpts
) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(feeSharingAddress, feeSharingABI, signer);
  let tx = await customContract.withdrawAll(claimReward);
  let receipt = await processTx(tx);
  return receipt;
}

// const erc20ABI = [
//   'function balanceOf(address account) external view returns (uint256)',
//   'function allowance(address owner, address spender) external view returns (uint256)',
//   'function approve(address spender, uint256 amount) external returns (bool)'
// ];
export async function erc20BalanceOf(
  userAddress,
  provider,
  erc20Address,
  opts?: ActionOpts
) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(erc20Address, erc20ABI, signer);
  let tx = await customContract.balanceOf(userAddress);
  return tx;
}

export async function erc20Allowance(
  userAddress,
  spenderAddress,
  provider,
  erc20Address,
  opts?: ActionOpts
) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(erc20Address, erc20ABI, signer);
  let tx = await customContract.allowance(userAddress, spenderAddress);
  return tx;
}

export async function erc20Approve(
  spenderAddress,
  provider,
  erc20Address,
  opts?: ActionOpts
) {
  const signer = await loadSigner(provider);
  const customContract = new Contract(erc20Address, erc20ABI, signer);
  let tx = await customContract.approve(spenderAddress, LARGEST_UINT256);
  let receipt = await processTx(tx);
  return receipt;
}
