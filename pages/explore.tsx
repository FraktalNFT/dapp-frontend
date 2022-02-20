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

import { utils } from "ethers";
import { getSubgraphData, getSubgraphAuction } from "../utils/graphQueries";
import { createListed, createListedAuction } from "../utils/nftHelpers";

/**
 * Sorting
 */
const sortingOptions = [
  { prop: "price", dir: "asc", label: "Lowest Price"},
  { prop: "price", dir: "desc", label: "Highest Price"},
  { prop: "createdAt", dir: "desc", label: "Newly Listed"},
  { prop: "holders", dir: "desc", label: "Popular"},
]

/**
 * FRAKTAL Components
 */
import NFTItem from "../components/nft-item";
import NFTAuctionItem from "@/components/nft-auction-item";
import FrakButton from "../components/button";
import Anchor from '@/components/anchor';

const Marketplace: React.FC = () => {
  const [nftItems, setNftItems] = useState([]);
  const [listType, setListType] = useState("All Listings");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [sortingOptionId, setSortingOptionId] = useState(0)

  /**
  * Sort select handler
  * @param {string} type
  */
  useEffect(() => {
    const sortItems = (id: number) => {
      const {prop, dir} = sortingOptions[id]
      const items = [...nftItems].sort((a, b) => {
        if(a[prop] > b[prop]) return 1
        if(a[prop] < b[prop]) return -1
        return 0
      })
      if (dir === "desc") {
        items.reverse()
      }
      setNftItems(items)
    }

    sortItems(sortingOptionId)
  }, [sortingOptionId])

  /**
   * Filters
   */
  const hasNonZeroReservePrice = ({reservePrice}) => (!!reservePrice)

  const canSelfCheck = (thing, index, self) => (index === self.findIndex((t) => (
    JSON.stringify(t) === JSON.stringify(thing)
  )))

  const handleListingSelect = (item: string) => {
    setListType(item);
    changeList(item);
  };

  const changeList = type => {
    let sortedItems;
    if (type == "All Listings") {
      sortedItems = nftItems;
    } else if (type == "Fixed Price") {
      sortedItems = nftItems.filter((item) => !item.endTime);
    } else {
      sortedItems = nftItems.filter((item) => item.endTime);
    }
    setNftItems(sortedItems);
  };

  async function getData() {
    setLoading(true);
    await getMoreListedItems();
    setLoading(false);
  }

  useEffect(()=>{
    getMoreListedItems();
  },[])

  useEffect(() => {
    if (window.sessionStorage.getItem("nftitems")) {
      getData();
    }
  }, []);

  const getMoreListedItems = async () => {
    try {
      const NOW = Math.ceil(Date.now() / 1000);
      const { auctions = [] } = await getSubgraphAuction("auctions","");
    
      const activeAuctions = await Promise.all(auctions
        .filter(hasNonZeroReservePrice)
        .filter(x => Number(x.endTime) - NOW)
        .map(async auction => {
          let hash = await getSubgraphAuction("auctionsNFT", auction.tokenAddress);
          
          return createListedAuction({
            hash: hash.fraktalNft.hash,
            ...auction
          })
        }))

      // gets 100 nfts ordered by createdAt (desc)
      const { listItems } = await getSubgraphData("listed_items", "");
      // this goes in the graphql query
      const listings = (await Promise.all(listItems
        .filter(nft => (nft.fraktal.status == "open"))
        .map(nft => (createListed(nft)))
      )).filter(nft => nft != undefined)

      const allListings = activeAuctions.concat(listings);

      setHasMore(false);
      setNftItems(allListings);
    } catch (err) {
      console.error(err)
    }
  };

  // Store NFT Items in Session Storage
  useEffect(() => {
    const result = nftItems.filter(canSelfCheck);

    const stringedNFTItems = JSON.stringify(result);
    if(stringedNFTItems.length){
      window.sessionStorage.setItem("nftitems", stringedNFTItems);
    }
    
  }, [nftItems]);

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
              Sort: {sortingOptions[sortingOptionId].label}
            </MenuButton>
            <MenuList>
              {
                sortingOptions.map(({label}, idx) => (
                  <MenuItem 
                    key={`sort-${idx}`}  
                    onClick={() => setSortingOptionId(idx)}
                  >
                    {label}
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
            {nftItems.length > 0 && (
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
                            key={`${item.seller}-${item.sellerNonce}-${index}`}
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
                            key={`${item.seller}-${item.sellerNonce}-${index}`}
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
