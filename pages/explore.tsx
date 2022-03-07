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
  Tab,
  Tabs,
  TabList
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
import { fetchNftMetadata } from "../utils/nftHelpers";

/**
 * Sorting
 * 
 * Consider adding sorting options as a property of listing options. e.g.:
 * listingOptions => [{type, label, filter, sorters: [] }, ...]
 */
 const sortingOptions = [
  { prop: "price", dir: "asc", label: "Lowest Price", entity: "FIXED"},
  { prop: "price", dir: "desc", label: "Highest Price", entity: "FIXED"},
  { prop: "price", dir: "asc", label: "Lowest Reserve", entity: "AUCTION"},
  { prop: "price", dir: "desc", label: "Highest Reserve", entity: "AUCTION"}
  // { prop: "createdAt", dir: "desc", label: "Newly Listed"},
  // { prop: "holders", dir: "desc", label: "Popular"},
]

const entityTypes = ["FIXED", "AUCTION"]

/**
 * Filters
 * @type {string}
 */
const listingOptions = [
  { type: "FIXED", label: "Fixed Price",  filter: (item) => !item.hasOwnProperty("end")},
  { type: "AUCTION", label: "Auctions", filter: (item) => item.hasOwnProperty("end")},
]

const hasNonZeroReservePrice = ({price}) => (!!Number(price))

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
  const [auctionItems, setAuctionItems] = useState([])
  const [fixedItems, setFixedItems] = useState([])
  const [filteredSortingOptions, setFilteredSortingOptions] = useState(sortingOptions.slice(0,1))

  // Pagination
  // const [limit, setLimit] = useState(15)
  // const [offset, setOffset] = useState(0)
  // const [orderDirection, setOrderDirection] = useState("desc")

  useEffect(() => {
    const getAll = async function () {
      setLoading(true)
      await getItems()
      setLoading(false)
    }

    getAll().catch(console.error)
  }, [])

   /**
  * Sort select handler
  * @param {number} id selected sorting option index
  */
  useEffect(() => {
    const updateItems = (sid: number, lid: number) => {
      const listingOptionIdMap = {
        "FIXED": fixedItems,
        "AUCTION": auctionItems
      }

      // Filter first to reduce sorting
      const _items = listingOptionIdMap[entityType]
      const items = [..._items].filter(listingOptions[lid].filter)

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

    const entityType = entityTypes[listingOptionId]
    const _filteredSortingOptions = sortingOptions.filter(o => (o.entity === entityType))
    setFilteredSortingOptions(_filteredSortingOptions)

    updateItems(sortingOptionId, listingOptionId)
  }, [auctionItems, fixedItems, sortingOptionId, listingOptionId])

  const cleanNftList = async (items) => {
    return Promise.all(items.filter((nft) => nft.fraktal.hash != "")
      .map((nft, idx) => {
        const { hash } = nft.fraktal
        if(hash.startsWith('Qm')) {
          nft.fraktal.hash = `https://ipfs.io/ipfs/${hash}`
        } else if (hash.startsWith("ipfs://Qm")) {
          nft.fraktal.hash = hash.replace("ipfs://Qm", "https://ipfs.io/ipfs/Qm")
        }

        return nft
      })
      .map(async nft => {
        const meta = await fetchNftMetadata(nft.fraktal.hash)
        return {...nft, ...meta}
      })
    )
  }

  const getItems = async () => {
    try {
      const NOW = Math.ceil(Date.now() / 1000);
      const { auctions = [] } = await getSubgraphData("auctions");

      const activeAuctions = auctions
        .filter(hasNonZeroReservePrice)
        .filter(x => Number(x.end) - NOW)

      const cleanAuctionItems = await cleanNftList(activeAuctions)
      setAuctionItems(cleanAuctionItems)

      // gets 100 nfts ordered by createdAt (desc)
      const { listItems } = await getSubgraphData("listed_items");

      const listings = listItems
        .filter(nft => (nft.fraktal.status == "open"))

      const cleanFixedItems = await cleanNftList(listings)
      setFixedItems(cleanFixedItems)

    } catch (err) {
      console.error(err)
    }
  };

  // Store NFT Items in Session Storage
  // useEffect(() => {
  //   const result = nftItems.filter(canSelfCheck);

  //   const stringedNFTItems = JSON.stringify(result);
  //   if(stringedNFTItems.length){
  //     window.sessionStorage.setItem("nftitems", stringedNFTItems);
  //   }
    
  // }, [nftItems]);

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
          <Tabs isFitted defaultIndex={0} size="lg" align="start" variant="enclosed" alignSelf="end" flexGrow={1}>
            <TabList mb="1em">
            {
                listingOptions.map(({label}, idx) => (
                  <Tab
                    key={`listing-type-${idx}`}
                    onClick={() => setListingOptionId(idx)}
                  >{label}</Tab>
                ))
              }
            </TabList>
          </Tabs>
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
              Sort: {filteredSortingOptions[sortingOptionId].label}
            </MenuButton>
            <MenuList>
            {
                // Subset of sorting options based off selecting listing type
                filteredSortingOptions.map(({label}, idx) => (
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
                            key={`nft-${index}-${item.id}`}
                            href={`/nft/${item.seller}-${item.sellerNonce}/auction`}
                          >
                            <NFTAuctionItem
                              name={item.name}
                              shares={utils.formatEther(item.shares)}
                              image={item.image}
                              end={item.end}
                              item={item}
                            />
                          </Anchor>
                          )
                      } else {
                        return (
                          <Anchor
                            key={`nft-${index}-${item.id}`}
                            href={`/nft/${item.fraktal.id}/details`}
                          >
                            <NFTItem
                              name={item.name}
                              shares={item.shares}
                              price={item.price}
                              image={item.image}
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
