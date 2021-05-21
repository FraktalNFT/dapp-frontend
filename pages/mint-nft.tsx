import { VStack } from "@chakra-ui/layout";
import React, { useState } from "react";
import Head from "next/head";
import styles from "./mint-nft.module.css";
import Button from "../components/button";
import { HStack } from "@chakra-ui/layout";
import { Image } from "@chakra-ui/image";

export default function MintNFTView() {
  const [image, setImage] = useState(null);
  return (
    <VStack spacing="0" mb="12.8rem">
      <Head>
        <title>Fraktal - Mint NFT</title>
      </Head>
      <div className={styles.header}>Mint NFT</div>
      <HStack
        spacing="32px"
        marginTop="40px !important"
        alignItems="flex-start"
      >
        <div>
          <div className={styles.inputHeader}>NAME</div>
          <input className={styles.input} />
          <div className={styles.inputHeader} style={{ marginTop: "32px" }}>
            DESCRIPTION (OPTIONAL)
          </div>
          <input className={styles.input} />
          <Button disabled style={{ display: "block", marginTop: "40px" }}>
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
                  <Button
                    isOutlined
                    style={{ width: "160px" }}
                    onClick={() => setImage("/filler-image-1.png")}
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
                  <Image src={image} w={"180px"} h="240px" />
                </div>
              </>
            )}
          </div>
        </div>
      </HStack>
    </VStack>
  );
}
