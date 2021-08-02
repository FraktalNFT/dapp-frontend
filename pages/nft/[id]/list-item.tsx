import { HStack, VStack } from "@chakra-ui/layout";
import React, {useEffect, useState} from "react";
import Head from "next/head";
import Link from "next/link";
import { BigNumber } from "ethers";
import { Image } from "@chakra-ui/image";
import styles from "./auction.module.css";
import FrakButton from '../../../components/button';
import {shortenHash, timezone} from '../../../utils/helpers';
import {getAccountFraktalNFTs, createObject, getNFTobject} from '../../../utils/graphQueries';
export default function ListNFTView() {
  const [nftObject, setNftObject] = useState();
  const [index, setIndex] = useState();
  const [totalAmount, setTotalAmount] = useState(0.);
  const [totalPrice, setTotalPrice] = useState(0.);
  useEffect(async ()=>{
    const address = window.location.href.split('http://localhost:3000/nft/');
    const index = parseFloat(address[1].split('/auction')[0])
    if(index){
      setIndex(index)
    }
      let obj = await getAccountFraktalNFTs('marketid_fraktal',index)
      let nftObjects = await createObject(obj.fraktalNFTs[0])
      if(nftObjects){
        setNftObject(nftObjects)
      }
  },[index])
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
        <div className={styles.subheader}>{nftObject?nftObject.description:''}</div>

        <div>
          do you have fraktions?<br />
          is the nft in the market yet?<br />
          else.. lock the shares to the market,<br />
          transfer nft to the market<br />
          and unlock the shares to list<br />
        </div>

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
          <div style={{display: 'flex', flexDirection: "column"}}>
            <div style={{display: 'flex', flexDirection: "row"}}>

            <div style={{ marginRight: "52px" }}>
              <div style={{display:'flex', margin: 'auto', flexDirection:'column'}}>
                <div>
                  <div style={{ marginLeft: "24px" }}>
                    <div className={styles.contributeHeader}>Total price (ETH)</div>
                    <input
                      className={styles.contributeInput}
                      type="number"
                      placeholder={"0.01"}
                      onChange={(e)=>{setTotalPrice(e.target.value)}}
                    />
                  </div>
                </div>
                <div >
                  <div style={{ marginLeft: "24px" }}>
                    <div className={styles.contributeHeader}>Fraktals</div>
                    <input
                      className={styles.contributeInput}
                      type="number"
                      placeholder={totalAmount}
                      onChange={(e)=>{setTotalAmount(e.target.value)}}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.auctionCardDivider} />
            <div style={{ marginRight: "24px" }}>
              <div className={styles.auctionCardHeader}>List properties</div>
              <div className={styles.auctionCardDetailsContainer}>
                <div style={{ marginRight: "60px" }}>
                  <div className={styles.auctionCardDetailsNumber}>{totalPrice}</div>
                  <div className={styles.auctionCardDetailsText}>ETH</div>
                </div>
                <div>
                  <div className={styles.auctionCardDetailsNumber}>{totalAmount}</div>
                  <div className={styles.auctionCardDetailsText}>shares in sell</div>
                </div>
              </div>
            </div>
            </div>
          <FrakButton disabled={!totalPrice || !totalAmount} style={{marginTop: '32px'}}>
          List fraktals
          </FrakButton>
          </div>
          </div>
        </HStack>

      </div>
    </VStack>
  );
}
