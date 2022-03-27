import { utils } from 'ethers';
import {getSubgraphAuction, getSubgraphData} from './graphQueries';
import {getNftMetadata} from "@/utils/alchemy";

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
  if (data.hasOwnProperty('nft') && data.creator === undefined || data.marketId === undefined) {
    data = data.nft;
  }
  const tokenId = (data.collateral !== null && data.collateral !== undefined)  ? data.collateral.tokenId : "1";
  try {
    const nftMetadata = await getNftMetadata(data.id, tokenId);
    let object = {
      id: data.id,
      creator: data.creator.id,
      marketId: data.marketId,
      createdAt: data.createdAt,
      status: data.status,
    };

    if (data.fraktions) {
      object.balances = data.fraktions;
    }
    if (data.amount) {
      object.userBalance = data.amount
    }
    if (data.collateral) {
      object.collateral = data.collateral;
    }
    if (nftMetadata.metadata.name) {
      object.name = nftMetadata.metadata.name;
    }
    if (nftMetadata.metadata.description) {
      object.description = nftMetadata.metadata.description;
    }
    object.imageURL = getImageUrl(nftMetadata);
    object.metadata = nftMetadata
    return object;
  } catch {
    console.log('Error fetching 2 ', data);
    return null;
  }
}

const getImageUrl = (nftMetadata) => {
  if (nftMetadata.media && nftMetadata.media[0] && nftMetadata.media[0].gateway !== '') {
    return nftMetadata.media[0].gateway;
  } else if (nftMetadata.metadata.imageUrl) {
    return nftMetadata.metadata.imageUrl;
  } else if (nftMetadata.metadata.image && nftMetadata.metadata.image.startsWith('ipfs://')) {
    let hasIpfsProtocol = nftMetadata.metadata.image.split('ipfs://');
    return 'https://ipfs.io/ipfs/' + hasIpfsProtocol[1];
  }
}

export async function createListed(data) {
  try {
    const tokenId = (data.fraktal.collateral !== null && data.fraktal.collateral !== undefined) ? data.fraktal.collateral.tokenId : "1";
    const nftMetadata = await getNftMetadata(data.fraktal.id, tokenId);

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
        name: nftMetadata.metadata.name,
        value: nftMetadata.metadata.name,
        description: nftMetadata.metadata.description,
        imageURL: getImageUrl(nftMetadata)
      };
    }
  } catch (err) {
    console.log('err', err)
    return { error: `Error: ${err}` };
  }
}

export async function createListedAuction(data) {
  const tokenId = (data.collateral !== null && data.collateral !== undefined) ? data.collateral.tokenId : "1";
  try {
    const nftMetadata = await getNftMetadata(data.tokenAddress, tokenId);
    if (nftMetadata) {
      const seller = typeof data.seller === "object" ? data.seller.id : data.seller;
      return {
        link: `/nft/${seller}-${data.sellerNonce}/auction`,
        amountOfShare: data.amountOfShare,
        endTime: data.endTime,
        hash: data.hash,
        price: data.reservePrice,
        reservePrice: data.reservePrice,
        seller: seller,
        sellerNonce: data.sellerNonce,
        tokenAddress: data.tokenAddress,
        name: nftMetadata.metadata.name,
        value: nftMetadata.metadata.name,
        description: nftMetadata.metadata.description,
        imageURL: getImageUrl(nftMetadata)
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