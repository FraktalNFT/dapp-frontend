import {getOpenSeaApi} from "@/utils/helpers";
const apiURL = getOpenSeaApi(parseInt(process.env.NEXT_PUBLIC_NETWORK_CHAIN_ID));
const options = {
    method: 'GET',
    headers: {
        'X-API-KEY': process.env.NEXT_PUBLIC_OPEASEA_API_KEY ? process.env.NEXT_PUBLIC_OPEASEA_API_KEY : ''
    }
};
const ASSET_METHOD = 'asset';
const ASSETS_METHOD = 'assets';

/**
 * Open Sea assets
 * @param address
 */
export const assetsInWallet = (address, params = {}) => {
  let url;
  url = apiURL + `assets?owner=${address}&order_direction=desc&offset=${params.offset}&limit=${params.limit}`;
  const data = fetch(url, options)
    .then(response => response.json())
    .then(data => {
      return data;
    })
    .catch(err => console.error(err));
  return data;
}

/**
 * Validate asset
 * @param contract
 * @param tokenId
 */
export const validateAsset = (contract, tokenId) => {
    const data = fetch(apiURL +  ASSET_METHOD + `/` + contract + '/' + tokenId, options)
        .then(response => response.json())
        .then(data => {
            return data;
        })
        .catch(err => console.error(err));
    return data;
}
