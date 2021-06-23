// import {ApiKey,ApiSecret} from '../contexts/pinataConfig'; // retrieve it from process.env
//https://stackoverflow.com/questions/48699820/how-do-i-hide-api-key-in-create-react-app

// const fs = require('fs');

//imports needed for this function
const axios = require('axios');

export const pinByHash = (hashToPin) => {
  console.log(process.env.REACT_APP_Pinata_ApiKey)
  // console.log(ApiSecret)
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
              pinata_api_key: process.env.REACT_APP_Pinata_ApiKey,
              pinata_secret_api_key: process.env.REACT_APP_Pinata_ApiSecret
          }
      })
      .then(function (response) {
          //handle response here
          console.log('Correcto! pineado desde Pinata: ', response)
      })
      .catch(function (error) {
          //handle error here
          console.log('Error: ',error)
      });
};
