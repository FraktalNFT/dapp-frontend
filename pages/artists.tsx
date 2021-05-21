import { Box, Grid, HStack, VStack, Text } from "@chakra-ui/layout";
import React, { useState } from "react";
import Head from "next/head";
import { FrakCard } from "../types";
import { BigNumber } from "ethers";
import NextLink from "next/link";
import NFTItem from "../components/nft-item";
import Dropdown from "../components/dropdown";
import FrakButton from "../components/button";
import Pagination from "../components/pagination";
import styles from "./artists.module.css";
import { Image } from "@chakra-ui/image";

export default function ArtistsView() {
  const SORT_TYPES = ["Popular", "New"];
  const [selectionMode, setSelectionMode] = useState(false);
  const [sortType, setSortType] = useState("Popular");

  const handleSortSelect = (item: string) => {
    setSortType(item);
    setSelectionMode(false);
  };

  // TODO: hardcoded stuff as of now
  const demoArtistItemsFull: FrakCard[] = Array.from({ length: 9 }).map(
    (_, index) => ({
      id: index + 1,
      name: "beople.eth",
      imageURL: "/filler-image-1.png",
      //contributions: BigNumber.from(5).div(100),
      createdAt: new Date().toISOString(),
      //countdown: new Date("06-25-2021"),
    })
  );
  return (
    <VStack spacing="0" mb="12.8rem">
      <Head>
        <title>Fraktal - Artists</title>
      </Head>
      <HStack w="96.4rem" spacing="0" justifyContent="space-between" mb="4rem">
        <Box position="relative" w={"280px"}>
          {!selectionMode ? (
            <FrakButton
              style={{ minWidth: "200px" }}
              isOutlined
              onClick={() => setSelectionMode(true)}
            >
              Sort: {sortType}
            </FrakButton>
          ) : (
            <Dropdown
              items={SORT_TYPES}
              onItemClick={handleSortSelect}
              position="absolute"
              mt="-3rem"
              zIndex="1"
            />
          )}
        </Box>
        <Text className="semi-48">Artists</Text>
        <div className={styles.searchContainer}>
          <input
            placeholder={"Search ENS or ETH address "}
            className={styles.searchInput}
          />
          <Image src="/search.svg" />
        </div>
      </HStack>
      <Grid
        margin="0 !important"
        mb="5.6rem !important"
        w="100%"
        templateColumns="repeat(3, 1fr)"
        gap="3.2rem"
      >
        {demoArtistItemsFull.map(item => (
          <NextLink href={`/artist/${item.id}`}>
            <NFTItem key={item.id} item={item} CTAText="View 3 NFTs" />
          </NextLink>
        ))}
      </Grid>
      <Pagination pageCount={21} handlePageClick={() => {}} />
    </VStack>
  );
}
