import { gql, request } from "graphql-request";
import { utils } from "ethers";
const { CID } = require("ipfs-http-client");

const API_URL = "https://api.thegraph.com/subgraphs/name/gmsteuart/fraktal-rinkeby"

const creator_query = gql`
  query($id: ID!) {
    fraktalNfts(where: { creator: $id }) {
      id
      marketId
      hash
      createdAt
      creator {
        id
      }
    }
  }
`;
// nftDetails
const fraktions_query = gql`
  query($id: ID!) {
    listItems(first: 10, where: { fraktal: $id, shares_gt: 0 }) {
      id
      fraktal {
        id
      }
      price
      shares
      gains
      seller {
        id
      }
    }
  }
`
// nftDetails
const getFraktalByAddress = gql`
  query($id: ID!) {
    fraktalNft(id: $id) {
      id
      marketId
      hash
      createdAt
      status
      collateral {
        id
        type
      }
      offers {
        offerer {
          id
        }
        winner
        value
        votes
        timestamp
      }
      revenues {
        id
        tokenAddress
        value
        timestamp
        buyout
      }
      fraktions {
        owner {
          id
        }
        amount
        locked
      }
      creator {
        id
      }
    }
  }
`

const owner_query = gql`
  query($id: ID!) {
    fraktalNfts(where: { owner: $id }) {
      id
      marketId
      hash
      createdAt
      status
      offers {
        offerer {
          id
        }
        value
        votes
      }
      revenues {
        tokenAddress
        value
      }
      fraktions {
        amount
        locked
      }
      creator {
        id
      }
    }
  }
`;
const marketid_query = gql`
  query($id: ID!) {
    fraktalNfts(where: { marketId: $id }) {
      id
      marketId
      hash
      createdAt
      status
      offers {
        offerer {
          id
        }
        value
        votes
      }
      revenues {
        id
        tokenAddress
        value
      }
      fraktions {
        amount
        locked
      }
      creator {
        id
      }
    }
  }
`;
const creators_review = gql`
  query {
    users {
      id
      fraktals
      created {
        id
        marketId
        hash
        creator
        createdAt
      }
    }
  }
`;
const creators_small_review = gql`
  query {
    users(first: 10) {
      id
      fraktals
      created {
        id
        marketId
        hash
        creator
        createdAt
      }
    }
  }
`;

const account_fraktions_query = gql`
  query($id: ID!) {
    fraktionsBalances(first: 10, where: { owner: $id, amount_gt: 0 }) {
      id
      amount
      nft {
        id
        marketId
        hash
        createdAt
        creator {
          id
        }
        owner {
          id
        }
      }
    }
  }
`;
const fraktal_fraktions_query = gql`
  query($id: ID!) {
    fraktionsBalances(first: 10, where: { nft: $id, amount_gt: 0 }) {
      id
      amount
      nft {
        id
        marketId
        hash
        createdAt
        creator {
          id
        }
        owner {
          id
        }
      }
    }
  }
`;
// cannot get to work a fraktal filter (where:{status:"open"})

//, orderBy:createdAt, orderDirection: desc
const listedItems = gql`
  query {
    listItems(first: 100, where: { shares_gt: 0 }) {
      id
      price
      shares
      gains
      seller {
        id
      }
      fraktal {
        id
        hash
        marketId
        createdAt
        status
        fraktions {
          amount
        }
        creator {
          id
        }
      }
    }
  }
`;

const listedItemsId = gql`
  query($id: ID!) {
    listItems(where: { id: $id, amount_gt: 0 }) {
      id
      price
      shares
      gains
      seller {
        id
      }
      fraktal {
        status
        id
        hash
        marketId
        createdAt
        transactionHash
        fraktions {
          amount
        }
        offers(where: { value_gt: 0 }) {
          id
          offerer {
            id
          }
          value
          votes
        }
        creator {
          id
        }
      }
    }
  }
`;
const user_wallet_query = gql`
  query($id: ID!) {
    users(where: { id: $id }) {
      id
      balance
      fraktals {
        id
        hash
        marketId
        createdAt
        status
        creator {
          id
        }
      }
      fraktions(where: { amount_gt: 0 }) {
        amount
        nft {
          id
          marketId
          hash
          createdAt
          creator {
            id
          }
          collateral {
            id
            type
          }
          status
        }
      }
    }
  }
`;
const user_bought_query = gql`
  query($id: ID!) {
    fraktalNfts(where: { status: "sold" }) {
      id
      marketId
      hash
      createdAt
      creator {
        id
      }
      owner {
        id
      }
      offers(where: { offerer: $id }) {
        value
      }
      collateral {
        id
        type
      }
    }
  }
`;

const user_offers_query = gql`
  query($id: ID!) {
    users(where: { id: $id }) {
      id
      offersMade(where: { value_gt: 0 }) {
        value
        fraktal {
          id
          marketId
          hash
          createdAt
          creator {
            id
          }
          owner {
            id
          }
          collateral {
            id
            type
          }
          status
        }
      }
    }
  }
`;

const fraktalOwners = gql`
  query($id: ID!) {
    fraktalNfts(where: { id: $id }) {
      fraktions {
        owner
        amount
      }
    }
  }
`;

const limitedItems = gql`
  query($limit: Int!, $offset: Int!, $orderBy: String!, $orderDirection: String!) {
    listItems(first: $limit, skip: $offset, where: { shares_gt: 0 }, orderBy: $orderBy, orderDirection: $orderDirection) {
      id
      price
      shares
      gains
      seller {
        id
      }
      fraktal {
        id
        hash
        marketId
        createdAt
        status
        fraktions {
          amount
        }
        creator {
          id
        }
      }
    }
  }
`;

const all_nfts = gql`
  query($limit: Int!, $offset: Int!, $orderDirection: String! ) {
    fraktalNfts(first: $limit, skip: $offset, orderBy: createdAt, orderDirection: $orderDirection) {
      id
      marketId
      hash
      createdAt
      creator {
        id
      }
    }
  }
`;
const listedItemsByFraktalId = gql`
  query($id: ID!) {
    listItems(where: { fraktal: $id }) {
      id
      price
      shares
      gains
      seller {
        id
      }
      fraktal {
        id
        hash
        marketId
        createdAt
        status
        fraktions {
          amount
        }
        creator {
          id
        }
      }
    }
  }
`;

const fixedAndAuctions = gql`
  query($limit: Int!, $offset: Int!, $orderBy: String!, $orderDirection: String! ) {
    listItems(first: $limit, skip: $offset, orderBy: $orderBy, orderDirection: $orderDirection) {
      id
      seller {
        id
      }
      fraktal {
        id
      }
      price
      shares
      gains
    }
    auctions(first: $limit, skip: $offset, orderBy: $orderBy, orderDirection: $orderDirection) {
      id
      seller
      fraktal
      price
      shares
      end
      sellerNonce
      auctionReserve
    }
  }
`

const limitedAuctions = gql`
  query($limit: Int!, $offset: Int!, $end: Int!, $orderDirection: String!) {
    auctions(first: $limit, skip: $offset, orderBy: price, orderDirection: $orderDirection, where: { end_gt: $end, price_gt: 0 }) {
      seller
      fraktal
      price
      shares
      end
      sellerNonce
      participants
      }
  }
`;

const listedAuctions = gql`
  query {
    auctions {
      seller
      fraktal
      price
      shares
      end
      sellerNonce
      participants
      }
  }
`;

const auctionFraktalNFT = gql`
  query($id: ID!) {
    fraktalNft(id:$id) {
      hash
    }
  }
`;

const getSingleAuction = gql`
  query($id: ID!) {
    auction(id:$id) {
      id
      seller
      fraktal
      price
      shares
      end
      sellerNonce
    }
  }
`;

const documents = {
  "account_fraktions": account_fraktions_query,
  "marketid_fraktal": marketid_query,
  "listed_itemsId": listedItemsId,
  "artists": creators_review,
  "firstArtists": creators_small_review,
  "all": all_nfts,
  "creator": creator_query,
  "manage": fraktal_fraktions_query,
  "owned": owner_query,
  "wallet": user_wallet_query,
  "bought": user_bought_query,
  "offers": user_offers_query,
  "listed_items": listedItems,
  "limited_items": limitedItems,
  "listed_items_by_fraktal_id": listedItemsByFraktalId,
  "getFraktalByAddress": getFraktalByAddress,
  "fraktions": fraktions_query,
  "fraktal_owners": fraktalOwners,
  "fixed_and_auctions": fixedAndAuctions,
  "auctions": listedAuctions,
  "limited_auctions": limitedAuctions,
  "auctionsNFT": auctionFraktalNFT,
  "singleAuction": getSingleAuction
}

export const getSubgraphData = async (key, id = "", options = {}) => {
  try {
    const res = await request(API_URL, documents[key], { id, ...options })
    return res
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
  }
}
