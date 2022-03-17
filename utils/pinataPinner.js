const axios = require('axios');

export const pinByHash = (hashToPin) => {
  const url = `https://api.pinata.cloud/pinning/pinByHash`;
  const body = {
      hashToPin: hashToPin,
      hostNodes: [
          '/ip4/hostNode1ExternalIP/tcp/4001/ipfs/hostNode1PeerId',
          '/ip4/hostNode2ExternalIP/tcp/4001/ipfs/hostNode2PeerId'
      ],
  };
  return axios
      .post(url, body, {
          headers: {
              pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY,
              pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_API_SECRET
          }
      })
      .then(function (response) {
          //handle response here
      })
      .catch(function (error) {
          //handle error here
      });
};
