import { Workflow } from 'types/workflow';
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
  VOTING_BUYOUTS,
  UNLIST_NFT,
  UNLIST_AUCTION_NFT,
  REJECT_OFFER,
  EXPORT_FRAKTAL,
  CLAIM_NFT,
  CLAIM_DEPOSITED_FRAKTIONS,
  CLAIM_CONTRIBUTED_ETH,
  PARTICIPATE_AUCTION,
} from '../actions/contractActions';

const initState = {
  modalOpen: false,
  state: '',
  message: '',
};

const SUCCESSFUL_MESSAGE =
  'Congrats! Your transaction has successfully been processed on Ethereum.';
const PENDING_MESSAGE =
  'Please wait a few moments while your transaction is processed by Ethereum';
const REJECTED_MESSAGE = 'User Denied Metamask Signature';

type LoadingState = {
  step?: number;
  totalStep?: number;
  heading?: string;
  button?: {
    text: string;
  };
};

const approveToken = {
  heading: 'Approving NFT',
  button: {
    text: 'Success',
  },
};

const buyingFraktions = {
  heading: 'Buying Fraktions',
  button: {
    text: 'View NFT',
  },
};

const claimingRevenue = {
  heading: 'Claiming Revenue',
  button: {
    text: 'View NFT',
  },
};

const claimingBuyout = {
  heading: 'Claiming Profits',
  button: {
    text: 'View NFT',
  },
};
const claimingFraktionsProfit = {
  heading: 'Claiming Profit',
  button: {
    text: 'View NFT',
  },
};

const claimDepositedFraktions = {
  heading: 'Claiming ETH',
  button: {
    text: 'Success',
  },
};

const claimContributedEth = {
  heading: 'Claiming ETH',
  button: {
    text: 'Success',
  },
};

const depositingRevenue = {
  heading: 'Depositing Revenue',
  button: {
    text: 'View NFT',
  },
};

const importFraktal = {
  heading: 'Fraktionalizing NFT',
  button: {
    text: 'Success',
  },
};
const exportFraktal = {
  heading: 'De-Fraktionalizing NFT',
  button: {
    text: 'Success',
  },
};

const importNFT = {
  heading: 'Importing NFT to Fraktal',
  button: {
    text: 'Success',
  },
};

const mintingNFT = {
  heading: 'Minting NFT',
  button: {
    text: 'Success',
  },
};

const listingNFT = {
  heading: 'Listing NFT',
  button: {
    text: 'View NFT',
  },
};

const unlistingNFT = {
  heading: 'Unlisting NFT',
  button: {
    text: 'Success',
  },
};

const participateAuction = {
  heading: 'Participating in Auction',
  button: {
    text: 'Success',
  },
};

const endAuction = {
  heading: 'Ending Auction',
  button: {
    text: 'Success',
  },
};

const rejectingOffer = {
  heading: 'Rejecting Offer',
  button: {
    text: 'Success',
  },
};

const claimNFT = {
  heading: 'Claiming NFT',
  button: {
    text: 'Success',
  },
};

const removingOffer = {
  heading: 'Removing Offer',
  button: {
    text: 'View NFT',
  },
};

const votingBuyout = {
  heading: 'Voting on Buy-outs',
  button: {
    text: 'View NFT',
  },
};

const loadingScreenReducer = (state = initState, action) => {
  let loadingScreenObject: LoadingState = {};

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
    case CLAIM_DEPOSITED_FRAKTIONS:
      loadingScreenObject = claimDepositedFraktions;
      break;
    case CLAIM_CONTRIBUTED_ETH:
      loadingScreenObject = claimContributedEth;
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
    case EXPORT_FRAKTAL:
      loadingScreenObject = exportFraktal;
      break;
    case MINT_NFT:
      loadingScreenObject = mintingNFT;
      break;
    case LISTING_NFT:
      loadingScreenObject = listingNFT;
      break;
    case UNLIST_NFT:
      loadingScreenObject = unlistingNFT;
      break;
    case UNLIST_AUCTION_NFT:
      loadingScreenObject = endAuction;
      break;
    case PARTICIPATE_AUCTION:
      loadingScreenObject = participateAuction;
      break;
    case REJECT_OFFER:
      loadingScreenObject = rejectingOffer;
      break;
    case CLAIM_NFT:
      loadingScreenObject = claimNFT;
      break;
    case OFFERING_BUYOUT:
      loadingScreenObject = removingOffer;
      break;
    case VOTING_BUYOUTS:
      loadingScreenObject = votingBuyout;
      break;
  }

  // TODO: merge this with loadingScreenObject switch case above
  switch (action.workflow) {
    case Workflow.IMPORT_NFT:
      loadingScreenObject.totalStep = 5;
      switch (action.transactionType) {
        case APPROVE_TOKEN:
          if (action.custom === 'fraktions') {
            loadingScreenObject.step = 3;
          } else {
            loadingScreenObject.step = 1;
          }
          break;
        case IMPORT_NFT:
          loadingScreenObject.step = 2;
          break;
        case IMPORT_FRAKTAL:
          loadingScreenObject.step = 4;
          break;
        case LISTING_NFT:
          loadingScreenObject.step = 5;
          break;
      }
      break;
    case Workflow.MINT_NFT:
      loadingScreenObject.totalStep = action.custom?.totalStep ?? 4;
      switch (action.transactionType) {
        case MINT_NFT:
          loadingScreenObject.step = 1;
          break;
        case APPROVE_TOKEN:
          loadingScreenObject.step = 2;
          break;
        case IMPORT_FRAKTAL:
          loadingScreenObject.step = 3;
          break;
        case LISTING_NFT:
          loadingScreenObject.step = 4;
          break;
      }
      break;
    case Workflow.FRAK_NFT:
      loadingScreenObject.totalStep = 2;
      switch (action.transactionType) {
        case APPROVE_TOKEN:
          loadingScreenObject.step = 1;
          break;
        case IMPORT_FRAKTAL:
          loadingScreenObject.step = 2;
          break;
      }
    case Workflow.CLAIM_NFT:
      loadingScreenObject.totalStep = 2;
      switch (action.transactionType) {
        case APPROVE_TOKEN:
          loadingScreenObject.step = 1;
          break;
        case CLAIM_NFT:
          loadingScreenObject.step = 2;
          break;
      }
      break;
    default:
      loadingScreenObject.totalStep = null;
      loadingScreenObject.step = null;
      break;
  }

  switch (action.type) {
    case ADD_AMOUNT:
      return {
        ...state,
        amount: action.amount,
      };
    case REMOVE_AMOUNT:
      return {
        ...state,
        amount: null,
      };
    case CLOSE_MODAL:
      return {
        ...state,
        modalOpen: false,
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
        tx: action.obj.transactionHash
          ? action.obj.transactionHash
          : action.obj.hash,
        state: COMPLETED_STATUS,
        button: loadingScreenObject.button
          ? {
              text: loadingScreenObject.button.text,
            }
          : null,
      };
    case CALL_CONTRACT:
      return {
        ...state,
        ...loadingScreenObject,
        transactionType: action.transactionType,
        modalOpen: true,
        message: PENDING_MESSAGE,
        obj: action.obj,
        tx: action.obj.transactionHash
          ? action.obj.transactionHash
          : action.obj.hash,
        state: PENDING_STATUS,
        button: {
          text: 'Pending',
        },
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
          action: action.buttonAction,
        },
      };
    default:
      return state;
  }
};

export default loadingScreenReducer;
