import { Grid, Text, VStack } from "@chakra-ui/layout";
import Head from "next/head";
import React, {useState, useEffect} from "react";
import { FrakCard } from "../../types";
import styles from "./artist.module.css";
import { BigNumber } from "ethers";
import NFTItem from "../../components/nft-item";
import FrakButton from "../../components/button";
import NextLink from "next/link";
import {shortenHash} from '../../utils/helpers';
import {getAccountFraktalNFTs, createObject, getNFTobject} from '../../utils/graphQueries';

export default function ArtistView() {
  const [artistAddress, setArtistAddres] = useState('');
  const [nftItems, setNftItems] = useState([]);
  useEffect(async()=>{
    let address = window.location.href.split('http://localhost:3000/artist/');
    setArtistAddres(address[1])
    let objects = await getAccountFraktalNFTs('creator',address[1])
    Promise.all(objects.fraktalNFTs.map(x=>{return createObject(x)})).then((results)=>setNftItems(results))
  },[])

  const demoNFTItemsFull: FrakCard[] = Array.from({ length: 3 }).map(
    (_, index) => ({
      id: index + 1,
      name: "Golden Fries Cascade",
      imageURL: "/filler-image-1.png",
      contributions: BigNumber.from(5).div(100),
      createdAt: new Date().toISOString(),
      countdown: new Date("06-25-2021"),
    })
  );
  const minAddress = (artistAddress) => shortenHash(artistAddress);
  return (
    <VStack spacing="0" mb="12.8rem">
      <Head>
        <title>Fraktal - Artist</title>
      </Head>
      <div className={styles.header}>{minAddress(artistAddress)}</div>
      {nftItems.length ? (
        <>
          <Grid
            margin="0 !important"
            mb="5.6rem !important"
            w="100%"
            templateColumns="repeat(3, 1fr)"
            gap="3.2rem"
          >
            {nftItems.map(item => (
              <NextLink href={`/nft/${item.id}/closed`}>
                <NFTItem key={item.id} item={item} CTAText="See More" />
              </NextLink>
            ))}
          </Grid>
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
