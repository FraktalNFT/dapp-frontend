import { HStack, VStack } from "@chakra-ui/layout";
import React from "react";
import Head from "next/head";
import Link from "next/link";
import { BigNumber } from "ethers";
import { Image } from "@chakra-ui/image";
import moment from "moment";
import styles from "./nft.module.css";

export default function NFTview() {
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
              src={exampleNFT.imageURL}
              w="300px"
              h="300px"
              style={{ borderRadius: "4px 4px 0px 0px" }}
            />
            <div className={styles.NFTCard}>
              <div className={styles.cardHeader}>ARTIST</div>
              <div className={styles.cardText} style={{ color: "#985cff" }}>
                {exampleNFT.artistAddress}
              </div>
              <div style={{ marginTop: "8px" }} className={styles.cardHeader}>
                DATE OF CREATION
              </div>
              <div className={styles.cardText}>
                {moment(exampleNFT.createdAt).format("HH:mm DD MMM YYYY")}
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
