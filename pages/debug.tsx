import * as helper from "../utils/nftHelpers"
import * as calls from "../utils/contractCalls"
import { useWeb3Context } from "../contexts/Web3Context";
import { useEffect, useState } from "react";
const IPFSGatewayTools = require('@pinata/ipfs-gateway-tools/dist/node');
const { create, CID } = require('ipfs-http-client');
// import fetch from 'node-fetch';


const gatewayTools = new IPFSGatewayTools();
// import IPFS from "ipfs"
// import {makeIpfsFetch} from "js-ipfs-fetch"
const binArrayToJson = function(binArray)
{
    var str = "";
    for (var i = 0; i < binArray.length; i++) {
        str += String.fromCharCode(parseInt(binArray[i]));
    }
    return JSON.parse(str)
};
async function fetchNftMetadata(hash){
    console.log(`fetching: ${hash}`);
    
    if(hash.startsWith('Qm')){
      let chunks
      for await (const chunk of ipfsClient.cat(hash)) {
        chunks = binArrayToJson(chunk);
      }
      // console.log('found qm.., data:',chunks)
      return chunks;
    } else {
        const res = await fetch(hash);
        const inJson = await res.json();
        console.log(inJson);
        return inJson;
        
        // .then(response => response.json())
        // .then(data => console.log(data));
        // console.log({res});
      
    //   if(res){
    //     let result = res.json()
    //     // console.log('found other, data:',result)
    //     return result
    //   }
    }
};

interface containsCIDRes {
    containsCid: string,
    cid: string
}

const correctIpfsCID = function(url: string){
    const check: containsCIDRes = gatewayTools.containsCID(url);
    const split = url.split(check.cid);
    console.log({url,check,split});

    
    if(check.containsCid){
        if(split.length>1){
            return `${check.cid}${split[1]}`;
        }else{
            return `${check.cid}`
        }
        
    }else{
        return false;
    }
}

const ipfsClient = create({
    host: "ipfs.infura.io",
    port: "5001",
    protocol: "https",});

export default function debugPage(){
    const { account, provider, marketAddress, factoryAddress } = useWeb3Context();
    const client = create("https://ipfs.io");
    const [uri,setUri] = useState("");
    const [cid,setCid] = useState("");
    const [json,setJson] = useState("");

    

    useEffect(()=>{
        const getData =async ()  => {
            if(provider){
                // const _uri = await calls.getERC721URI("0x9b8b9514dc5fed1f41184f03eada7b911e19ba01",28,provider);
                const _uri = await calls.getERC1155URI("0x88b1e4201d370aab1fb8c0c376723224ecc2d2bd",1,provider);
                const type = await calls.getNftContractType("0xe9681a2b3ac7d5124b292693b7597652a88bca2e",provider);
                console.log({type});
                
                const corrected = correctIpfsCID(_uri);
                console.log({corrected});
                
                if(corrected){//valid cid
                    const res = await fetchNftMetadata(corrected);
                    console.log(res);
                }else{//others
                    const res = await fetchNftMetadata(_uri);
                    console.log(res);
                }
                
                
                
                // const img = await fetchNftMetadata(res.image);
                // console.log(img);
                
                
                
                // setCid(newUrl);

                // for await (const buf of client.get(_uri.split("/")[4])) {
                //     console.log(buf.toString());
                    
                //     // do something with buf
                // }
                
                // const ipfs = await IPFS.create()
                // const fetch = await makeIpfsFetch({ipfs})
                // const response = await fetch(_uri)
                // const text = await response.text()
                


                // console.log({text});

            }
        }
        getData();
        
    },[provider]);

    return (
        <div>
            <div>{uri}</div>
            <div>{cid}</div>
            <div>{json}</div>
            
        </div>
    )
}