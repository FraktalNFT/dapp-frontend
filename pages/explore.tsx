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
import { getSubgraphData } from "../utils/graphQueries";
import { createListed,createListedAuction } from "../utils/nftHelpers";

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
 * Filters
 * @type {string}
 */
const listingOptions = [
  { label: "All Listings", filter: (item) => true},
  { label: "Auctions", filter: (item) => item.hasOwnProperty("end")},
  { label: "Fixed Price", filter: (item) => !item.hasOwnProperty("end")},
]

const hasNonZeroReservePrice = ({reservePrice}) => (!!reservePrice)

const canSelfCheck = (thing, index, self) => (index === self.findIndex((t) => (
  JSON.stringify(t) === JSON.stringify(thing)
)))

/**
 * FRAKTAL Components
 */
import NFTItem from "../components/nft-item";
import NFTAuctionItem from "@/components/nft-auction-item";
import FrakButton from "../components/button";
import Anchor from '@/components/anchor';
import {MINT_NFT} from "@/constants/routes";

const Marketplace: React.FC = () => {
  const [nftItems, setNftItems] = useState([])
  const [sortingOptionId, setSortingOptionId] = useState(0)
  const [listingOptionId, setListingOptionId] = useState(0)
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  // Pagination
  // const [limit, setLimit] = useState(15)
  // const [offset, setOffset] = useState(0)
  // const [orderDirection, setOrderDirection] = useState("desc")

   /**
  * Sort select handler
  * @param {number} id selected sorting option index
  */
  useEffect(() => {
    const updateItems = (sid: number, lid: number) => {
      // Filter first to reduce sorting
      const items = [...nftItems].filter(listingOptions[lid].filter)

      // Sorting
      const {prop, dir} = sortingOptions[sid]
      items.sort((a, b) => {
        if(a[prop] > b[prop]) return 1
        if(a[prop] < b[prop]) return -1
        return 0
      })

      if (dir === "desc") {
        items.reverse()
      }
      
      setNftItems(items)
    }

    updateItems(sortingOptionId, listingOptionId)
  }, [sortingOptionId, listingOptionId])
  async function getAll() {
    setLoading(true)
    await getItems()
    setLoading(false)
  }

  useEffect(() => {
    getAll()
  },[])

  const getItems = async () => {
    try {
      const NOW = Math.ceil(Date.now() / 1000);
      const { auctions = [] } = await getSubgraphData("auctions","");
    
      const activeAuctions = await Promise.all(auctions
        .filter(hasNonZeroReservePrice)
        .filter(x => Number(x.endTime) - NOW)
        .map(async auction => {
          let hash = await getSubgraphData("auctionsNFT", auction.tokenAddress);
          
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

      const allListings = activeAuctions.concat(listings)
      setNftItems(allListings)
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
              Listing: {listingOptions[listingOptionId].label}
            </MenuButton>
            <MenuList>
              {
                listingOptions.map(({label}, idx) => (
                  <MenuItem 
                    key={`listing-type-${idx}`}
                    onClick={() => setListingOptionId(idx)}
                  >
                    {label}
                  </MenuItem>
                ))
              }
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
            {nftItems.length && (
              <>
                <InfiniteScroll
                  dataLength={nftItems.length}
                  next={getItems}
                  hasMore={hasMore}
                  loader={<Loading/>}
                  scrollThreshold={0.5}
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
                      if(item.end){//for auction
                        return (
                          <Anchor
                            key={`a-${item.id}`}
                            href={`/nft/${item.seller}-${item.sellerNonce}/auction`}
                          >
                            <NFTAuctionItem
                              name={item.name}
                              amount={utils.formatEther(item.shares)}
                              imageURL={item.imageURL}
                              end={item.end}
                              item={item}
                            />
                          </Anchor>
                          )
                      } else {
                        return (
                          <Anchor
                            key={`a-${item.id}`}
                            href={`/nft/${item.fraktal}/details`}
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
                <NextLink href={MINT_NFT}>
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
