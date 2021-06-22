import { VStack } from "@chakra-ui/layout";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import styles from "../styles/mint-nft.module.css";
import Button from "../components/button";
import { HStack } from "@chakra-ui/layout";
import { Image as ImageComponent }  from "@chakra-ui/image";
// import {useExternalContractLoader} from "/hooks/externalContractLoader"; //wasn't found.. WTF?!?
import { Contract } from "@ethersproject/contracts";
import { useWeb3Context } from "/contexts/Web3Context";
import {utils} from "ethers";
const ethers = require('ethers');

const contracts = [{providerChainId:1, address:'NA'},{providerChainId:5, address:'0x1941a9207c0145693b66ec2a67bc6cfecced794a'}]
// only ABI funct needed to mint
const mintAbi = [
  "function mint(address _to, string tokenURI)"
  ];

  // { Json Version
  //   constant: false,
  //   inputs: [
  //     { internalType: "address", name: "_to", type: "address" },
  //     { internalType: "bytes32", name: "tokenURI", type: "bytes32" },
  //   ],
  //   name: "mint",
  //   outputs: [],
  //   payable: false,
  //   stateMutability: "nonpayable",
  //   type: "function",
  // }


export default function MintNFTView() {
  const { providerChainId, provider, account } = useWeb3Context();
  const [imageData, setImageData] = useState(null);
  const [imageSize, setImageSize] = useState([]);
  const [contract, setContract] = useState(null);
  const [name, setName] = useState();
  const [description, setDescription] = useState();

  const transactionOptions = { // hardcoded forced for error on automatic gas estimation (Goerli stuff??)
      gasLimit: 600000,
      gasPrice: ethers.utils.parseUnits('100.0', 'gwei')
  }


  let optionalBytecode;
  useEffect(()=>{
    let address = contracts.find(x=>x.providerChainId === providerChainId).address; // contract specific providerChainId
    async function loadContract() { //Load contract instance
      if (typeof provider !== "undefined" && address && mintAbi) {
        try {
          let signer;
          const accounts = await provider.listAccounts();
          if (accounts && accounts.length > 0) {
            signer = provider.getSigner();// get signer
          } else {
            signer = provider; // or use RPC (cannot sign tx's. should call a connect warning)
          }

          const customContract = new Contract(address, mintAbi, signer);
          if (optionalBytecode) customContract.bytecode = optionalBytecode; // for overwriting contract instance

          setContract(customContract);
        } catch (e) {
          console.log("ERROR LOADING EXTERNAL CONTRACT AT " + address + " (check provider, address, and ABI)!!", e);
        }
      }
    }
    loadContract();
  },[provider, optionalBytecode])


  async function createNFT(){
      let formatted = 'QmecvmnYsC3WsegU8RLy9nRSRE5dqTv3gPjKU4spBLpmRX'; //fake stuff for tests
      // utils.formatBytes32String('ethereum') // it has to be a bytes32 type
      let receipt;
      let tx = await contract.mint(account, formatted, transactionOptions) // fails on cannot estimate gas. with pre-settings passes.
      try{
        receipt = await tx.wait();
      }catch(e){
        receipt = 'Error: ',e.toString() //test this
      }
      console.log('Transaction receipt');
      console.log(receipt);

    // i need the image cid
    // upload data IPFS (and pin it w Pinata)
    // send tx,
    // show tx hash
    // add to metamask tokens received
    // get events
    // navigate to market?
  }

  function openLocal(){ // Opens the file browser.. implement tests of the file here or include into front
    document.getElementById('imageInput').files = null;
    document.getElementById('imageInput').click()
// test type? or add accept attributes in input?
  }

  async function addFile(){
    const selectedFile = document.getElementById('imageInput').files[0]; // gots whatever file was uploaded
    let reader = new FileReader(); // read it
    reader.readAsDataURL(selectedFile);
    reader.onloadend = function () {
        setImageData(reader.result)
        var image = new Image(); // for sizing info
        image.src = reader.result;
        image.onload = function() {
          setImageSize(this.width, this.height)
          }};
  }

  const proportionalImage = (width) => {return (imageSize[1]/imageSize[0])*width} // for sizes adjustments

  return (
    <VStack spacing='0' mb='12.8rem'>
      <Head>
        <title>Fraktal - Mint NFT</title>
      </Head>
      <div className={styles.header}>Mint NFT</div>
      <HStack
        spacing='32px'
        marginTop='40px !important'
        alignItems='flex-start'
      >
        <div>
          <div className={styles.inputHeader}>NAME</div>
          <input className={styles.input}  id="nameIn"  onChange={(e)=>setName(e.target.value)}/>
          <div className={styles.inputHeader} style={{ marginTop: "32px" }}>
            DESCRIPTION (OPTIONAL)
          </div>
          <input className={styles.input} id="descriptionIn"   onChange={(e)=>setDescription(e.target.value)}/>
          <Button disabled={!imageData || !name} style={{ display: "block", marginTop: "40px" }} onClick={()=>createNFT()}>
            Create NFT
          </Button>
        </div>
        <div>
          <div className={styles.inputHeader}>UPLOAD FILE</div>
          <div className={styles.uploadContainer}>
            {!imageData ? (
              <div>
                <div style={{ textAlign: "center", fontWeight: 500 }}>
                  PNG, GIF, WEBP, MP4 or MP3. Max 30mb.
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "16px",
                  }}
                >
              <input type="file"
                id="imageInput"
                style={{"display":"none"}}
                onChange={()=> addFile()}
                multiple={false}
                >
                </input>
                  <Button
                    isOutlined
                    style={{ width: "160px" }}
                    onClick={() => openLocal()}
                  >
                    Choose file
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <ImageComponent
                  src={"/trash.svg"}
                  style={{
                    position: "absolute",
                    top: "24px",
                    right: "24px",
                    cursor: "pointer",
                  }}
                  onClick={() => setImageData(null)}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ImageComponent src={imageData} w={"200px"} h={proportionalImage(200)} />
                </div>
              </>
            )}
          </div>
        </div>
      </HStack>
    </VStack>
  );
}
