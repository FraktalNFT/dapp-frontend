import { VStack } from "@chakra-ui/layout";
import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { BigNumber } from "ethers";
import { Image } from "@chakra-ui/image";
import styles from "./manage.module.css";
import Button from "../../../components/button";

export default function ManageView() {
  const [view, setView] = useState("manage");

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
        {view === "manage" ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "16px",
            }}
          >
            <div className={styles.redeemContainer}>
              <div style={{ marginLeft: "24px" }}>
                <div className={styles.redeemHeader}>OWNERSHIP</div>
                <div className={styles.redeemAmount}>50%</div>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Image src={"/info.svg"} style={{ marginRight: "8px" }} />
                <div className={styles.redeemCTA}>Redeem NFT</div>
              </div>
            </div>
          </div>
        ) : (
          <div>hi</div>
        )}
        <div className={styles.content}>
          <div className={styles.CTAsContainer}>
            <Button
              isOutlined
              style={{
                backgroundColor: "white",
                marginRight: "16px",
                width: "192px",
              }}
            >
              Deposit Revenue
            </Button>
            <Button
              isOutlined
              style={{ backgroundColor: "white", width: "192px" }}
            >
              Claim Revenue
            </Button>
          </div>
          <Image
            src={exampleNFT.imageURL}
            w={"320px"}
            h={"320px"}
            borderRadius="4px"
          />
        </div>
      </div>
    </VStack>
  );
}
