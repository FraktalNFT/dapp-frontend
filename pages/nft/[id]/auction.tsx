import { HStack, VStack } from "@chakra-ui/layout";
import React, {useEffect, useState} from "react";
import Head from "next/head";
import Link from "next/link";
import { BigNumber } from "ethers";
import { Image } from "@chakra-ui/image";
import styles from "./auction.module.css";
import {shortenHash, timezone} from '../../../utils/helpers';
import {getAccountFraktalNFTs, createObject, getNFTobject} from '../../../utils/graphQueries';
export default function AuctionNFTView() {
  const address = window.location.href.split('http://localhost:3000/nft/');
  const index = parseFloat(address[1].split('/auction')[0])
  const [nftObject, setNftObject] = useState();

  useEffect(async ()=>{
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

        <div className={styles.header}>{exampleNFT.name}</div>
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
              <div className={styles.auctionCardHeader}>Time Remaining</div>
              <div className={styles.auctionCardDetailsContainer}>
                <div style={{ marginRight: "48px" }}>
                  <div className={styles.auctionCardDetailsNumber}>03</div>
                  <div className={styles.auctionCardDetailsText}>Hours</div>
                </div>
                <div style={{ marginRight: "28px" }}>
                  <div className={styles.auctionCardDetailsNumber}>45</div>
                  <div className={styles.auctionCardDetailsText}>Minutes</div>
                </div>
                <div>
                  <div className={styles.auctionCardDetailsNumber}>15</div>
                  <div className={styles.auctionCardDetailsText}>Seconds</div>
                </div>
              </div>
            </div>
            <div className={styles.auctionCardDivider} />
            <div style={{ marginRight: "24px" }}>
              <div className={styles.auctionCardHeader}>Contributed</div>
              <div className={styles.auctionCardDetailsContainer}>
                <div style={{ marginRight: "60px" }}>
                  <div className={styles.auctionCardDetailsNumber}>125.25</div>
                  <div className={styles.auctionCardDetailsText}>ETH</div>
                </div>
                <div>
                  <div className={styles.auctionCardDetailsNumber}>45</div>
                  <div className={styles.auctionCardDetailsText}>People</div>
                </div>
              </div>
            </div>
            <div className={styles.contributeContainer}>
              <div style={{ marginLeft: "24px" }}>
                <div className={styles.contributeHeader}>ETH</div>
                <input
                  className={styles.contributeInput}
                  type="number"
                  placeholder={"0.01"}
                />
              </div>
              <div className={styles.contributeCTA}>Contribute</div>
            </div>
          </div>
        </HStack>

      </div>
    </VStack>
  );
}
