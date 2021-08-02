import { gql, request } from 'graphql-request';
const { create, CID } = require('ipfs-http-client');

const APIURL = 'https://api.studio.thegraph.com/query/101/fraktalgoerli/v0.0.4';

const ipfsClient = create({
  host: "ipfs.infura.io",
  port: "5001",
  protocol: "https",});

const creator_query = gql`
query($id:ID!){
  fraktalNFTs(where:{creator:$id}) {
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
const account_query = gql`
  query($id:ID!){
    fraktalNFTs(where:{owner:$id}) {
      id
      owner
      marketId
      hash
      createdAt
      creator {
        id
      }
    }
    }
`;
const id_query = gql`
query($id:ID!){
  fraktalNFTs(where:{id:$id}) {
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
const marketid_query = gql`
query($id:ID!){
  fraktalNFTs(where:{marketId:$id}) {
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
const all_nfts = gql`
query {
  fraktalNFTs(first: 20, orderBy: "createdAt",  orderDirection: "desc") {
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
const users = gql`
  query{
    users(first: 20) {
      id
      fraktals
      created
    }
  }
`
//, where:{created_ > 0}
const creators_review = gql`
  query{
    users(first: 20) {
      id
      fraktals
      created
    }
  }
`
const userAddress = gql`
query($id:ID!){
  users(where:{id:$id}) {
    id
    created
    fraktals
  }
  }
`;

const account_fraktions_query = gql`
  query($id:ID!){
    fraktionsBalances(first:10, where:{owner:$id}){
      id
      owner {
        id
      }
      nft {
        id
        marketId
      }
      amount
    }
  }
`
const fraktal_fraktions_query = gql`
query($id:ID!){
  fraktalNFTs(where:{fraktions:$id}) {
    id
    marketId
    hash
    creator
    fraktions{
      amount
    }
  }
  }
`;
const calls = [
  {name: 'account_fraktals', call: account_query},
  {name: 'account_fraktions', call: account_fraktions_query},
  {name: 'marketid_fraktal', call: marketid_query},
  {name: 'id_fraktal', call: id_query},
  {name: 'userAddress', call: userAddress},
  // {name: 'listed_items', call: account_query},
  {name: 'artists', call: creators_review},
  {name: 'all', call: all_nfts},
  {name: 'creator', call: creator_query},
  {name: 'id_fraktions', call: fraktal_fraktions_query},
]

export const getAccountFraktalNFTs = async (call, id) => {
  let callGql = calls.find(x=> {return x.name == call})
  try {
    const data = await request(APIURL , callGql.call, {id});
    console.log('data for:',id,' found',data)
    return data;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('error', err);
    return err;
  }
};

export async function createObject(data){
  let nftMetadata = await fetchNftMetadata(data.hash)
  if(nftMetadata){
    // console.log('meta',nftMetadata)
    return {
      creator:data.creator.id,
      id: data.marketId,
      name: nftMetadata.name,
      description: nftMetadata.description,
      imageURL: checkImageCID(nftMetadata.image),
      createdAt: data.createdAt,
    }
  }
};

function toBase32(value) { // to transform V0 to V1 and use as `https://${cidV1}.ipfs.dweb.link`
  var cid = new CID(value)
  return cid.toV1().toBaseEncodedString('base32')
};

function checkImageCID(cid){
  let correctedCid
  if(cid.startsWith('https://ipfs.io/ipfs/')){
    let splitted = cid.split('https://ipfs.io/ipfs/')
    correctedCid = splitted[1]
  }else{
    correctedCid = cid
  }
  let cidv1 = toBase32(correctedCid)
  return `https://${cidv1}.ipfs.dweb.link`
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
export async function getNFTobject(id){
  let fraktalNft = await getAccountFraktalNFTs('id_fraktal', id);
  let obj = Promise(createObject(fraktalNft.fraktalNFTs))
  obj.then((data)=>console.log('encontrado:',data))

  return obj
};
