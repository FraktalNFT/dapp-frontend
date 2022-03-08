import { Workflow } from 'types/workflow';

export const APPROVED_TRANSACTION = 'APPROVED_TRANSACTION';
export const CALL_CONTRACT = 'CALL_CONTRACT';
export const REJECTED_CONTRACT = 'REJECTED_CONTRACT';
export const ADD_AMOUNT = 'ADD_AMOUNT';
export const REMOVE_AMOUNT = 'REMOVE_AMOUNT';

export const COMPLETED_STATUS = 'COMPLETED';
export const PENDING_STATUS = 'PENDING';
export const REJECTED_STATUS = 'REJECTED';

export const CLOSE_MODAL = 'CLOSE_MODAL';

export const APPROVE_TOKEN = 'APPROVE_TOKEN';
export const BUYING_FRAKTIONS = 'BUYING_FRAKTIONS';
export const CLAIMING_BUYOUTS = 'CLAIMING_BUYOUTS';
export const CLAIMING_FRAKTIONS_PROFIT = 'CLAIMING_FRAKTIONS_PROFIT';
export const CLAIMING_REVENUE = 'CLAIMING_REVENUE';
export const CLAIM_DEPOSITED_FRAKTIONS = 'CLAIM_DEPOSITED_FRAKTIONS';
export const CLAIM_CONTRIBUTED_ETH = 'CLAIM_CONTRIBUTED_ETH';
export const DEPOSIT_REVENUE = 'DEPOSIT_REVENUE';
export const IMPORT_NFT = 'IMPORT_NFT';

export const IMPORT_FRAKTAL = 'IMPORT_FRAKTAL';
export const EXPORT_FRAKTAL = 'EXPORT_FRAKTAL';

export const MINT_NFT = 'MINT_NFT';
export const LISTING_NFT = 'LISTING_NFT';
export const OFFERING_BUYOUT = 'OFFERING_BUYOUT';
export const VOTING_BUYOUTS = 'VOTING_BUYOUTS';
export const PARTICIPATE_AUCTION = 'PARTICIPATE_AUCTION';

export const UNLIST_NFT = 'UNLIST_NFT';
export const UNLIST_AUCTION_NFT = 'UNLIST_AUCTION_NFT';
export const REJECT_OFFER = 'REJECT_OFFER';

export const CLAIM_NFT = 'CLAIM_NFT';

export type ActionOpts = { workflow?: Workflow, custom?: any };

export const callContract = (
  transactionType,
  obj,
  opts: ActionOpts = {}
) => {
  return {
    obj: obj,
    transactionType,
    type: CALL_CONTRACT,
    ...opts,
  };
};

export const rejectContract = (
  transactionType,
  obj,
  buttonAction?: any,
  opts: ActionOpts = {}
) => {
  return {
    obj: obj,
    transactionType,
    buttonAction,
    type: REJECTED_CONTRACT,
    ...opts,
  };
};

export const approvedTransaction = (
  transactionType,
  obj,
  tokenAddress?: string,
  opts: ActionOpts = {}
) => {
  return {
    obj: obj,
    transactionType,
    tokenAddress,
    type: APPROVED_TRANSACTION,
    ...opts,
  };
};

export const closeModal = () => {
  return {
    type: CLOSE_MODAL,
  };
};

export const addAmount = (amount) => {
  return {
    amount,
    type: ADD_AMOUNT,
  };
};

export const removeAmount = () => {
  return {
    type: REMOVE_AMOUNT,
  };
};
