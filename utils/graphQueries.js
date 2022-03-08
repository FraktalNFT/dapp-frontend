import { gql, request } from "graphql-request";
import { utils } from "ethers";
const { CID } = require("ipfs-http-client");

// const APIURL = 'https://api.studio.thegraph.com/query/101/fraktal2rinkeby/v0.2.18';
//const APIURL = 'https://api.studio.thegraph.com/query/16828/oldfraktal/0.7.9';
const APIURL = 'https://api.studio.thegraph.com/query/21128/test/0.3.6';
// const APIURL = 'https://gateway.testnet.thegraph.com/api/a2ae030e27fc11191339a53e73cea9c2/subgraphs/id/0x98e7910e754abd41ace110c23d679333779c2ff9-1'
//const AUCTIONAPI = 'https://api.studio.thegraph.com/query/16828/oldfraktal/0.7.9';
const AUCTIONAPI = 'https://api.studio.thegraph.com/query/21128/test/0.3.6';

// const AUCTIONAPI = 'https://api.studio.thegraph.com/query/16828/testnetfraktalauction/0.4';
// https://api.thegraph.com/subgraphs/name/drhongos/fraktalrinkeby // hosted

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

const fraktions_query = gql`
  query($id: ID!) {
    listItems(first: 10, where: { fraktal: $id, amount_gt: 0 }) {
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
    listItems(first: 100, where: { amount_gt: 0 }) {
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
    listItems(where: { id: $id, amount_gt: 0 }) {
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

const fraktalId_query = gql`
  query($id: ID!) {
    fraktalNfts(where: { id: $id }) {
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
    listItems(first: $limit, skip: $offset, where: { amount_gt: 0 }, orderBy: $orderBy, orderDirection: $orderDirection) {
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

const searchItems = gql`
  query($name: String!) {
    fraktalSearch(text: $name) {
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
    userSearch(text: $name) {
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
    auctionSearch(text: $name) {
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
  { name: "limited_items", call: limitedItems },
  { name: "listed_items_by_fraktal_id", call: listedItemsByFraktalId },
  { name: "fraktal", call: fraktalId_query },
  { name: "fraktions", call: fraktions_query },
  { name: "fraktal_owners", call: fraktalOwners },
  { name: "search_items", call: searchItems },
];

const limitedAuctions = gql`
  query($limit: Int!, $offset: Int!, $endTime: Int!, $orderDirection: String!) {
    auctions(first: $limit, skip: $offset, orderBy: reservePrice, orderDirection: $orderDirection, where: { endTime_gt: $endTime, reservePrice_gt: 0 }) {
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

const listedAuctions = gql`
  query {
    auctions {
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
    fraktalNft(id:$id) {
      hash
  }
  }
`;

const getSingleAuction = gql`
query($id: ID!) {
  auction(id:$id) {
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
  { name: "limited_auctions", call: limitedAuctions },
  { name: "auctionsNFT", call:auctionFraktalNFT},
  { name: "singleAuction", call: getSingleAuction}
];

export const getSubgraphData = async (call, id, options = null) => {
  let callGql = calls.find(x => {
    return x.name == call;
  });
  try {
    const data = await request(APIURL, callGql.call, { id, ...options });
    // console.log('data for:',id,' found',data)
    return data;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("error", err);
    return err;
  }
};
export const getSubgraphAuction = async (call, id, options = null) => {
  let callGql = auctionCalls.find(x => {
    return x.name == call;
  });
  try {
    const data = await request(AUCTIONAPI, callGql.call, { id, ...options });
    // console.log('data for:',id,' found',data)
    return data;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("error", err);
    return err;
  }
};
