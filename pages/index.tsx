import { gql, useQuery } from "@apollo/client";
import { Box, Grid, HStack, Text, VStack } from "@chakra-ui/layout";
import { BigNumber } from "ethers";
import Head from "next/head";
import NextLink from "next/link";
import { useState, useEffect } from "react";
import FrakButton from "../components/button";
import Dropdown from "../components/dropdown";
import NFTItem from "../components/nft-item";
import Pagination from "../components/pagination";
import { FrakCard } from "../types";

const { create, CID } = require('ipfs-http-client');
const SORT_TYPES = ["Popular", "Ending Soonest", "Newly Listed"];

const demoNFTItemsEmpty = [];

const Home: React.FC = () => {
  const [selectionMode, setSelectionMode] = useState(false);
  const [sortType, setSortType] = useState("Popular");
  const [ipfsNode, setIpfsNode] = useState();
  const [nftItems, setNftItems] = useState([]);
  const handleSortSelect = (item: string) => {
    setSortType(item);
    setSelectionMode(false);
  };
  useEffect(()=>{
    const ipfsClient = create({
      host: "ipfs.infura.io",
      port: "5001",
      protocol: "https",})
    setIpfsNode(ipfsClient)
  },[])

  const QUERY_GRAPHQL = `
  query {
    fraktalNFTs(first: 20) {
      id
      marketId
      hash
      createdAt
      creator {
        id
      }
    }
  }
  `;
  const QUERY_GQL = gql(QUERY_GRAPHQL);
  const { loading, data } = useQuery(QUERY_GQL, { pollInterval: 18000 });
  // console.log('data fetched: ', data);

  function toBase32(value) { // to transform V0 to V1 and use as `https://${cidV1}.ipfs.dweb.link`
    var cid = new CID(value)
    return cid.toV1().toBaseEncodedString('base32')
  }

  function checkImageCID(cid){
    let correctedCid
    if(cid.startsWith('https://ipfs.io/ipfs/')){
      let splitted = cid.split('https://ipfs.io/ipfs/')
      correctedCid = splitted[1]
    }else{
      correctedCid = cid
    }
    let cidv1 = toBase32(correctedCid)
    return `https://${cidv1}.ipfs.dweb.link`
  }

// Convert Binary Into JSON
  const binArrayToJson = function(binArray)
  {
      var str = "";
      for (var i = 0; i < binArray.length; i++) {
          str += String.fromCharCode(parseInt(binArray[i]));
      }
      return JSON.parse(str)
  }
  async function fetchNft(hash){
    let chunks
    for await (const chunk of ipfsNode.cat(hash)) {
        chunks = binArrayToJson(chunk);
    }
    // console.log('NFT metadata: ',chunks)
    return chunks;
  }

  async function createObject(data){
    let nftMetadata = await fetchNft(data.hash)
    if(nftMetadata){
      // console.log('meta',nftMetadata)
      return {
        id: data.marketId,
        name: nftMetadata.name,
        imageURL: checkImageCID(nftMetadata.image),
        createdAt: data.createdAt,
      }
    }
  }

  useEffect(async ()=>{
    if(data && ipfsNode){
      Promise.all(data.fraktalNFTs.map(x=>{return createObject(x)})).then((results)=>setNftItems(results))
    }
  },[data])
  // TODO: hardcoded stuff as of now
  const demoNFTItemsFull: FrakCard[] = Array.from({ length: 9 }).map(
    (_, index) => ({
      id: index + 1,
      name: "Golden Fries Cascade",
      imageURL: "/filler-image-1.png",
      contributions: BigNumber.from(5).div(100),
      createdAt: new Date().toISOString(),
      countdown: new Date("06-25-2021"),
    })
  );

  return (
    <VStack spacing='0' mb='12.8rem'>
      <Head>
        <title>Fraktal - Marketplace</title>
      </Head>
      <HStack w='96.4rem' spacing='0' justifyContent='space-between' mb='4rem'>
        <Box position='relative' w={"110px"}>
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
        <Text className='semi-48'>Marketplace</Text>
        <NextLink href='/list-nft'>
          <FrakButton>List NFT</FrakButton>
        </NextLink>
      </HStack>

      {nftItems.length ? (
        <>
          <Grid
            margin='0 !important'
            mb='5.6rem !important'
            w='100%'
            templateColumns='repeat(3, 1fr)'
            gap='3.2rem'
          >
            {nftItems.map(item => (
              <NextLink key={item.id} href={`/nft/${item.id}/auction`}>
                <NFTItem item={item} />
              </NextLink>
            ))}
          </Grid>
          <Pagination pageCount={21} handlePageClick={() => {}} />
        </>
      ) : (
        <VStack>
          <Text className='medium-16'>Whoops, no NFTs are for sale.</Text>
          <Text className='medium-16'>Check back later or list your own!</Text>
          <NextLink href='/mint-nft'>
            <FrakButton mt='1.6rem !important'>Mint NFT</FrakButton>
          </NextLink>
        </VStack>
      )}
    </VStack>
  );
};

export default Home;
