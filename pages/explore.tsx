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
import { BigNumber, utils } from "ethers";
import Head from "next/head";
import NextLink from "next/link";
import { useState, useEffect } from "react";
import FrakButton from "../components/button";
import NFTItem from "../components/nft-item";
import { FrakCard } from "../types";
import { getSubgraphData, getSubgraphAuction } from "../utils/graphQueries";
import { createListed,createListedAuction } from "../utils/nftHelpers";
import { FiChevronDown } from "react-icons/fi";
import InfiniteScroll from "react-infinite-scroll-component";
import NFTAuctionItem from "@/components/nft-auction-item";
const LOWEST_PRICE = "Lowest Price";
const HIGHEST_PRICE = "Highest Price";
const NEWLY_LISTED = "Newly Listed";
const POPULAR = "Popular";
const SORT_TYPES = [LOWEST_PRICE, HIGHEST_PRICE, NEWLY_LISTED, POPULAR];
import Anchor from '@/components/anchor';

const Marketplace: React.FC = () => {
  const [nftItems, setNftItems] = useState([]);
  const [nftData,setNftData] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [sortType, setSortType] = useState(POPULAR);
  const [listType, setListType] = useState("All Listings");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [auctions, setAuctions] = useState({});
  const [refresh,setRefresh] = useState(false);

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

  },[refresh])

  useEffect(()=>{
    setRefresh(!refresh);
    
  },[nftItems]);

  const changeOrder = type => {
    let sortedItems;

    if (type === LOWEST_PRICE) {
      sortedItems = nftItems.sort((a, b) =>
        a.price > b.price ? 1 : -1
      );
    } else if (type === HIGHEST_PRICE) {
      sortedItems = nftItems.sort((a, b) =>
          a.price > b.price ? -1 : 1
      );
    } else if (type == NEWLY_LISTED) {
        sortedItems = nftItems.sort((a, b) =>
            a.createdAt > b.createdAt ? -1 : 1
        );
    } else {
        sortedItems = nftItems.sort((a, b) => (a.holders > b.holders ? -1 : 1));
    }
    setNftItems(sortedItems);
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
    } else if (type == "Fixed Price") {
      sortedItems = nftData.filter((item) => !item.endTime);
    } else {
      sortedItems = nftData.filter((item) => item.endTime>0);
    }
    setNftItems(sortedItems);
  };

  async function getData() {
    setLoading(true);
    await getMoreListedItems(auctions);
    setLoading(false);
  }

  useEffect(()=>{
    getMoreListedItems(auctions);
  },[auctions])

  useEffect(() => {
    // TODO - WHAT?
    if (window?.sessionStorage.getItem("nftitems")) {
      // const stringedNFTItems = window?.sessionStorage.getItem("nftitems");
      // const unstringedNFTItems = JSON.parse(stringedNFTItems);
      // const auctionOnly = unstringedNFTItems.filter(item=>item.endTime);
      
      
      // setNftItems(unstringedNFTItems);
      // setNftData(unstringedNFTItems);
      // setAuctions(auctionOnly);
      getData();
    } else {

      // touch API iff no local version
      getData();
    }
    // data storage handling
    // const clearStorage = () => {
    //   window.sessionStorage.clear();
    // };
    // window?.addEventListener("beforeunload", clearStorage);
    // return () => window.removeEventListener("beforeunload", clearStorage);
  }, []);

  const getMoreListedItems = async (auctionsObject:Object) => {
    const data = await getSubgraphData("listed_items", "");
    let auctionData = await getSubgraphAuction("auctions","");
    
    auctionData = auctionData?.auctions.filter(x=>x.reservePrice!=0);
    
    auctionData = auctionData?.filter(x=>{
      const curTimestamp = Math.round(Date.now()/1000);
      
      return Number(x.endTime)>curTimestamp;
    });
    
    
    let auctionDataHash = [];
    await Promise.all(auctionData?.map(async x=>{
      let _hash = await getSubgraphAuction("auctionsNFT",x.tokenAddress);

      const itm = {
        "id":`${x.tokenAddress}-${x.sellerNonce}`,
        "hash":_hash.fraktalNft.hash
    };
      
      auctionDataHash.push(itm);
    }));
    

    let auctionItems = [];
    await Promise.all(auctionData?.map(async (auction,idx)=>{
      let hash = auctionDataHash.filter(e=>e.id==`${auction.tokenAddress}-${auction.sellerNonce}`);
      
      
      Object.assign(auction,{"hash":hash[0].hash});
      const item = await createListedAuction(auction);
      
      auctionItems.push(item);
      }
    ));

    const result = auctionItems.filter((thing, index, self) =>
      index === self.findIndex((t) => (
        JSON.stringify(t) === JSON.stringify(thing)
      ))
    )
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
        // const newArray = [...auctionItems, ...nftItems, ...deduplicatedObjects];
        newArray = [...auctionItems, ...nftItems, ...deduplicatedObjects];
        // setNftItems(newItemList);
        
      }

      setNftData(newArray);
      setNftItems(newArray);
      setHasMore(false);
      
      // handleSortSelect(sortType);
      // handleListingSelect(listType);

    }else{
      //TODO - REMOVE THIS ELSE
    }
  };

  // Store NFT Items in Session Storage
  useEffect(() => {

    const result = nftData.filter((thing, index, self) =>
      index === self.findIndex((t) => (
        JSON.stringify(t) === JSON.stringify(thing)
      ))
    );

    const stringedNFTItems = JSON.stringify(result);
    if(stringedNFTItems.length>0){
      window?.sessionStorage?.setItem("nftitems", stringedNFTItems);
    }
    
  }, [nftItems,nftData]);

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
              <MenuItem onClick={() => handleListingSelect("All Listings")}>
                All Listings
              </MenuItem>
              <MenuItem onClick={() => handleListingSelect("Fixed Price")}>
                Fixed Price
              </MenuItem>
              <MenuItem onClick={() => handleListingSelect("Auctions")}>
                Auctions
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
          <Box
            sx={{
              width: `100%`,
              height: `35rem`,
              display: `grid`,
              placeItems: `center`,
            }}
          >
            <Spinner size="xl" />
          </Box>
        )}
        {!loading && (
          <div>
            {nftItems?.length > 0 && (
              <>
                <InfiniteScroll
                  dataLength={nftItems.length}
                  next={getMoreListedItems}
                  hasMore={hasMore}
                  loader={<h3> Loading...</h3>}
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
                      }else{
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

export default Marketplace;
