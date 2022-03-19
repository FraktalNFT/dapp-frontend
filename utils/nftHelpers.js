import { utils } from 'ethers';
import {getSubgraphAuction, getSubgraphData} from './graphQueries';

const { create, CID } = require('ipfs-http-client');

let infuraAuth;
if (process.env.NEXT_PUBLIC_INFURA_PROJECT_ID !== undefined && process.env.NEXT_PUBLIC_INFURA_PROJECT_SECRET !== undefined) {
  infuraAuth = {
    headers: {
      Authorization: 'Basic ' + Buffer.from(process.env.NEXT_PUBLIC_INFURA_PROJECT_ID + ':' + process.env.NEXT_PUBLIC_INFURA_PROJECT_SECRET).toString('base64')
    }
  }
}

const infuraConfig = {
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  ...infuraAuth
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
    try {
      let cidv1 = toBase32(correctedCid);
    } catch (e) {
      if (!splitted[1].startsWith('ipfs/')) {
        splitted[1] = 'ipfs/' + splitted[1];
      }
      return 'https://ipfs.io/' + splitted[1];
    }
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

async function fetchNftMetadata(hash) {
  if (hash.startsWith('ipfs://ipfs/Qm')) {
    hash = hash.slice(12)
  } else if (hash.startsWith('ipfs://Qm')) {
    hash = hash.slice(7)
  } else if (hash.startsWith('ipfs://ba')) {
    hash ='https://ipfs.io/ipfs/' + hash.slice(7);
  }
  if (hash.startsWith('Qm')) {
    let chunks;
    for await (const chunk of ipfsClient.cat(hash)) {
      chunks = binArrayToJson(chunk);
    }
    return chunks;
  } else {
    let res = await fetch(hash, {mode: 'no-cors'});
    if (res) {
      let result = res.json();
      return result;
    }
  }
}

async function getFraktalData(address) {
  let data = await getSubgraphData('fraktal', address);
  if (data?.fraktalNfts?.length) {
    return {
      fraktalId: data.fraktalNfts[0].marketId,
      collateral: data.fraktalNfts[0].collateral,
    };
  } else {
    return { fraktalId: null, collateral: null };
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
        value: nftMetadata.name,
        description: nftMetadata.description,
        imageURL: checkImageCID(nftMetadata.image || nftMetadata.imageUrl),
      };
    }
  } catch {
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
    if (data.collateral) {
      object.collateral = data.collateral;
    }
    if (nftMetadata) {
      if (nftMetadata.name) {
        object.name = nftMetadata.name;
      }
      if (nftMetadata.description) {
        object.description = nftMetadata.description;
      }
      if (nftMetadata.image) {
        object.imageURL = checkImageCID(nftMetadata.image);
      } else if (nftMetadata.imageUrl) {
        object.imageURL = checkImageCID(nftMetadata.imageUrl);
      }
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
        link: `/nft/${data.fraktal.id}/details`,
        creator: data.fraktal.creator.id,
        marketId: data.fraktal.marketId,
        createdAt: data.fraktal.createdAt,
        tokenAddress: data.fraktal.id,
        holders: data.fraktal.fraktions.length,
        raised: data.gains,
        id: data.id,
        price: utils.formatEther(data.price),
        amount: data.amount,
        seller: data.seller.id,
        name: nftMetadata.name,
        value: nftMetadata.name,
        description: nftMetadata.description,
        imageURL: checkImageCID(nftMetadata.image || nftMetadata.imageUrl),
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
      const seller = typeof data.seller === "object" ? data.seller.id : data.seller;
      return {
        value: nftMetadata.name,
        link: `/nft/${seller}-${data.sellerNonce}/auction`,
        amountOfShare: data.amountOfShare,
        endTime: data.endTime,
        hash: data.hash,
        price: data.reservePrice,
        reservePrice: data.reservePrice,
        seller: seller,
        sellerNonce: data.sellerNonce,
        tokenAddress: data.tokenAddress,
        name: nftMetadata.name,
        description: nftMetadata.description,
        imageURL: checkImageCID(nftMetadata.image || nftMetadata.imageUrl),
      };
    }
  } catch (err) {
    return { error: `Error: ${err}` };
  }
}

/**
 * Map Fixed Price
 * @param data
 */
async function mapFixedPrice(data) {
  let dataOnSale;
  if (data?.listItems?.length !== undefined) {
    dataOnSale = data?.listItems?.filter(x => {
      return x.fraktal.status == "open";
    });
  }

  let objects = await Promise.all(
      dataOnSale.map(x => {
        let res = createListed(x);
        if (typeof res !== "undefined") {
          return res;
        }
      }).filter(notUndefined => notUndefined !== undefined)
  );
  return objects;
}

/**
 * Map Auction To Fraktal
 * @param auctionData
 * @returns {Promise<any[]>}
 */
async function mapAuctionToFraktal(auctionData) {
  let auctionDataHash = [];
  await Promise.all(auctionData?.auctions.map(async x => {
    let _hash = await getSubgraphAuction("auctionsNFT", x.tokenAddress);

    const itm = {
      "id":`${x.tokenAddress}-${x.sellerNonce}`,
      "hash":_hash.fraktalNft.hash
    };

    auctionDataHash.push(itm);
  }));
  let auctionItems = [];
  await Promise.all(auctionData?.auctions.map(async (auction, idx) => {
        let hash = auctionDataHash.filter(e=>e.id == `${auction.tokenAddress}-${auction.sellerNonce}`);
        Object.assign(auction, {"hash":hash[0].hash});
        const item = await createListedAuction(auction);
        if (!item.error) {
          auctionItems.push(item);
        }
      }
  ).filter(notUndefined => notUndefined !== undefined));
  return auctionItems;
}

export {infuraConfig, mapFixedPrice, mapAuctionToFraktal}