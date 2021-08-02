import { VStack } from "@chakra-ui/layout";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import styles from "../styles/mint-nft.module.css";
import Button from "../components/button";
import { HStack } from "@chakra-ui/layout";
import { Image as ImageComponent }  from "@chakra-ui/image";
import { Contract } from "@ethersproject/contracts";
import { useWeb3Context } from "/contexts/Web3Context";
import {utils} from "ethers";
import {pinByHash} from '../utils/pinataPinner'; // Since we upload to IPFS, simply call pin services to pin the hash
import {contracts, createNFT} from '../utils/contractCalls';
const { create } = require('ipfs-http-client');
const ethers = require('ethers');

export default function MintNFTView() {
  const { providerChainId, provider, account, contractAddress } = useWeb3Context();
  const [ipfsNode, setIpfsNode] = useState();
  const [imageData, setImageData] = useState(null); // used?
  const [imageSize, setImageSize] = useState([]);
  const [signer, setSigner] = useState();
  const [name, setName] = useState();
  const [description, setDescription] = useState();
  const [file, setFile] = useState();

  // show tx hash
  // add to metamask tokens received
  // get events
  // navigate to market?

  useEffect(()=>{
    const ipfsClient = create({
      host: "ipfs.infura.io",
      port: "5001",
      protocol: "https",})
    setIpfsNode(ipfsClient)
  },[])

  let optionalBytecode;
  useEffect(()=>{
    async function loadSigner() { //Load contract instance
      if (typeof provider !== "undefined") {
        try {
          let signer;
          const accounts = await provider.listAccounts();
          if (accounts && accounts.length > 0) {
            signer = provider.getSigner();// get signer
          } else {
            signer = provider; // or use RPC (cannot sign tx's. should call a connect warning)
          }
          setSigner(signer);
        } catch (e) {
          console.log("ERROR LOADING SIGNER", e);
        }
      }
    }
    loadSigner();
  },[provider, optionalBytecode])


  function openLocal(){ // Opens the file browser.. implement tests of the file here or include into front
    document.getElementById('imageInput').files = null;
    document.getElementById('imageInput').click()
// test type? or add accept attributes in input?
  }

  // ipfs.add parameters for more deterministic CIDs
  const ipfsAddOptions = {
    cidVersion: 1,
    hashAlg: 'sha2-256'
  }

  async function upload(data){
    let added = await ipfsNode.add(data); // , ipfsAddOptions for V1 CIDs
    // console.log('ADDED',added)
    return added;
  }


  async function uploadImageToIpfs(){
    let url
    let imageUpload
    try{
      imageUpload = await upload(file);
    }catch(e){
      console.log('Error: ',e)
      return 'Error uploading the file'
    }

    await pinByHash(imageUpload.cid.toString()) // Pinata
    return imageUpload.path;
  }

  // Contracts to expose mint function
  // const transactionOptions = { // hardcoded forced for error on automatic gas estimation (Goerli stuff??)
  //     gasLimit: 600000,
  //     gasPrice: ethers.utils.parseUnits('5.0', 'gwei')
  // }

  async function prepareNftData(){
    let imageCid
    let metadata
    let results = await uploadImageToIpfs()
    metadata = await {name:name, description:description, image:results}
    minter(metadata)
  }
  async function minter(metadata) {
    let metadataCid = await upload(JSON.stringify(metadata)) // it does not upload the object!!
    let formatted = metadataCid.cid.toString()
    await pinByHash(formatted) //Pinata
    createNFT(formatted, signer, contractAddress);
  }

  async function addFile(){ // preparation of the file (front-end exclusive)
    const selectedFile = document.getElementById('imageInput').files[0];
    setFile(selectedFile)
    // All this is to manage image issues
    let reader = new FileReader(); // read it
    reader.readAsDataURL(selectedFile); //
    reader.onloadend = function () {
        setImageData(reader.result)
        var image = new Image(); // for sizing info
        image.src = reader.result;
        image.onload = function() {
          setImageSize(this.width, this.height)
          }
      }
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
          <Button disabled={!imageData || !name} style={{ display: "block", marginTop: "40px" }} onClick={()=>prepareNftData()}>
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
