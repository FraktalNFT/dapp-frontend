import { Grid, Text, VStack, Heading, Spinner, Box } from "@chakra-ui/react";
import Head from "next/head";
import React, { useState, useEffect } from "react";
import styles from "./artist.module.css";
import styles_Search from "../../styles/artists.module.css";
import NFTItem from "../../components/nft-item";
import FrakButton from "../../components/button";
import NextLink from "next/link";
import { shortenHash, getParams } from "../../utils/helpers";
import { getSubgraphData } from "../../utils/graphQueries";
import { createObject2 } from "../../utils/nftHelpers";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { Image } from "@chakra-ui/image";

export default function ArtistView() {
  const router = useRouter();
  const [artistAddress, setArtistAddres] = useState("");
  const [nftItems, setNftItems] = useState([]);
  const [loading, setIsLoading] = useState<boolean>(false);
  const [artist_Address, setArtist_Address] = useState("");
  
  function searchHandle(e){
    e.preventDefault();
    if(e.target.value !== ""){
      setArtist_Address(e.target.value);
    }
  }

  useEffect(() => {
    async function getData() {
      const pathname = router.asPath;
      const args = pathname.split("/");
      const address = args[2];
      setIsLoading(true);
      toast("Fetching Data");
      try {
        if (address) {
          setArtistAddres(address);
          let objects = await getSubgraphData("creator", address);
          await Promise.all(
            objects.fraktalNfts.map(x => {
              return createObject2(x);
            })
          ).then(results => setNftItems(results));
          toast.success("Data fetched");
        }
      } catch (error) {
        console.error(error);
        toast.error("Fetch failed");
      } finally {
        setIsLoading(false);
      }
    }
    getData();
  }, [router.asPath]);

  return (
    <VStack spacing="0" mb="1rem" sx={{ alignItems: `start` }}>
      <Head>
        <title>Fraktal - Artist</title>
      </Head>
      <Heading sx={{ fontSize: `36px`, marginBottom: `1rem` }}>
        {artistAddress}
        <div className={styles_Search.searchContainer}>
          <input
            placeholder={"Search ENS or ETH address "}
            className={styles_Search.searchInput}
            onChange={searchHandle}
          />
          {
            artist_Address !=="" &&
              <NextLink
                      href={`/artist/${artist_Address}`}
                      key={`link--${artist_Address}`}
                    >
                <Image src="/search.svg" />
              </NextLink>
          }
          
        </div>
      </Heading>
      {!loading && nftItems.length > 0 && (
        <>
          <Grid
            margin="0 !important"
            mb="5.6rem !important"
            w="100%"
            templateColumns="repeat(3, 1fr)"
            gap="3.2rem"
          >
            {nftItems.map(item => {
              return (
                <NextLink href={`/nft/${item.id}/details`} key={item.marketId}>
                  <NFTItem
                    key={item.id}
                    name={item.name}
                    imageURL={item.imageURL}
                  />
                </NextLink>
              );
            })}
          </Grid>
        </>
      )}
      {!loading && nftItems == null && (
        <VStack>
          <Text className="medium-16">Whoops, no NFTs are for sale.</Text>
          <Text className="medium-16">Check back later or list your own!</Text>
          <NextLink href="/mint-nft">
            <FrakButton mt="1.6rem !important">Mint NFT</FrakButton>
          </NextLink>
        </VStack>
      )}
      {loading && (
        <Box
          sx={{
            display: `grid`,
            width: `80vw`,
            height: `200px`,
            placeItems: `center`,
          }}
        >
          <Spinner size="xl" />
        </Box>
      )}
    </VStack>
  );
}
