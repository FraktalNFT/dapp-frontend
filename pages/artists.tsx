import { Box, Grid, HStack, VStack, Text } from "@chakra-ui/layout";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { FrakCard } from "../types";
import { BigNumber } from "ethers";
import NextLink from "next/link";
import NFTItem from "../components/nft-item";
import Dropdown from "../components/dropdown";
import FrakButton from "../components/button";
import Pagination from "../components/pagination";
import styles from "../styles/artists.module.css";
import { Image } from "@chakra-ui/image";
import { shortenHash } from "../utils/helpers";
import { getAccountFraktalNFTs, createObject, getNFTobject } from '../utils/graphQueries';

export default function ArtistsView() {
  const SORT_TYPES = ["Popular", "New"];
  const [selectionMode, setSelectionMode] = useState(false);
  const [sortType, setSortType] = useState("Popular");
  const [artists, setArtists] = useState([]);
  const [fraktalItems, setFraktalItems] = useState();
  const [nftItems, setNftItems] = useState([]);
  const [artistsItems, setArtistsItems] = useState([]);

  const handleSortSelect = (item: string) => {
    setSortType(item);
    setSelectionMode(false);
  };

  useEffect(()=>{
    if(!fraktalItems){
      const data = getAccountFraktalNFTs('artists','')
      let fraktalsSamples
      data.then((d)=>{
        setArtists(d.users)
        fraktalsSamples = d.users.map(x=>{return x.fraktals[0]})
        Promise.all(fraktalsSamples.map(x=>{return getAccountFraktalNFTs('id_fraktal', x)}))
          .then((results)=>setFraktalItems(results.map(y=>{return y.fraktalNFTs[0]})))//
      })
    }else{
      Promise.all(fraktalItems.map(x=>{return createObject(x)})).then((results)=>setNftItems(results))
    }
  },[fraktalItems])

  useEffect(()=>{
    if(nftItems.length){
      let artistsObj = artists.map((x,i)=>({
        id: x.id,
        name: shortenHash(x.id),
        imageURL: nftItems[i].imageURL,
        totalGallery:x.fraktals.length,
      }))
      setArtistsItems(artistsObj)
    }
  },[nftItems])

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
    <VStack spacing='0' mb='12.8rem'>
      <Head>
        <title>Fraktal - Artists</title>
      </Head>
      <HStack w='96.4rem' spacing='0' justifyContent='space-between' mb='4rem'>
        <Box position='relative' w={"280px"}>
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
              position='absolute'
              mt='-3rem'
              zIndex='1'
            />
          )}
        </Box>
        <Text className='semi-48'>Artists</Text>
        <div className={styles.searchContainer}>
          <input
            placeholder={"Search ENS or ETH address "}
            className={styles.searchInput}
          />
          <Image src='/search.svg' />
        </div>
      </HStack>
      {/*artists[i].fraktals.length*/}
      <Grid
        margin='0 !important'
        mb='5.6rem !important'
        w='100%'
        templateColumns='repeat(3, 1fr)'
        gap='3.2rem'
      >
        {artistsItems.map((item, i) => (
          <NextLink href={`/artist/${item.id}`}>
            <NFTItem key={artists[i].id} item={item} CTAText={item.totalGallery} />
          </NextLink>
        ))}
      </Grid>
      <Pagination pageCount={21} handlePageClick={() => {}} />
    </VStack>
  );
}
