import {
    CALL_CONTRACT,
    REJECTED_CONTRACT,
    APPROVED_TRANSACTION,
    CLOSE_MODAL,
    PENDING_STATUS,
    COMPLETED_STATUS,
    REJECTED_STATUS,
    ADD_AMOUNT,
    REMOVE_AMOUNT,
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
    VOTING_BUYOUTS
} from "../actions/contractActions";

const initState = {
    modalOpen: false,
    state: '',
    message: ''
};

const SUCCESSFUL_MESSAGE = 'Congrats! Your transaction has successfully been processed on Ethereum.';
const PENDING_MESSAGE = 'Please wait a few moments while your transaction is processed by Ethereum';
const REJECTED_MESSAGE = 'User Denied Metamask Signature';

const approveToken = {
    heading: 'Approving NFT',
    button: {
        text: 'Success'
    }
};

const buyingFraktions = {
    heading: 'Buying Fraktions',
    button: {
        text: 'View NFT'
    }
};

const claimingRevenue = {
    heading: 'Claiming Revenue',
    button: {
        text: 'View NFT'
    }
};

const claimingBuyout = {
    heading: 'Claiming Buy Out',
    button: {
        text: 'View NFT'
    }
};
const claimingFraktionsProfit = {
    heading: 'Claiming Fraktion Profit',
    button: {
        text: 'View NFT'
    }
};
const depositingRevenue = {
    heading: 'Depositing Revenue',
    button: {
        text: 'View NFT'
    }
};

const importFraktal = {
    heading: 'Fraktionalizing NFT',
    button: {
        text: 'Success'
    }
};

const importNFT = {
    heading: 'Frationalizing NFT',
    button: {
        text: 'Success'
    }
};

const mintingNFT = {
    heading: 'Minting NFT',
    button: {
        text: 'Success'
    }
};

const listingNFT = {
    heading: 'Listing NFT',
    button: {
        text: 'View NFT'
    }
};

const offeringBuyout = {
    heading: 'Offering Buy-out',
    button: {
        text: 'View NFT'
    }
};

const votingBuyout = {
    heading: 'Voting on Buy-outs',
    button: {
        text: 'View NFT'
    }
};


const loadingScreenReducer = (state = initState, action) => {
    let loadingScreenObject = {};

    switch (action.transactionType) {
        case APPROVE_TOKEN:
            loadingScreenObject = approveToken;
            break;
        case BUYING_FRAKTIONS:
            loadingScreenObject = buyingFraktions;
            break;
        case CLAIMING_BUYOUTS:
            loadingScreenObject = claimingBuyout;
            break;
        case CLAIMING_FRAKTIONS_PROFIT:
            loadingScreenObject = claimingFraktionsProfit;
            break;
        case CLAIMING_REVENUE:
            loadingScreenObject = claimingRevenue;
            break;
        case DEPOSIT_REVENUE:
            loadingScreenObject = depositingRevenue;
            break;
        case IMPORT_NFT:
            loadingScreenObject = importNFT;
            break;
        case IMPORT_FRAKTAL:
            loadingScreenObject = importFraktal;
            break;
        case MINT_NFT:
            loadingScreenObject = mintingNFT;
            break;
        case LISTING_NFT:
            loadingScreenObject = listingNFT;
            break;
        case OFFERING_BUYOUT:
            loadingScreenObject = offeringBuyout;
            break;
        case VOTING_BUYOUTS:
            loadingScreenObject = votingBuyout;
            break;
    }

    switch (action.type) {
        case ADD_AMOUNT:
            return {
                ...state,
                amount: action.amount
            };
        case REMOVE_AMOUNT:
            return {
                ...state,
                amount: null
            };
        case CLOSE_MODAL:
            return {
                ...state,
                modalOpen: false
            };
        case APPROVED_TRANSACTION:
            return {
                ...state,
                ...loadingScreenObject,
                transactionType: action.transactionType,
                modalOpen: true,
                message: SUCCESSFUL_MESSAGE,
                obj: action.obj,
                tokenAddress: action.tokenAddress,
                tx: action.obj.transactionHash ? action.obj.transactionHash : action.obj.hash,
                state: COMPLETED_STATUS,
                button: {
                    text: loadingScreenObject.button.text
                }
            };
        case CALL_CONTRACT:
            return {
                ...state,
                ...loadingScreenObject,
                transactionType: action.transactionType,
                modalOpen: true,
                message: PENDING_MESSAGE,
                obj: action.obj,
                tx: action.obj.transactionHash ? action.obj.transactionHash : action.obj.hash,
                state: PENDING_STATUS,
                button: {
                    text: 'Pending'
                }
            };
        case REJECTED_CONTRACT:
            return {
                ...state,
                ...loadingScreenObject,
                transactionType: action.transactionType,
                modalOpen: true,
                message: REJECTED_MESSAGE,
                obj: action.obj,
                state: REJECTED_STATUS,
                button: {
                    text: 'Try Again',
                    action: action.buttonAction
                }
            };
        default:
            return state;
    }
};

export default loadingScreenReducer;
