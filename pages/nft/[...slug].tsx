import { VStack } from "@chakra-ui/layout";
import React from "react";
import Head from "next/head";
import { createUseStyles } from "react-jss";
import Link from "next/link";

const useStyles = createUseStyles({
  goBack: {
    color: "#985CFF !important",
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 500,
    cursor: "pointer",
  },
});

export default function NFTview() {
  const styles = useStyles();
  return (
    <VStack spacing="0" mb="12.8rem">
      <Head>
        <title>Fraktal - NFT</title>
      </Head>
      <div>
        <Link href="/">
          <div className={styles.goBack}>← back to all NFTS</div>
        </Link>
      </div>
    </VStack>
  );
}
