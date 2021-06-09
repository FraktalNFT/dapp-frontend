import { VStack } from "@chakra-ui/layout";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import styles from "../styles/mint-nft.module.css";
import Button from "../components/button";
import { HStack } from "@chakra-ui/layout";
import { Image } from "@chakra-ui/image";
// import {useExternalContractLoader} from "/hooks/externalContractLoader"; //wasn't found.. WTF?!?
import { Contract } from "@ethersproject/contracts";
import { useWeb3Context } from "/contexts/Web3Context";

const contracts = [{providerChainId:1, address:'NA'},{providerChainId:5, address:'0x1941a9207c0145693b66ec2a67bc6cfecced794a'}]
const mintAbi = [  {
    constant: false,
    inputs: [
      { internalType: "address", name: "_to", type: "address" },
      { internalType: "bytes32", name: "tokenURI", type: "bytes32" },
    ],
    name: "mint",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  }];



export default function MintNFTView() {
  const { providerChainId, provider } = useWeb3Context();
  const [image, setImage] = useState(null);
  const [contract, setContract] = useState(null);
  const [name, setName] = useState();
  const [description, setDescription] = useState();

  let optionalBytecode;
  useEffect(()=>{
    let address = contracts.find(x=>x.providerChainId === providerChainId).address;
    async function loadContract() {
      if (typeof provider !== "undefined" && address && mintAbi) {
        try {
          let signer;
          const accounts = await provider.listAccounts();
          if (accounts && accounts.length > 0) {
            signer = provider.getSigner();
          } else {
            signer = provider;
          }

          const customContract = new Contract(address, mintAbi, signer);
          if (optionalBytecode) customContract.bytecode = optionalBytecode;

          setContract(customContract);
        } catch (e) {
          console.log("ERROR LOADING EXTERNAL CONTRACT AT " + address + " (check provider, address, and ABI)!!", e);
        }
      }
    }
    loadContract();
  },[provider, optionalBytecode])


  // async function createNFT(){
    // send tx,
    // show tx hash
    // get events
    // upload data IPFS (and pin it w Pinata)
    //
  // }

  function openLocal(){
    document.getElementById('imageInput').files = null;
    document.getElementById('imageInput').click()
// test type?
  }

  async function addFile(){
    const selectedFile = document.getElementById('imageInput').files[0];
    let reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onloadend = function () {
        setImage(reader.result)
      };
  }


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
{/*          <button onClick={()=>console.log(nameInput())}>test</button>*/}
          <div className={styles.inputHeader}>NAME</div>
          <input className={styles.input}  id="nameIn"  onChange={(e)=>setName(e.target.value)}/>
          <div className={styles.inputHeader} style={{ marginTop: "32px" }}>
            DESCRIPTION (OPTIONAL)
          </div>
          <input className={styles.input} id="descriptionIn"   onChange={(e)=>setDescription(e.target.value)}/>
          <Button disabled={!image || !name} style={{ display: "block", marginTop: "40px" }} onClick={()=>createNFT()}>
            Create NFT
          </Button>
        </div>
        <div>
          <div className={styles.inputHeader}>UPLOAD FILE</div>
          <div className={styles.uploadContainer}>
            {!image ? (
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
                    onClick={() => openLocal()} //setImage("/filler-image-1.png")
                  >
                    Choose file
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Image
                  src={"/trash.svg"}
                  style={{
                    position: "absolute",
                    top: "24px",
                    right: "24px",
                    cursor: "pointer",
                  }}
                  onClick={() => setImage(null)}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Image src={image} w={"180px"} h='240px' />
                </div>
              </>
            )}
          </div>
        </div>
      </HStack>
    </VStack>
  );
}
