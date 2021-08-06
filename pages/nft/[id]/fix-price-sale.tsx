import { HStack, VStack } from "@chakra-ui/layout";
import React, {useEffect, useState} from "react";
import Head from "next/head";
import Link from "next/link";
import { BigNumber, utils } from "ethers";
import FrakButton from '../../../components/button';
import { Image } from "@chakra-ui/image";
import styles from "./auction.module.css";
import {shortenHash, timezone, loadSigner} from '../../../utils/helpers';
import {getAccountFraktalNFTs, createListed, getNFTobject} from '../../../utils/graphQueries';
import { useWeb3Context } from '../../../contexts/Web3Context';
import { buyFraktions } from '../../../utils/contractCalls';

export default function FixPriceNFTView() {
  const {account, provider, contractAddress} = useWeb3Context();
  const [signer, setSigner] = useState();
  const [index, setIndex] = useState();
  const [nftObject, setNftObject] = useState();
  const [fraktionsToBuy, setFraktionsToBuy] = useState();

  useEffect(async ()=>{
    let signer = await loadSigner(provider);
    console.log('signer', signer)
    if(signer){
      setSigner(signer)
    }
  },[provider])

  useEffect(async ()=>{
      const address = window.location.href.split('http://localhost:3000/nft/');
      const index = address[1].split('/fix-price-sale')[0]
      if(index){
        setIndex(index)
      }
      let obj = await getAccountFraktalNFTs('listed_itemsId',index)
      if(obj){
        let nftObjects = await createListed(obj.listItems[0])
        if(nftObjects){
          setNftObject(nftObjects)
        }
      }else{
        setNftObject()
      }
  },[])

  const toPay = () => utils.parseEther(((fraktionsToBuy * nftObject.price)+0.000000001).toString()) //utils.parseEther(

  async function buyingFraktions() {
      try {
        let tx = await buyFraktions(
          nftObject.seller,
          nftObject.marketId,
          fraktionsToBuy,
          toPay(),
          signer,
          contractAddress);
      }catch(e){
        console.log('There has been an error: ',e)
      }
  }


  const exampleNFT = {
    id: 0,
    name: "Golden Fries Cascade",
    imageURL: "/filler-image-1.png",
    artistAddress: "0x1234...5678",
    contributions: BigNumber.from(5).div(100),
    createdAt: new Date().toISOString(),
    countdown: new Date("06-25-2021"),
  };

  return (
    <VStack spacing="0" mb="12.8rem">
      <Head>
        <title>Fraktal - NFT</title>
      </Head>
      <div>
        <Link href="/">
          <div className={styles.goBack}>← back to all NFTS</div>
        </Link>

        <div className={styles.header}>{nftObject?nftObject.name:''}</div>
        <HStack spacing="32px" marginTop="40px" align="flex-start">
          <div>
              <Image
              src={nftObject?nftObject.imageURL:exampleNFT.imageURL}
              w="300px"
              h="300px"
              style={{ borderRadius: "4px 4px 0px 0px" }}
              />
            <div className={styles.NFTCard}>
              <div className={styles.cardHeader}>ARTIST</div>
              <div className={styles.cardText} style={{ color: "#985cff" }}>
                {nftObject? shortenHash(nftObject.creator) : 'loading'}
              </div>
              <div style={{ marginTop: "8px" }} className={styles.cardHeader}>
                DATE OF CREATION
              </div>
              <div className={styles.cardText}>
                {nftObject?timezone(nftObject.createdAt):'loading'}
              </div>
            </div>
          </div>
          <div className={styles.auctionCard}>
            <div style={{ marginRight: "52px" }}>
              <div className={styles.auctionCardDetailsContainer}>
                <div style={{ marginRight: "48px" }}>
                  <div className={styles.auctionCardDetailsNumber}>{nftObject?nftObject.price:''}</div>
                  <div className={styles.auctionCardDetailsText}>Price of fraktion</div>
                </div>
                <div style={{ marginRight: "28px" }}>
                <div className={styles.auctionCardDetailsNumber}>{nftObject?nftObject.amount:''}</div>
                  <div className={styles.auctionCardDetailsText}>Fraktions on sale</div>
                </div>
              </div>
            </div>
            <div className={styles.auctionCardDivider} />
            <div style={{ marginRight: "24px" }}>
              <div className={styles.auctionCardHeader}>Contributed</div>
              <div className={styles.auctionCardDetailsContainer}>
                <div style={{ marginRight: "60px" }}>
                  <div className={styles.auctionCardDetailsNumber}>Raised</div>
                  <div className={styles.auctionCardDetailsText}>ETH</div>
                </div>
                <div>
                  <div className={styles.auctionCardDetailsNumber}>x</div>
                  <div className={styles.auctionCardDetailsText}>People</div>
                </div>
              </div>
            </div>
            <div className={styles.contributeContainer}>
              <div style={{ marginLeft: "24px" }}>
                <div className={styles.contributeHeader}>Buy fraktions</div>
                <input
                  className={styles.contributeInput}
                  type="number"
                  onChange={(e)=>setFraktionsToBuy(e.target.value)}
                />
              </div>
              <div style={{ marginLeft: "24px" }}>
                <div className={styles.contributeHeader}>Total</div>
                <div className={styles.contributeHeader}>
                  {nftObject?parseFloat(fraktionsToBuy*nftObject.price).toFixed(4): 0} ETH
                </div>
              </div>
              <FrakButton className={styles.contributeCTA} onClick={()=>buyingFraktions()}>
              BUY
              </FrakButton>
            </div>
          </div>
        </HStack>

      </div>
    </VStack>
  );
}
