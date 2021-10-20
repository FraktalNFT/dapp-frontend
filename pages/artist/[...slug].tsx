import { Grid, Text, VStack } from "@chakra-ui/layout";
import Head from "next/head";
import React, {useState, useEffect} from "react";
import styles from "./artist.module.css";
import NFTItem from "../../components/nft-item";
import FrakButton from "../../components/button";
import NextLink from "next/link";
import {shortenHash, getParams} from '../../utils/helpers';
import {getSubgraphData } from '../../utils/graphQueries';
import { createObject2 } from '../../utils/nftHelpers';

export default function ArtistView() {
  const [artistAddress, setArtistAddres] = useState('');
  const [nftItems, setNftItems] = useState([]);

  useEffect(async()=>{
    let address = getParams('artist');
    if(address){
      setArtistAddres(address)
      let objects = await getSubgraphData('creator',address)
      Promise.all(objects.fraktalNfts.map(x=>{return createObject2(x)})).then((results)=>setNftItems(results))
    }
  },[])

  return (
    <VStack spacing="0" mb="12.8rem">
      <Head>
        <title>Fraktal - Artist</title>
      </Head>
      <div className={styles.header}>{shortenHash(artistAddress)}</div>
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
              <NextLink href={`/nft/${item.id}/details`} key={item.marketId}>
                <NFTItem key={item.id} name={item.name} imageURL={item.imageURL} />
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
