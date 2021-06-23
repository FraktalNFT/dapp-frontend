import {Pinata_ApiKey,Pinata_ApiSecret} from '../contexts/pinataConfig'; // retrieve it from process.env
//https://stackoverflow.com/questions/48699820/how-do-i-hide-api-key-in-create-react-app

//imports needed for this function
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
              pinata_api_key: Pinata_ApiKey,
              pinata_secret_api_key: Pinata_ApiSecret
          }
      })
      .then(function (response) {
          //handle response here
          console.log('Correct!: ', response)
      })
      .catch(function (error) {
          //handle error here
          console.log('Error: ',error)
      });
};
