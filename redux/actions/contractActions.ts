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
export const DEPOSIT_REVENUE = 'DEPOSIT_REVENUE';
export const IMPORT_NFT = 'IMPORT_NFT';
export const IMPORT_FRAKTAL = 'IMPORT_FRAKTAL';
export const MINT_NFT = 'MINT_NFT';
export const LISTING_NFT = 'LISTING_NFT';
export const OFFERING_BUYOUT = 'OFFERING_BUYOUT';
export const VOTING_BUYOUTS = 'VOTING_BUYOUTS';

export const callContract = (transactionType, obj) => {
    return {
        obj: obj,
        transactionType,
        type: CALL_CONTRACT
    }
};

export const rejectContract = (transactionType, obj, buttonAction) => {
    return {
        obj: obj,
        transactionType,
        buttonAction,
        type: REJECTED_CONTRACT
    }
};

export const approvedTransaction = (transactionType, obj, tokenAddress) => {
    return {
        obj: obj,
        transactionType,
        tokenAddress,
        type: APPROVED_TRANSACTION
    }
};

export const closeModal = () => {
    return {
        type: CLOSE_MODAL
    }
};

export const addAmount = (amount) => {
    return {
        amount,
        type: ADD_AMOUNT
    }
};

export const removeAmount = () => {
    return {
        type: REMOVE_AMOUNT
    }
};