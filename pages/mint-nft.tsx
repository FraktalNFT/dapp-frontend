import { VStack } from "@chakra-ui/layout";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import styles from "../styles/mint-nft.module.css";
import Button from "../components/button";
import { HStack } from "@chakra-ui/layout";
import { Image as ImageComponent }  from "@chakra-ui/image";
import { useWeb3Context } from "../contexts/Web3Context";
import { pinByHash } from '../utils/pinataPinner';
import { createNFT} from '../utils/contractCalls';
import { useRouter } from 'next/router';
const { create } = require('ipfs-http-client');

export default function MintNFTView() {
  const router = useRouter();
  const { provider, contractAddress } = useWeb3Context();
  const [ipfsNode, setIpfsNode] = useState();
  const [imageData, setImageData] = useState(null);
  const [imageSize, setImageSize] = useState([]);
  const [name, setName] = useState();
  const [description, setDescription] = useState();
  const [file, setFile] = useState();

  useEffect(()=>{
    const ipfsClient = create({
      host: "ipfs.infura.io",
      port: "5001",
      protocol: "https",})
    setIpfsNode(ipfsClient)
  },[])

  function openLocal(){
    document.getElementById('imageInput').files = null;
    document.getElementById('imageInput').click()
    // test type? or add accept attributes in input?
  }

  async function uploadAndPin(data){
    let dataUpload
    try{
      dataUpload = await ipfsNode.add(data);
    }catch(e){
      console.log('Error: ',e)
      return 'Error uploading the file'
    }
    await pinByHash(dataUpload.cid.toString()) // Pinata
    return dataUpload;
  }

  async function prepareNftData(){
    let results = await uploadAndPin(file)
    let metadata = {name:name, description:description, image:results.path}
    minter(metadata)
  }
  async function minter(metadata) {
    let metadataCid =  await uploadAndPin(JSON.stringify(metadata))
    if(metadataCid){
      createNFT(metadataCid.cid.toString(), provider, contractAddress).then(()=>{
        router.push('/my-nfts');
      });
    }
  }

  async function addFile(){
    const selectedFile = document.getElementById('imageInput').files[0];
    setFile(selectedFile)
    let reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onloadend = function () {
        setImageData(reader.result)
        var image = new Image();
        image.src = reader.result;
        image.onload = function() {
          setImageSize(this.width, this.height)
          }
      }
  }
  const proportionalImage = (width) => {return (imageSize[1]/imageSize[0])*width}
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
