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

const Home: React.FC = () => {
  const [selectionMode, setSelectionMode] = useState(false);
  const [sortType, setSortType] = useState("Popular");
  const [nftItems, setNftItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const handleSortSelect = (item: string) => {
    setSortType(item);
    setSelectionMode(false);
  };

	useEffect(() => {
		async function getData() {
			setLoading(true);
			await getMoreListedItems();
			setLoading(false);
		}
		getData();
  	},[])


  const getMoreListedItems = async () => {
  // should read where to start (nftItems.length) and add some items continously
	  const data = await getSubgraphData('listed_items', '');
	  let dataOnSale = data.listItems.filter((item) => {
		  return item.fraktal.status == 'open'
	  });
	  // make sure you're pulling new subgraph data
	  let deduplicatedData = dataOnSale.filter(item => {
		  const nftMatch = nftItems.find(nft => nft.id === item.id)
		  if (typeof nftMatch === 'undefined') {
			  return true;
		  } else return false
	  })
	// end the array update if there's no new data
	if (typeof deduplicatedData[0] === 'undefined') {
		setHasMore(false);
  	}
    else {
		Promise.all(deduplicatedData.map((item) => {
			return createListed(item)
		})).then((results) => setNftItems([...nftItems, ...results]));
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
              <MenuItem onClick={() => handleSortSelect("Ending Soonest")}>Ending Soonest</MenuItem>
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
                {nftItems.map((item, index) => (
                  <NextLink key={`nft-link-${item.id}-${index}`} href={`/nft/${item.id}/fix-price-sale`}>
                  <NFTItem item={item} key={`nft-item-${item.id}-${index}`} />
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
