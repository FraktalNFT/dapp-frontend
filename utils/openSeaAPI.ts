const apiURL = process.env.NEXT_PUBLIC_OPENSEA_API ? process.env.NEXT_PUBLIC_OPENSEA_API : 'https://rinkeby-api.opensea.io/api/v1/';
const options = {method: 'GET'};
const ASSET_METHOD = 'asset';
const ASSETS_METHOD = 'assets';

export const assetsInWallet = (address) => {
  const data = fetch(apiURL + `assets?owner=${address}&order_direction=desc&offset=0&limit=20`, options)
    .then(response => response.json())
    .then(data => {
      return data;
    })
    .catch(err => console.error(err));
  return data;
}

export const validateAsset = (contract, tokenId) => {
    const data = fetch(apiURL +  ASSET_METHOD + `/` + contract + '/' + tokenId, options)
        .then(response => response.json())
        .then(data => {
            return data;
        })
        .catch(err => console.error(err));
    return data;
}


// function to parse this output to nftObjects
