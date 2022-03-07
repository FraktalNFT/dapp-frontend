import { utils } from 'ethers';
import { getSubgraphData } from './graphQueries';

const { create, CID } = require('ipfs-http-client');

let infuraAuth;
if (process.env.NEXT_PUBLIC_INFURA_PROJECT_ID !== undefined && process.env.NEXT_PUBLIC_INFURA_PROJECT_SECRET !== undefined) {
  infuraAuth = 'Basic ' + Buffer.from(process.env.NEXT_PUBLIC_INFURA_PROJECT_ID + ':' + process.env.NEXT_PUBLIC_INFURA_PROJECT_SECRET).toString('base64')
}
const infuraConfig = {
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    Authorization: infuraAuth
  }
};
const ipfsClient = create(infuraConfig);

// Convert Binary Into JSON
const binArrayToJson = function (binArray) {
  var str = '';
  for (var i = 0; i < binArray.length; i++) {
    str += String.fromCharCode(parseInt(binArray[i]));
  }
  return JSON.parse(str);
};

function checkImageCID(cid) {
  // this does not handle others than IPFS... correct THAT!
  let correctedCid;
  if (cid.startsWith('https://ipfs.io/')) {
    let splitted = cid.split('https://ipfs.io/ipfs/');
    correctedCid = splitted[1];
    let cidv1 = toBase32(correctedCid);
    return `https://${cidv1}.ipfs.dweb.link`;
  } else if (cid.startsWith('ipfs://')) {
    let splitted = cid.split('ipfs://');
    correctedCid = splitted[1];
    let cidv1 = toBase32(correctedCid);
    return `https://${cidv1}.ipfs.dweb.link`;
  } else if (cid.startsWith('Qm')) {
    correctedCid = cid;
    let cidv1 = toBase32(correctedCid);
    return `https://${cidv1}.ipfs.dweb.link`;
  } else {
    return cid;
  }
}

function toBase32(value) {
  // to transform V0 to V1 and use as `https://${cidV1}.ipfs.dweb.link`
  var cid = new CID(value);
  return cid.toV1().toBaseEncodedString('base32');
}

export async function fetchNftMetadata(hash) {
  if (hash.startsWith('ipfs://Qm')) {
    hash = hash.slice(7)
  }
  if (hash.startsWith('Qm')) {
    let chunks;
    for await (const chunk of ipfsClient.cat(hash)) {
      chunks = binArrayToJson(chunk);
    }
    if(chunks.image !== undefined) {
      chunks.image = checkImageCID(chunks.image)
    }
    return chunks;
  } else if (hash.startsWith("ipfs://Qm")) {
    let uri = hash.replace("ipfs://Qm", "https://ipfs.io/ipfs/Qm")
    const res = await fetch(uri)
    let data = await res.json()
    if(data.image) {
      data.image = checkImageCID(data.image)
    }
    return data
  } else {
    let res = await fetch(hash)
    let data = await res.json()
    if(data.image) {
      data.image = checkImageCID(data.image)
    }
    return data
  }
}

async function getFraktalData(address){
  const { fraktalNft } = await getSubgraphData("getFraktalByAddress", address)
  const {marketId, collateral} = fraktalNft
  return {
    fraktalId: marketId,
    collateral: collateral
  }
}

export async function createOpenSeaObject(data) {
  try {
    if (!data) return null
    let response = {
      id: data.asset_contract.address,
      creator: data.creator?.address,
      token_schema: data.asset_contract.schema_name,
      tokenId: data.token_id,
      createdAt: data.asset_contract.created_date,
      name: data.name,
      imageURL: data.image_url,
      marketId: null,
      collateral: null,
      collateralType: null,
    };
    let fraktalData = await getFraktalData(data.asset_contract.address);
    if (fraktalData?.fraktalId?.length) {
      response.marketId = fraktalData.fraktalId;
    }
    if (fraktalData.collateral) {
      response.collateral = fraktalData.collateral.id;
      response.collateralType = fraktalData.collateral.type;
    }
    return response;
  } catch (e) {
    console.log('error in createOpenSeaObject', e);
    return null;
  }
}

export async function createObject(data) {
  // handle token_schema

  // ERC721 + ipfs(?)
  // let hashHacked = data.hash.substring(0, data.hash.length - 1)
  // this should be handled as isERC721? then split tokenId from the end of hash...continue
  // OR..
  // read the contract and get the URI, we have the token address and token index

  // and possibly tokenId

  try {
    let nftMetadata = await fetchNftMetadata(data.nft.hash);
    if (nftMetadata) {
      return {
        id: data.nft.id,
        creator: data.nft.creator.id,
        marketId: data.nft.marketId,
        // balances: data.nft.fraktions,
        userBalance: data.amount,
        // price:,
        createdAt: data.nft.createdAt,
        status: data.nft.status,
        name: nftMetadata.name,
        description: nftMetadata.description,
        imageURL: checkImageCID(nftMetadata.image),
      };
    }
  } catch {
    //TODO - REMOVE THE CONSOLE.log
    console.log('Error fetching ', data);
    return null;
  }
}

export async function createObject2(data) {
  try {
    let nftMetadata = await fetchNftMetadata(data.hash);
    let object = {
      id: data.id,
      creator: data.creator.id,
      marketId: data.marketId,
      balances: data.fraktions,
      createdAt: data.createdAt,
      status: data.status,
    };
    if (nftMetadata && nftMetadata.name) {
      object.name = nftMetadata.name;
    }
    if (nftMetadata && nftMetadata.description) {
      object.description = nftMetadata.description;
    }
    if (nftMetadata && nftMetadata.image) {
      object.imageURL = checkImageCID(nftMetadata.image);
    }
    return object;
  } catch {
    //TODO - REMOVE THE CONSOLE.log
    console.log('Error fetching 2 ', data.hash);
    return null;
  }
}

export async function createListed(data) {
  try {
    let nftMetadata = await fetchNftMetadata(data.fraktal.hash);
    if (nftMetadata) {
      return {
        creator: data.fraktal.creator.id,
        marketId: data.fraktal.marketId,
        createdAt: data.fraktal.createdAt,
        fraktal: data.fraktal.id,
        holders: data.fraktal.fraktions.length,
        raised: data.gains,
        id: data.id,
        price: utils.formatEther(data.price),
        amount: data.amount,
        seller: data.seller.id,
        name: nftMetadata.name,
        description: nftMetadata.description,
        imageURL: checkImageCID(nftMetadata.image),
      };
    }
  } catch (err) {
    return { error: `Error: ${err}` };
  }
}

export async function createListedAuction(data) {
  try {
    let nftMetadata = await fetchNftMetadata(data.hash);
    if (nftMetadata) {
      return {
        shares: data.shares,
        end: data.end,
        hash: data.hash,
        price: data.price,
        seller: data.seller,
        sellerNonce: data.sellerNonce,
        fraktal: data.fraktal,
        name: nftMetadata.name,
        description: nftMetadata.description,
        imageURL: checkImageCID(nftMetadata.image),
      };
    }
  } catch (err) {
    return { error: `Error: ${err}` };
  }
}

export {infuraConfig}