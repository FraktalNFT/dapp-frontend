import { gql, request } from "graphql-request";
import { utils } from "ethers";
const { CID } = require("ipfs-http-client");

const APIURL =
    process.env.NEXT_PUBLIC_GRAPHQL_URL ? process.env.NEXT_PUBLIC_GRAPHQL_URL
        : 'https://api.studio.thegraph.com/query/21128/marketplaceperformance/0.0.4';

const AIRDROPAPI = 'https://api.looksrare.org/graphql';

export const LIMITED_ITEMS = "limited_items";
export const LIMITED_AUCTIONS = "limited_auctions";
export const SEARCH_ITEMS = "search_items";

const creator_query = gql`
  query($id: ID!) {
    fraktalNfts(where: { creator: $id }, subgraphError: allow) {
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

const fraktions_query = gql`
  query($id: ID!) {
    listItems(first: 10, where: { fraktal: $id, amount_gt: 0 }, subgraphError: allow) {
      id
      fraktal {
        id
      }
      price
      amount
      gains
      seller {
        id
      }
    }
  }
`;
const owner_query = gql`
  query($id: ID!) {
    fraktalNfts(where: { owner: $id }, subgraphError: allow) {
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
    fraktalNfts(where: { marketId: $id }, subgraphError: allow) {
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
    users(subgraphError: allow) {
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
    users(first: 10, subgraphError: allow) {
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
    fraktionsBalances(first: 10, where: { owner: $id, amount_gt: 0 }, subgraphError: allow) {
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
    fraktionsBalances(first: 10, where: { nft: $id, amount_gt: 0 }, subgraphError: allow) {
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
    listItems(first: 100, where: { amount_gt: 0 }, subgraphError: allow) {
      id
      price
      amount
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
    listItems(where: { id: $id, amount_gt: 0 }, subgraphError: allow) {
      id
      price
      amount
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
    users(where: { id: $id }, subgraphError: allow) {
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
        collateral {
          id 
          type
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
    fraktalNfts(where: { status: "sold" }, subgraphError: allow) {
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
    users(where: { id: $id }, subgraphError: allow) {
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
    fraktalNfts(where: { id: $id }, subgraphError: allow) {
      fraktions {
        owner
        amount
      }
    }
  }
`;

const fraktalId_query = gql`
  query($id: ID!) {
    fraktalNfts(where: { id: $id }, subgraphError: allow) {
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
`;


const limitedItems = gql`
  query($limit: Int!, $offset: Int!, $orderBy: String!, $orderDirection: String!) {
    listItems(first: $limit, skip: $offset, where: { amount_gt: 0 }, orderBy: $orderBy, orderDirection: $orderDirection, subgraphError: allow) {
      id
      name
      price
      amount
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
    fraktalNfts(first: $limit, skip: $offset, orderBy: createdAt, orderDirection: $orderDirection, subgraphError: allow) {
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
    listItems(where: { fraktal: $id }, subgraphError: allow) {
      id
      name
      price
      amount
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

const limitedAuctions = gql`
  query($limit: Int!, $offset: Int!, $endTime: Int!, $orderDirection: String!) {
    auctions(first: $limit, skip: $offset, orderBy: reservePrice, orderDirection: $orderDirection, where: { endTime_gt: $endTime, reservePrice_gt: 0 }, subgraphError: allow) {
      seller {
        id
      }
      tokenAddress
      reservePrice
      amountOfShare
      endTime
      sellerNonce
      participants
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

const searchItems = gql`
  query($name: String!, $limit: Int!, $offset: Int!) {
    fraktalSearch(text: $name, first: $limit, skip: $offset, subgraphError: allow) {
      id
      name
      price
      amount
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
    userSearch(text: $name, subgraphError: allow) {
      id
      auctionItems {
        id
        name
        reservePrice
        amountOfShare
        endTime
        fraktal {
          hash
        }
      }
      listedItems {
        id
        price
        amount
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
      fraktions {
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
      fraktals
        created {
          id
          marketId
          hash
          creator
          createdAt
        }
    }
    auctionSearch(text: $name, first: $limit, skip: $offset, subgraphError: allow) {
        id
        name
        seller {
          id
        }
        tokenAddress
        reservePrice
        amountOfShare
        endTime
        sellerNonce
        participants
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

const calls = [
  { name: "account_fraktions", call: account_fraktions_query },
  { name: "marketid_fraktal", call: marketid_query },
  { name: "listed_itemsId", call: listedItemsId },
  { name: "artists", call: creators_review },
  { name: "firstArtists", call: creators_small_review },
  { name: "all", call: all_nfts },
  { name: "creator", call: creator_query },
  { name: "manage", call: fraktal_fraktions_query },
  { name: "owned", call: owner_query },
  { name: "wallet", call: user_wallet_query },
  { name: "bought", call: user_bought_query },
  { name: "offers", call: user_offers_query },
  { name: "listed_items", call: listedItems },
  { name: LIMITED_ITEMS, call: limitedItems },
  { name: "listed_items_by_fraktal_id", call: listedItemsByFraktalId },
  { name: "fraktal", call: fraktalId_query },
  { name: "fraktions", call: fraktions_query },
  { name: "fraktal_owners", call: fraktalOwners },
  { name: LIMITED_AUCTIONS, call: limitedAuctions },
  { name: SEARCH_ITEMS, call: searchItems },
];

const listedAuctions = gql`
  query {
    auctions(subgraphError: allow) {
      seller {
        id
      }
      tokenAddress
      reservePrice
      amountOfShare
      endTime
      sellerNonce
      participants
      }
  }
`;

const auctionFraktalNFT = gql`
  query($id: ID!) {
    fraktalNft(id:$id, subgraphError: allow) {
      hash
      collateral {
        id
        type
      }
    }
  }
`;

const getSingleAuction = gql`
query($id: ID!) {
  auction(id:$id, subgraphError: allow) {
    id
    seller {
      id
    }
    tokenAddress
    reservePrice
    amountOfShare
    endTime
    sellerNonce
}
}
`;

const auctionCalls = [
  { name: "auctions", call: listedAuctions },
  { name: "auctionsNFT", call:auctionFraktalNFT},
  { name: "singleAuction", call: getSingleAuction}
];

export const getSubgraphData = async (call, id, options = null) => {
  let callGql = calls.find(x => {
    return x.name == call;
  });
  try {
    const data = await request(APIURL, callGql.call, { id, ...options });
    return data;
  } catch (err) {
    // eslint-disable-next-line no-console
    if (err.response.data) {
      return err.response.data;
    }
    return err;
  }
};
export const getSubgraphAuction = async (call, id, options = null) => {
  let callGql = auctionCalls.find(x => {
    return x.name == call;
  });
  try {
    const data = await request(APIURL, callGql.call, { id, ...options });
    return data;
  } catch (err) {
    if (err.response.data) {
      return err.response.data;
    }
    return err;
  }
};

export const getAddressAirdrop = async (id, options = null) =>{
  let callGql = gql`
    query Airdrop($id: Address!) {
      airdrop(address:$id, subgraphError: allow) {
        proof
        amount
      }
    }
  `;
  try {
    const data = await request(AIRDROPAPI, callGql, { id, ...options });
    return data;
  } catch (err) {
    if (err.response.data) {
      return err.response.data;
    }
    return err;
  }
}
