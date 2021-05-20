import { Box, Grid, HStack, Text, VStack } from "@chakra-ui/layout";
import { BigNumber } from "ethers";
import Head from "next/head";
import NextLink from "next/link";
import { useState } from "react";
import FrakButton from "../components/button";
import Dropdown from "../components/dropdown";
import NFTItem from "../components/nft-item";
import Pagination from "../components/pagination";
import { FrakCard } from "../types";

const SORT_TYPES = ["Popular", "Ending Soonest", "Newly Listed"];

// TODO: hardcoded stuff as of now
const demoNFTItemsFull: FrakCard[] = Array.from({ length: 9 }).map(
  (_, index) => ({
    id: index + 1,
    name: "Golden Fries Cascade",
    imageURL: "/filler-image-1.png",
    contributions: BigNumber.from(5).div(100),
    createdAt: new Date().toISOString(),
    countdown: new Date("05-25-2021"),
  })
);

const demoNFTItemsEmpty = [];

export default function Home() {
  const [selectionMode, setSelectionMode] = useState(false);
  const [sortType, setSortType] = useState("Popular");

  const handleSortSelect = (item: string) => {
    setSortType(item);
    setSelectionMode(false);
  };

  return (
    <VStack spacing="0" mb="12.8rem">
      <Head>
        <title>Fraktal - Marketplace</title>
      </Head>
      <HStack w="96.4rem" spacing="0" justifyContent="space-between" mb="4rem">
        <Box position="relative" w={"110px"}>
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
        <Text className="semi-48">Marketplace</Text>
        <NextLink href="/list-nft">
          <FrakButton>List NFT</FrakButton>
        </NextLink>
      </HStack>
      {demoNFTItemsFull.length ? (
        <>
          <Grid
            margin="0 !important"
            mb="5.6rem !important"
            w="100%"
            templateColumns="repeat(3, 1fr)"
            gap="3.2rem"
          >
            {demoNFTItemsFull.map(item => (
              <NFTItem key={item.id} item={item} />
            ))}
          </Grid>
          <Pagination pageCount={21} handlePageClick={() => {}} />
        </>
      ) : (
        <VStack>
          <Text className="medium-16">Whoops, no NFTs are for sale.</Text>
          <Text className="medium-16">Check back later or list your own!</Text>
          <NextLink href="/mint-nft">
            <FrakButton mt="1.6rem !important">Mint NFT</FrakButton>
          </NextLink>
        </VStack>
      )}
    </VStack>
  );
}
