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
  Tag,
  TagLabel,
  TagLeftIcon,
  TagRightIcon,
  TagCloseButton,
} from "@chakra-ui/react";

/**
 * Next
 */
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from 'next/router';
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
 * FRAKTAL Components
 */
import Anchor from '@/components/anchor';
import FrakButton from "@/components/button";
import NFTItem from "../components/nft-item";
import NFTAuctionItem from "@/components/nft-auction-item";
import {MY_NFTS, MINT_NFT, EXPLORE} from "@/constants/routes";
import Search from "@/components/search";

/**
 * SEARCH Utils
 */
import {getItems, mapAuctions, mapListed} from '@/utils/search';
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
const SORT_TYPES = [LOWEST_PRICE, HIGHEST_PRICE, NEWLY_LISTED];
const ORDER_ASC  = 'asc';
const ORDER_DESC = 'desc';

const Marketplace: React.FC = () => {
  const router = useRouter();
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
  const [orderDirection, setOrderDirection] = useState(ORDER_DESC);
  const [queryString, setQueryString] = useState('');

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
      setNftItems([]);
      setNftData([]);
      setHasMore(false);
      setLoading(true);
      getData();
    }
  }, [refresh]);

  useEffect(() => {
     setLoading(true);
     getData();
  }, []);

  useEffect(() => {
      if (refresh === false && router.query.query !== undefined) {
          setQueryString(router.query.query)
          getData();
      }
  }, [router.query]);

  const getMoreListedItems = async () => {
    getData();
  };

  const changeOrder = type => {
    setOffset(0);
    setNftData([]);
    setNftItems([]);
    if (type === LOWEST_PRICE) {
        setOrderDirection(ORDER_ASC);
        setRefresh(true);
    } else if (type === HIGHEST_PRICE) {
      setOrderDirection(ORDER_DESC);
      setRefresh(true);
    } else if (type == NEWLY_LISTED) {
        setOrderDirection(ORDER_DESC);
        setRefresh(true);
    }
  };

  const handleListingSelect = (item: string) => {
    setSelectionMode(false);
    setListType(item);
    changeList(item);
  };

  const changeList = type => {
    let sortedItems;
    if (type == DEFAULT_TYPE) {
      sortedItems = nftData;
    } else if (type == FIXED_PRICE_TYPE) {
      sortedItems = nftData.filter((item) => !item.endTime);
    } else {
      sortedItems = nftData.filter((item) => item.endTime>0);
    }
    setNftItems(sortedItems);
  };
   /**
   * getByDate
   * @returns {Promise<{listItems: any[]}>}
  */
  async function getByDate() {
      let listedData = {
          listItems: []
      };
      const fraktals = await getSubgraphData("all", "", {
          limit: limit,
          offset: offset,
          orderDirection: "desc"
      });
      await Promise.all(fraktals?.fraktalNfts.map(async fraktalNft => {
           let item = await getSubgraphData("listed_items_by_fraktal_id", fraktalNft.id);
           if (item.listItems[0] !== undefined) {
               listedData.listItems.push(item.listItems[0]);
           }
      }));
      return listedData;
  }

   /**
   * getData
   * @returns {Promise<void>}
   */
   async function getData() {
       const queryParams = new URLSearchParams(window.location.search);
       const query = queryParams.get("query");
       setQueryString(query);
       if (query) {

            const result = await getItems(query);
            let nfts = [];
            if (result.auctions) {
                nfts = [...result.auctions, ...nfts];
            }
            if (result.fixedPrice) {
                nfts = [...result.fixedPrice, ...nfts];
            }
            setNftItems(nfts);
            setNftData(nfts);
            setLoading(false);
            setHasMore(true);
            setRefresh(false);
            return;
        }

        let listedData = {
            listItems: []
        };
        if (sortType == NEWLY_LISTED) {
            listedData = await getByDate();
        } else {
            listedData = await getSubgraphData("limited_items", "", {
                limit: limit,
                offset: offset,
                orderDirection: orderDirection,
                orderBy: "price"
            });
        }

        const curTimestamp = Math.round(Date.now() / 1000);
        let auctionData = await getSubgraphAuction("limited_auctions", "", {
            limit: limit,
            offset: offset,
            endTime: curTimestamp,
            orderDirection: orderDirection
        });

        if (listedData?.listItems?.length == 0 && auctionData.auctions.length == 0) {
            setHasMore(false);
            return;
        }

        const auctionItems = await mapAuctions(auctionData.auctions);

        let dataOnSale;
        if (listedData?.listItems?.length != undefined) {
          dataOnSale = listedData?.listItems?.filter(x => {
            return x.fraktal.status == "open";
          }); // this goes in the graphql query
        }

       if (dataOnSale?.length >= 0) {
        let objects = await mapListed(dataOnSale)

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
        setOffset(offset+limit);
        setLoading(false);
        setHasMore(true);
        setRefresh(false);
     }
  }

  const orderByHolders = (listedData) => {
      listedData.listItems.sort((a, b) => (a.fraktal.fraktions.length > b.fraktal.fraktions.length ? -1 : 1));
      return listedData;
  };

  /**
  * Remove Search Filter
  */
  const removeFilter = () => {
    router.push(EXPLORE, "", { shallow: true });
    setOffset(0);
    setNftData([]);
    setNftItems([]);
    setRefresh(true);
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
            <MenuList zIndex={2}>
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
            <MenuList zIndex={2}>
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
        <Search marginBottom="10px" width="100%" queryString={queryString}/>
        {loading && (
          <Loading/>
        )}
        {!loading && (
          <div>
            {nftItems && nftItems?.length > 0 && (
              <>
                {queryString && (<>
                    <Text marginBottom="10px">Search results for:
                    <Tag
                        marginLeft="5px"
                        size="lg"
                        borderRadius='full'
                        variant='solid'
                        background="rgba(195, 135, 255, 0.7)"
                    >
                        <TagLabel>{queryString}</TagLabel>
                        <TagCloseButton onClick={removeFilter} />
                    </Tag></Text>
                </>)}
                <InfiniteScroll
                  dataLength={nftItems?.length}
                  next={getMoreListedItems}
                  hasMore={hasMore}
                  loader={<Loading/>}
                  scrollThreshold={0.7}
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
                      if(item.endTime) {//for auction
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
