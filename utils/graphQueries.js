import { gql, request } from 'graphql-request';
const { create, CID } = require('ipfs-http-client');
import { utils } from "ethers";

const APIURL = 'https://api.studio.thegraph.com/query/101/fraktal2rinkeby/v0.0.44';

const ipfsClient = create({
  host: "ipfs.infura.io",
  port: "5001",
  protocol: "https",});

const creator_query = gql`
query($id:ID!){
  fraktalNfts(where:{creator:$id}) {
    id
    marketId
    hash
    owner {
      id
    }
    createdAt
    creator {
      id
    }
  }
  }
`;
const owner_query = gql`
query($id:ID!){
  fraktalNfts(where:{owner:$id}) {
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
    owner {
      id
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
const marketid_query = gql`
query($id:ID!){
  fraktalNfts(where:{marketId:$id}) {
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
    owner {
      id
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
const all_nfts = gql`
query {
  fraktalNfts(first: 20, orderBy: "createdAt",  orderDirection: "desc") {
    id
    marketId
    hash
    owner {
      id
    }
    createdAt
    creator {
      id
    }
  }
}
`;
const creators_review = gql`
  query{
    users(first: 5) {
      id
      fraktals
      created {
        id
        marketId
        hash
        creator
        owner
        createdAt
      }
    }
  }
`
const account_fraktions_query = gql`
  query($id:ID!){
    fraktionsBalances(first:10, where:{owner:$id, amount_gt:0}){
      id
      amount
      owner {
        id
        balance
      }
      nft {
        id
        marketId
        hash
        createdAt
        creator{
          id
        }
        owner{
          id
        }
      }
    }
  }
`
const fraktal_fraktions_query = gql`
  query($id:ID!){
    fraktionsBalances(first:10, where:{nft:$id, amount_gt:0}){
      id
      amount
      owner {
        id
        balance
      }
      nft {
        id
        marketId
        hash
        createdAt
        creator{
          id
        }
        owner{
          id
        }
      }
    }
  }
`
// cannot get to work a fraktal filter (where:{status:"open"})
const listedItems = gql`
  query{
    listItems(first: 10, where:{amount_gt: 0}){
      id
      price
      amount
      gains
      seller {
        id
      }
      fraktal{
        hash
        marketId
        createdAt
        status
        owner {
          id
        }
        fraktions {
          owner{
            id
          }
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
  query($id:ID!){
    listItems(where:{id:$id, amount_gt: 0}){
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
        owner{
          id
        }
        fraktions {
          owner{
            id
            balance
          }
          amount
        }
        offers (where: {value_gt: 0}) {
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
  query($id:ID!){
    users(where:{id:$id}){
      id
      balance
      fraktals {
        id
      }
      fraktions (where:{amount_gt: 0}){
        amount
        nft {
          id
          marketId
          hash
          createdAt
          creator{
            id
          }
          owner{
            id
          }
          collateral {
            id
            type
          }
        }
      }
    }
  }
`
const user_bought_query = gql`
  query($id:ID!){
    fraktalNfts(where:{status:"sold"}){
      id
      marketId
      hash
      createdAt
      creator{
        id
      }
      owner{
        id
      }
      offers (where:{offerer: $id}){
        value
      }
      collateral {
        id
        type
      }
    }
  }
`

const user_offers_query = gql`
  query($id:ID!){
    users(where:{id:$id}){
      id
      offersMade(where:{value_gt: 0}){
        value
        fraktal{
          id
          marketId
          hash
          createdAt
          creator{
            id
          }
          owner{
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
`

export const getSubgraphData = async (call, id) => {
  let callGql = calls.find(x=> {return x.name == call})
  try {
    const data = await request(APIURL , callGql.call, {id});
    // console.log('data for:',id,' found',data)
    return data;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('error', err);
    return err;
  }
};

export async function createOpenSeaObject(data){
  // console.log('checking ', data);
  try{
    return {
      id: data.asset_contract.address,
      creator:data.creator.address,
      token_schema: data.asset_contract.schema_name,
      tokenId: data.token_id,
      createdAt: data.asset_contract.created_date,
      name: data.name,
      imageURL: data.image_url,
      // isFraktal: ,
      // owner: data.owner.address,
      // marketId: data.marketId,
      // balances: data.fraktions,
      // description: nftMetadata.description,
    }

  }catch{
    return null;
  }
}

export async function createObject(data){
  // handle token_schema

  // ERC721 + ipfs(?)
  // let hashHacked = data.hash.substring(0, data.hash.length - 1)
  // this should be handled as isERC721? then split tokenId from the end of hash...continue
  // OR..
  // read the contract and get the URI, we have the token address and token index

  // and possibly tokenId

  try{
    let nftMetadata = await fetchNftMetadata(data.hash)
    // console.log('meta',nftMetadata)
    if(nftMetadata){
      return {
        id: data.id,
        creator:data.creator.id,
        owner: data.owner.id,
        marketId: data.marketId,
        balances: data.fraktions,
        createdAt: data.createdAt,
        status: data.status,
        name: nftMetadata.name,
        description: nftMetadata.description,
        imageURL: checkImageCID(nftMetadata.image),
      }
    }
  }catch{
    console.log('Error fetching ',data);
    return null;
  }
};
export async function createListed(data){
  try{
    let nftMetadata = await fetchNftMetadata(data.fraktal.hash)
    if(nftMetadata){
      return {
        creator:data.fraktal.creator.id,
        marketId: data.fraktal.marketId,
        createdAt: data.fraktal.createdAt,
        tokenAddress: data.fraktal.id,
        owner: data.fraktal.owner.id,
        raised: data.gains,
        id: data.id,
        price:utils.formatEther(data.price),
        amount: data.amount,
        seller: data.seller.id,
        name: nftMetadata.name,
        description: nftMetadata.description,
        imageURL: checkImageCID(nftMetadata.image),
      }
    }
  }catch{
    // this is to handle ERC721 with the tokenId (which is added to tokenURL last digit (careful with double digits!!!))
    // handle it filtering 32bytes???
    let hashHacked = data.fraktal.hash.substring(0, data.fraktal.hash.length - 1)
    let nftMetadata = await fetchNftMetadata(hashHacked)
    if(nftMetadata){
      return {
        creator:data.fraktal.creator.id,
        marketId: data.fraktal.marketId,
        createdAt: data.fraktal.createdAt,
        owner: data.fraktal.owner.id,
        raised: data.gains,
        id: data.id,
        price:utils.formatEther(data.price),
        amount: data.amount,
        seller: data.seller.id,
        name: nftMetadata.name,
        description: nftMetadata.description,
        imageURL: checkImageCID(nftMetadata.image),
      }
    }
  }
};
const calls = [
  {name: 'account_fraktions', call: account_fraktions_query},//
  {name: 'marketid_fraktal', call: marketid_query},//
  {name: 'listed_items', call: listedItems},//
  {name: 'listed_itemsId', call: listedItemsId},//
  {name: 'artists', call: creators_review},//
  {name: 'all', call: all_nfts},
  {name: 'creator', call: creator_query},//
  {name: 'manage', call: fraktal_fraktions_query},
  {name: 'owned', call: owner_query},
  {name: 'wallet', call: user_wallet_query},
  {name: 'bought', call: user_bought_query},
  {name: 'offers', call: user_offers_query},
];


function toBase32(value) { // to transform V0 to V1 and use as `https://${cidV1}.ipfs.dweb.link`
  var cid = new CID(value)
  return cid.toV1().toBaseEncodedString('base32')
};

function checkImageCID(cid){ // this does not handle others than IPFS... correct THAT!
  let correctedCid
  if(cid.startsWith('https://ipfs.io/')){
    let splitted = cid.split('https://ipfs.io/ipfs/')
    correctedCid = splitted[1]
    let cidv1 = toBase32(correctedCid)
    return `https://${cidv1}.ipfs.dweb.link`
  }else if (cid.startsWith('Qm')){
      correctedCid = cid
      let cidv1 = toBase32(correctedCid)
      return `https://${cidv1}.ipfs.dweb.link`
  }else{
    return cid;
  }
};

// Convert Binary Into JSON
const binArrayToJson = function(binArray)
{
    var str = "";
    for (var i = 0; i < binArray.length; i++) {
        str += String.fromCharCode(parseInt(binArray[i]));
    }
    return JSON.parse(str)
};

async function fetchNftMetadata(hash){
  if(hash.startsWith('Qm')){
    let chunks
    for await (const chunk of ipfsClient.cat(hash)) {
      chunks = binArrayToJson(chunk);
    }
    return chunks;
  } else {
    let res = await fetch(hash)
    if(res){
      let result = res.json()
      return result
    }
  }
};
