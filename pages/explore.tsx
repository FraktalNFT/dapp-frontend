/**
 * Chakra UI
 */
import { useState, useEffect } from "react";
import { Flex, Grid, Spacer, Text, VStack } from "@chakra-ui/layout";
import {
  MenuButton,
  Menu,
  Button,
  MenuList,
  MenuItem,
  Box,
  Spinner,
} from "@chakra-ui/react";

/**
 * Next
 */
import Head from "next/head";
import NextLink from "next/link";
/**
 * Icons
 */
import { FiChevronDown } from "react-icons/fi";
import InfiniteScroll from "react-infinite-scroll-component";

/**
 * Utils
 */

import { FrakCard } from "../types";
import { BigNumber, utils } from "ethers";
import { getSubgraphData, getSubgraphAuction } from "../utils/graphQueries";
import { createListed,createListedAuction } from "../utils/nftHelpers";
/**
 * Filters
 * @type {string}
 */
const LOWEST_PRICE = "Lowest Price";
const HIGHEST_PRICE = "Highest Price";
const NEWLY_LISTED = "Newly Listed";
const POPULAR = "Popular";
const AUCTIONS_TYPE = 'Auction';
const FIXED_PRICE_TYPE = "Fixed Price";
const DEFAULT_TYPE = "All Listings";
//const SORT_TYPES = [LOWEST_PRICE, HIGHEST_PRICE, NEWLY_LISTED, POPULAR];
const SORT_TYPES = [LOWEST_PRICE, HIGHEST_PRICE];
/**
 * FRAKTAL Components
 */
import NFTItem from "../components/nft-item";
import NFTAuctionItem from "@/components/nft-auction-item";
import FrakButton from "../components/button";
import Anchor from '@/components/anchor';

const Marketplace: React.FC = () => {
  const [nftItems, setNftItems] = useState([]);
  const [nftData, setNftData] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [sortType, setSortType] = useState(HIGHEST_PRICE);
  const [listType, setListType] = useState(DEFAULT_TYPE);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [auctions, setAuctions] = useState({});
  const [refresh, setRefresh] = useState(false);
  const [limit, setLimit] = useState(15);
  const [offset, setOffset] = useState(0);
  const [totalNFT, setTotalNFT] = useState([]);
  const [orderDirection, setOrderDirection] = useState('asc');

  /**
  *
  * @param {string} item
  */
  const handleSortSelect = (item: string) => {
    setSelectionMode(false);
    setSortType(item);
    changeOrder(item);
  };

  useEffect(()=>{
    if (refresh === true) {
        setHasMore(false);
        setLoading(true);
        getData();
    }
  }, [refresh]);


  useEffect(() => {
     setLoading(true);
     getData();
  }, []);

  const getMoreListedItems = async () => {
    getData();
  };

    // Store NFT Items in Session Storage
    useEffect(() => {
        /*
            const result = nftData.filter((thing, index, self) =>
              index === self.findIndex((t) => (
                JSON.stringify(t) === JSON.stringify(thing)
              ))
            );

            const stringedNFTItems = JSON.stringify(result);
            if(stringedNFTItems.length>0){
              window?.sessionStorage?.setItem("nftitems", stringedNFTItems);
            }
        */
    }, [nftItems, nftData]);

  const changeOrder = type => {
    let sortedItems;
    if (type === LOWEST_PRICE) {
        setOrderDirection('asc');
        setOffset(0);
        setNftData([]);
        setNftItems([]);
        setRefresh(true);
      console.log('LOWEST')
    /*  sortedItems = nftItems.sort((a, b) =>
        a.price > b.price ? 1 : -1
      );*/
    } else if (type === HIGHEST_PRICE) {
      setOrderDirection('desc');
      setOffset(0);
      setNftData([]);
      setNftItems([]);
      setRefresh(true);
        console.log('HIGH')
    /*  sortedItems = nftItems.sort((a, b) =>
          a.price > b.price ? -1 : 1
      );*/
    } else if (type == NEWLY_LISTED) {
        sortedItems = nftItems.sort((a, b) =>
            a.createdAt > b.createdAt ? -1 : 1
        );
    } else {
        sortedItems = nftItems.sort((a, b) => (a.holders > b.holders ? -1 : 1));
    }
   // setNftItems(sortedItems);
  };

  const handleListingSelect = (item: string) => {
    setSelectionMode(false);
    setListType(item);
    changeList(item);
  };

  const changeList = type => {
    let sortedItems;
    if (type == "All Listings") {
      sortedItems = nftData;
    } else if (type == FIXED_PRICE_TYPE) {
      sortedItems = nftData.filter((item) => !item.endTime);
    } else {
      sortedItems = nftData.filter((item) => item.endTime>0);
    }
    setNftItems(sortedItems);
  };

  async function mapAuctionToFraktal(auctionData) {
      let auctionDataHash = [];
      await Promise.all(auctionData?.auctions.map(async x => {
          let _hash = await getSubgraphAuction("auctionsNFT", x.tokenAddress);

          const itm = {
              "id":`${x.tokenAddress}-${x.sellerNonce}`,
              "hash":_hash.fraktalNft.hash
          };

          auctionDataHash.push(itm);
      }));
      let auctionItems = [];
      await Promise.all(auctionData?.auctions.map(async (auction, idx) => {
              let hash = auctionDataHash.filter(e=>e.id == `${auction.tokenAddress}-${auction.sellerNonce}`);
              Object.assign(auction, {"hash":hash[0].hash});
              const item = await createListedAuction(auction);
              auctionItems.push(item);
          }
      ));
      return auctionItems;
  }

  async function getData() {
      console.log('OTRA VEZ')
    const listedData = await getSubgraphData("limited_items", "", {
        limit: limit,
        offset: offset,
        orderDirection: orderDirection
    });
    //TODO - Get the server timestamp
    const curTimestamp = Math.round(Date.now() / 1000);
    let auctionData = await getSubgraphAuction("auctions", "", {
        limit: limit,
        offset: offset,
        endTime: curTimestamp,
        orderDirection: orderDirection
    });
    console.log('auction', auctionData)
    if (listedData?.listItems?.length == 0 && auctionData.auctions.length == 0) {
        setHasMore(false);
        return;
    }

    const auctionItems = await mapAuctionToFraktal(auctionData);

    let dataOnSale;
    if (listedData?.listItems?.length != undefined) {
      dataOnSale = listedData?.listItems?.filter(x => {
        return x.fraktal.status == "open";
      }); // this goes in the graphql query
    }

    if (dataOnSale?.length >= 0) {
        let objects = await Promise.all(
        dataOnSale.map(x => {
        let res = createListed(x);
          if (typeof res !== "undefined") {
            return res;
          }
      })
     );

     let nfts;
        nfts = [...auctionItems, ...nftItems, ...objects];
     if (listType == FIXED_PRICE_TYPE) {
         setNftItems([...nftItems, ...objects]);
     } else if (listType == AUCTIONS_TYPE) {
         setNftItems([...nftItems, ...auctionItems]);
     } else {
         setNftItems(nfts);
     }

      setNftData(nfts);
      console.log('nftitems', nfts)
      setOffset(offset+limit);
      setLoading(false);
      setHasMore(true);
      setRefresh(false);
     }

    //console.log(orderByHolders(listedData));
    //let auctionData = await getSubgraphAuction("auctions", "");
    //auctionData = getAuctionData(auctionData);
  //  console.log('auctions', auctionData);
  //  setTotalNFT([...listedData.listItems, ...auctionData]);
   // await getMoreListedItems(auctions);
  }

  const orderByHolders = (listedData) => {
      listedData.listItems.sort((a, b) => (a.fraktal.fraktions.length > b.fraktal.fraktions.length ? -1 : 1));
      return listedData;
  };

  const getMoreListedItemsOld = async (auctionsObject:Object) => {
    console.log("Triggered")

   // const data = await getSubgraphData("limited_items", "", 15);
    const data = await getSubgraphData("listed_items", "", 15);
    let auctionData = await getSubgraphAuction("auctions","");
    
    auctionData = auctionData?.auctions.filter(x=>x.reservePrice!=0);
    
    auctionData = auctionData?.filter(x=>{
      const curTimestamp = Math.round(Date.now()/1000);
      return Number(x.endTime) > curTimestamp;
    });
    
    
    let auctionDataHash = [];
    await Promise.all(auctionData?.map(async x=>{
      let _hash = await getSubgraphAuction("auctionsNFT", x.tokenAddress);

      const itm = {
        "id":`${x.tokenAddress}-${x.sellerNonce}`,
        "hash":_hash.fraktalNft.hash
      };
      
      auctionDataHash.push(itm);
    }));
    

    let auctionItems = [];
    await Promise.all(auctionData?.map(async (auction, idx) => {
      let hash = auctionDataHash.filter(e=>e.id == `${auction.tokenAddress}-${auction.sellerNonce}`);

      Object.assign(auction, {"hash":hash[0].hash});
      const item = await createListedAuction(auction);
      
      auctionItems.push(item);
      }
    ));

    const result = auctionItems.filter((thing, index, self) =>
      index === self.findIndex((t) => (
        JSON.stringify(t) === JSON.stringify(thing)
      ))
    );
    auctionItems = result;
    

    // if(JSON.stringify(auctionItems)==JSON.stringify(auctionsObject)){
    //   console.log("no changes");
      
    //   return;
    // }
    let dataOnSale;
    if (data?.listItems?.length != undefined) {
      dataOnSale = data?.listItems?.filter(x => {
        return x.fraktal.status == "open";
      }); // this goes in the graphql query
      
    }

    let newArray;
    
    if (dataOnSale?.length >= 0) {
      let objects = await Promise.all(
        dataOnSale.map(x => {
          let res = createListed(x);
          if (typeof res !== "undefined") {
            return res;
          }
        })
      ); //.then((results)=>setNftItems([...nftItems, ...results]));
      let deduplicatedObjects = objects.filter(item => {
        const objectMatch = nftItems.find(nft => nft.id === item.id);
        if (typeof objectMatch === "undefined") {
          return true;
        } else return false;
      });
      
      if (typeof deduplicatedObjects[0] === "undefined") {
        newArray = [...auctionItems, ...nftItems, ...deduplicatedObjects];
        setHasMore(false);
      } else {
        newArray = [...auctionItems, ...nftItems, ...deduplicatedObjects];
      }

      setNftData(newArray);
      setNftItems(newArray);
      setHasMore(true);
      //console.log('total NFT', newArray)

    } else{
      //TODO - REMOVE THIS ELSE
    }
  };


  return (
    <>
      <Head>
        <title>Fraktal - Marketplace</title>
      </Head>
      <VStack spacing="0" mb="12.8rem">
        <Flex w="96.4rem">
          <Text className="semi-48" marginEnd="2rem">
            Marketplace
          </Text>
          <Menu closeOnSelect={true}>
            <MenuButton
              as={Button}
              alignSelf="center"
              fontSize="12"
              bg="transparent"
              height="5rem"
              width="18rem"
              rightIcon={<FiChevronDown />}
              fontWeight="bold"
              transition="all 0.2s"
            >
              Sort: {sortType}
            </MenuButton>
            <MenuList>
                {
                    SORT_TYPES.map((sortType) => (
                        <MenuItem onClick={() => handleSortSelect(sortType)}>
                            {sortType}
                        </MenuItem>
                    ))
                }
            </MenuList>
          </Menu>
          <Menu closeOnSelect={true}  >
            <MenuButton
              as={Button}
              alignSelf="center"
              fontSize="12"
              bg="transparent"
              height="5rem"
              width="18rem"
              rightIcon={<FiChevronDown />}
              fontWeight="bold"
              transition="all 0.2s"
            >
              Listing: {listType}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => handleListingSelect(DEFAULT_TYPE)}>
                {DEFAULT_TYPE}
              </MenuItem>
              <MenuItem onClick={() => handleListingSelect(FIXED_PRICE_TYPE)}>
                {FIXED_PRICE_TYPE}
              </MenuItem>
              <MenuItem onClick={() => handleListingSelect(AUCTIONS_TYPE)}>
                {AUCTIONS_TYPE}
              </MenuItem>
            </MenuList>
          </Menu>
          <Spacer />
          <Box sx={{ display: `flex`, gap: `16px` }}>
          
            <NextLink href="/my-nfts#yourFraktions">
              <FrakButton>Sell Fraktions</FrakButton>
            </NextLink>
          </Box>
        </Flex>
        {loading && (
          <Loading/>
        )}
        {!loading && (
          <div>
            {nftItems?.length > 0 && (
              <>
                <InfiniteScroll
                  dataLength={nftItems?.length}
                  next={getMoreListedItems}
                  hasMore={hasMore}
                  loader={<Loading/>}
                  endMessage={<h4>Nothing more to show</h4>}
                >
                  <Grid
                    margin="0 !important"
                    mb="5.6rem !important"
                    w="100%"
                    templateColumns="repeat(3, 1fr)"
                    gap="3.2rem"
                  >
                    {nftItems.map((item, index) => {
                      <div>{item.name}</div>
                      if(item.endTime){//for auction
                        return (
                          <Anchor
                            key={`${item.seller}-${item.sellerNonce}`}
                            href={`/nft/${item.seller}-${item.sellerNonce}/auction`}
                          >
                            <NFTAuctionItem
                              name={item.name}
                              amount={utils.formatEther(item.amountOfShare)}
                              imageURL={item.imageURL}
                              endTime={item.endTime}
                              item={item}
                            />
                          </Anchor>
                          )
                      } else {
                        return (
                          <Anchor
                            key={item.id}
                            href={`/nft/${item.tokenAddress}/details`}
                          >
                            <NFTItem
                              name={item.name}
                              amount={item.amount}
                              price={item.price}
                              imageURL={item.imageURL}
                              wait={250 * (index + 1)}
                              item={null}
                            />
                          </Anchor>
                          )
                      }
                      
                    })}
                  </Grid>
                </InfiniteScroll>
              </>
            )}
            {nftItems?.length <= 0 && (
              <VStack>
                <Text className="medium-16">Whoops, no NFTs are for sale.</Text>
                <Text className="medium-16">
                  Check back later or list your own!
                </Text>
                <NextLink href="/mint-nft">
                  <FrakButton mt="1.6rem !important">Mint NFT</FrakButton>
                </NextLink>
              </VStack>
            )}
          </div>
        )}
      </VStack>
    </>
  );
};

const Loading = () => {

    return (<Box
        sx={{
            width: `100%`,
            height: `35rem`,
            display: `grid`,
            placeItems: `center`,
        }}
    >
        <Spinner size="xl" />
    </Box>)
};

export default Marketplace;
