import { gql, request } from 'graphql-request';
const { create, CID } = require('ipfs-http-client');
import { utils } from "ethers";

const APIURL = 'https://api.studio.thegraph.com/query/101/fraktalrinkeby/v0.0.23';

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
      address
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
    users(first: 20) {
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
      fraktal {
        hash
        marketId
        createdAt
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
        creator {
          id
        }
      }
    }
  }
`;

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

export async function createObject(data){
  try{
    let nftMetadata = await fetchNftMetadata(data.hash)
    if(nftMetadata){
      // console.log('meta',nftMetadata)
      return {
        id: data.id,
        creator:data.creator.id,
        owner: data.owner.id,
        marketId: data.marketId,
        balances: data.fraktions,
        createdAt: data.createdAt,
        name: nftMetadata.name,
        description: nftMetadata.description,
        imageURL: checkImageCID(nftMetadata.image),
      }
    }
  }catch{
    let hashHacked = data.hash.substring(0, data.hash.length - 1)
    let nftMetadata = await fetchNftMetadata(hashHacked)
    if(nftMetadata){
      // console.log('meta',nftMetadata)
      return {
        id: data.id,
        creator:data.creator.id,
        owner: data.owner.id,
        marketId: data.marketId,
        balances: data.fraktions,
        createdAt: data.createdAt,
        name: nftMetadata.name,
        description: nftMetadata.description,
        imageURL: checkImageCID(nftMetadata.image),
      }
    }
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
];


function toBase32(value) { // to transform V0 to V1 and use as `https://${cidV1}.ipfs.dweb.link`
  var cid = new CID(value)
  return cid.toV1().toBaseEncodedString('base32')
};

function checkImageCID(cid){
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
  let chunks
  for await (const chunk of ipfsClient.cat(hash)) {
      chunks = binArrayToJson(chunk);
  }
  // console.log('NFT metadata: ',chunks)
  return chunks;
};
