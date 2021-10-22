import { Flex, Grid, Spacer, Text, VStack } from "@chakra-ui/layout";
import { MenuButton, Menu, Button, MenuList, MenuItem } from "@chakra-ui/react";
import { BigNumber } from "ethers";
import Head from "next/head";
import NextLink from "next/link";
import { useState, useEffect } from "react";
import FrakButton from "../components/button";
import NFTItem from "../components/nft-item";
import { FrakCard } from "../types";
import { getSubgraphData } from '../utils/graphQueries';
import { createListed } from '../utils/nftHelpers';
import { FiChevronDown } from 'react-icons/fi';
import InfiniteScroll from "react-infinite-scroll-component";
const SORT_TYPES = ["Availability","Popular", "Newly Listed"];

const Home: React.FC = () => {
  const [nftItems, setNftItems] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [sortType, setSortType] = useState("Newly Listed");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const handleSortSelect = (item: string) => {
    setSortType(item);
    changeOrder(item);
    setSelectionMode(false);
  };

  const changeOrder = (type) => {
    let sortedItems;
    if(type == 'Availability'){
      sortedItems = nftItems.sort((a, b) => (parseInt(a.amount) > parseInt(b.amount)) ? -1 : 1);
    }else if(type == 'Popular'){
      sortedItems = nftItems.sort((a, b) => (a.holders > b.holders) ? -1 : 1);
    }else {
      sortedItems = nftItems.sort((a, b) => (a.createdAt > b.createdAt) ? -1 : 1);
    }
    setNftItems(sortedItems)
  }

	useEffect(() => {
		async function getData() {
			setLoading(true);
			await getMoreListedItems();
			setLoading(false);
		}
		getData();
  	},[])

  const getMoreListedItems = async () => {
    const data = await getSubgraphData('listed_items','');
    let dataOnSale = data.listItems.filter(x=>{return x.fraktal.status == 'open'}); // this goes in the graphql query
    if(dataOnSale){
      // console.log('dataOnSale', dataOnSale)
      let objects = await Promise.all(dataOnSale.map(x=>{return createListed(x)}))//.then((results)=>setNftItems([...nftItems, ...results]));
      let deduplicatedObjects = objects.filter(item => {
				const objectMatch = nftItems.find(nft => nft.id === item.id)
				if (typeof objectMatch === 'undefined') {
					return true;
				} else return false
			})
			if (typeof deduplicatedObjects[0] === 'undefined') {
				setHasMore(false);
			} else {
				const newArray = [...nftItems, ...deduplicatedObjects];
				setNftItems(newArray);
			}
    }
  };

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
	<>
	<Head>
	<title>Fraktal - Marketplace</title>
	</Head>
    <VStack spacing='0' mb='12.8rem'>
      <Flex w='96.4rem'>
        <Text className='semi-48' marginEnd="2rem">Marketplace</Text>
        <Menu>
            <MenuButton
              as={Button} alignSelf="center" fontSize="12" bg="transparent" height="5rem" width="18rem" rightIcon={<FiChevronDown/>} fontWeight="bold"
              transition="all 0.2s">
            Sort: {sortType}
          </MenuButton>
            <MenuList>
              <MenuItem onClick={() => handleSortSelect("Popular")}>Popular</MenuItem>
              <MenuItem onClick={() => handleSortSelect("Availability")}>Availability</MenuItem>
              <MenuItem onClick={() => handleSortSelect("Newly Listed")}>Newly Listed</MenuItem>
            </MenuList>
       </Menu>
        <Spacer/>
        <NextLink href='/my-nfts'>
          <FrakButton>List NFT</FrakButton>
        </NextLink>
      </Flex>
        {loading ? 'loading..' :
        <div>
        {nftItems.length ? (
          <>
            <InfiniteScroll
              dataLength={nftItems.length}
              next={getMoreListedItems}
              hasMore={hasMore}
              loader={<h3> Loading...</h3>}
              endMessage={<h4>Nothing more to show</h4>}
            >
              <Grid
                margin='0 !important'
                mb='5.6rem !important'
                w='100%'
                templateColumns='repeat(3, 1fr)'
                gap='3.2rem'
              >
                {nftItems.map(item => (
                  <NextLink key={item.id} href={`/nft/${item.tokenAddress}/details`}>
                    <NFTItem
                      name={item.name}
                      amount={item.amount}
                      price={item.price}
                      imageURL={item.imageURL}
                     />
                  </NextLink>
                ))}
              </Grid>
            </InfiniteScroll>
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
      </div>
      }
    </VStack>
	</>
  );
};

export default Home;
