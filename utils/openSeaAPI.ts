const rinkebyBaseURL = 'https://rinkeby-api.opensea.io/api/v1/';

const assetsRequest = 'https://api.opensea.io/api/v1/assets';

const options = {method: 'GET'};


export const assetsInWallet = (address) => {
  fetch(`https://rinkeby-api.opensea.io/api/v1/assets?owner=${address}&order_direction=desc&offset=0&limit=20`, options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));
}

// function to parse this output to nftObjects
