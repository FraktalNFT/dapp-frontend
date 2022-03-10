/**
 * Chakra UI
 */
import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
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
  TabList,
  Tag,
  TagLabel,
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

import { BigNumber, utils } from "ethers";
import { getSubgraphData, LIMITED_ITEMS, LIMITED_AUCTIONS } from "../utils/graphQueries";

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
import {getItems} from '@/utils/search';
import { mapFixedPrice, mapAuctionToFraktal } from "../utils/nftHelpers";
/**
 * Filters
 * @type {string}
 */
const LOWEST_PRICE = "Lowest Price";
const HIGHEST_PRICE = "Highest Price";
const NEWLY_LISTED = "Newly Listed";
const AUCTIONS_TYPE = 'Auction';
const FIXED_PRICE_TYPE = "Fixed Price";
const ORDER_DESC = 'desc';
const ORDER_ASC = 'asc';
const SORT_TYPES = [LOWEST_PRICE, HIGHEST_PRICE];
const LIMITS = [15, 30, 50];
const SORT_FIXED_PRICE = 'price';
const SORT_AUCTION_PRICE = "reservePrice";

const Marketplace: React.FC = () => {
  const router = useRouter();
  const [orderBy, setOrderBy] = useState(SORT_FIXED_PRICE);
  const [tabIndex, setTabIndex] = useState(0)
  const [sortName, setSortName] = useState(HIGHEST_PRICE);
  const [subgraphMethod, setSubgraphMethod] = useState(LIMITED_ITEMS);

  const [limit, setLimit] = useState(15);
  const [offset, setOffset] = useState(0);
  const [nftItems, setNftItems] = useState([]);
  const [orderDirection, setOrderDirection] = useState(ORDER_DESC);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [queryString, setQueryString] = useState('');
  const [additionalQueryParams, setAdditionalQueryParams] = useState({});

    /**
     * First loading
     */
    useEffect(() => {
        setLoading(true);
        getData();
    }, []);

    /**
     * useEffect
     */
    useEffect(()=> {
        if (refresh === true) {
            setHasMore(false);
            setLoading(true);
            getData();
        }
    }, [refresh]);

  /**
   * changeOrder
   * @param type
  */
  const changeOrder = (type: string) => {
      setOffset(0);
      setNftItems([]);
      if (type === LOWEST_PRICE) {
          setOrderDirection(ORDER_ASC);
          setRefresh(true);
      } else if (type === HIGHEST_PRICE) {
          setOrderDirection(ORDER_DESC);
          setRefresh(true);
      }
  }

  /**
  * handleSortSelect
  * @param {string} item
  */
  const handleSortSelect = (item: string) => {
    setSortName(item);
    changeOrder(item)
  };
   /**
     * handleTabsChange
     * @param index
   */
  const handleTabsChange = (index) => {
    setTabIndex(index);
    if (index === 0) {
        setSubgraphMethod(LIMITED_ITEMS);
        setOrderBy(SORT_FIXED_PRICE);
    } else {
        setSubgraphMethod(LIMITED_AUCTIONS);
        setOrderBy(SORT_AUCTION_PRICE);
        let curTimestamp = Math.round(Date.now() / 1000);
        setAdditionalQueryParams({endTime: curTimestamp})
    }
    removeFilter(index);
  }

  /**
   * getData
  */
  async function getData() {
      let mappedItems = [];
      const queryParams = new URLSearchParams(window.location.search);
      const query = queryParams.get("query");
      setQueryString(query);
      if (query) {
          setTabIndex(null);
          const result = await getItems(query, {
              limit: limit,
              offset: offset
          });

          if (result.auctions) {
              mappedItems = [...result.auctions, ...mappedItems];
          }
          if (result.fixedPrice) {
              mappedItems = [...result.fixedPrice, ...mappedItems];
          }
          if (mappedItems.length === 0) {
              setHasMore(false);
              setLoading(false);
              setRefresh(false);
              return;
          }

          mappedItems = mappedItems.sort((a, b) => {
            if (sortName == LOWEST_PRICE) return parseFloat(a.price) > parseFloat(b.price) ? 1 : -1
            if (sortName == HIGHEST_PRICE) return parseFloat(a.price) < parseFloat(b.price) ? 1 : -1
          });

         // setNftItems([...nftItems, ...mappedItems]);
         // setOffset(offset + limit);
         // setLoading(false);
        //  setHasMore(true);
         // setRefresh(false);
    } else {
        const data = await getSubgraphData(subgraphMethod, "", {
              limit: limit,
              offset: offset,
              orderDirection: orderDirection,
              orderBy: orderBy,
              ...additionalQueryParams
        });
        mappedItems = data.listItems !== undefined ? await mapFixedPrice(data) : await mapAuctionToFraktal(data);
    }

    if (mappedItems?.length > 0) {
        setNftItems([...nftItems, ...mappedItems]);
        setOffset(offset + limit);
        setHasMore(true);
        setRefresh(false);
    } else {
        setHasMore(false);
    }
    setLoading(false);
   }

  /**
  * Remove Search Filter
  */
  const removeFilter = (tab = null) => {
    router.push(EXPLORE, "", { shallow: true }).then( () => {
        setOffset(0);
        setNftItems([]);
        setTabIndex(tab);
        setQueryString("");
        setRefresh(true);
    });
  };

  async function addFilter(searchQuery) {
      setOffset(0);
      setNftItems([]);
      setTabIndex(null);
      setQueryString(searchQuery);
      router.push(
          {
              pathname: EXPLORE,
              query: {
                  query: searchQuery
              }
          }, null, { shallow: true }
      ).then( () => {
          if (router.query.query !== undefined) {
              setQueryString(router.query.query)
          }
          setRefresh(true);
      });
  }

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
          <Tabs paddingTop="15px" width="40%" index={tabIndex} onChange={handleTabsChange} isFitted variant='enclosed' size='lg' align="center" >
            <TabList mb='1em' borderBottom="1px solid #E0E0E0">
                <Tab _selected={{ color: '#985CFF', borderColor:  '#985CFF'}}>{FIXED_PRICE_TYPE}</Tab>
                <Tab _selected={{ color: '#985CFF', borderColor:  '#985CFF'}}>{AUCTIONS_TYPE}</Tab>
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
              Sort: {sortName}
            </MenuButton>
            <MenuList zIndex={2}>
                {
                    SORT_TYPES.map((sortName) => (
                        <MenuItem onClick={() => handleSortSelect(sortName)}>
                            {sortName}
                        </MenuItem>
                    ))
                }
            </MenuList>
          </Menu>
          <Spacer />
          <Menu closeOnSelect={true}>
                <MenuButton
                    as={Button}
                    alignSelf="center"
                    fontSize="12"
                    bg="transparent"
                    height="5rem"
                    width="10rem"
                    rightIcon={<FiChevronDown />}
                    fontWeight="bold"
                    transition="all 0.2s"
                >
                    Show: {limit}
                </MenuButton>
                <MenuList zIndex={2}>
                    {
                        LIMITS.map((showLimit) => (
                            <MenuItem onClick={() => setLimit(showLimit)}>
                                {showLimit}
                            </MenuItem>
                        ))
                    }
                </MenuList>
          </Menu>
          <Spacer/>
          <Box sx={{ display: `flex`, gap: `16px` }}>
            <NextLink href="/my-nfts#yourFraktions">
              <FrakButton>Sell Fraktions</FrakButton>
            </NextLink>
          </Box>
        </Flex>
        <Search addFilter={addFilter} marginBottom="10px" width="100%"/>
        <div style={{marginTop:"20px", width:"100%"}}>
        {queryString && (<>
              <Text  marginBottom="10px">Search results for:
                  <Tag
                      marginLeft="5px"
                      size="lg"
                      borderRadius='full'
                      variant='solid'
                      background="rgba(195, 135, 255, 0.7)"
                  >
                      <TagLabel>{queryString}</TagLabel>
                      <TagCloseButton onClick={() => removeFilter(0)} />
                  </Tag></Text>
        </>)}
        </div>
        <Tabs width="100%" index={tabIndex} onChange={handleTabsChange} isFitted variant='enclosed' size='lg' align="center" >
            <NFTItems
                queryString={queryString}
                getData={getData}
                hasMore={hasMore}
                nftItems={nftItems}
                loading={loading}/>
        </Tabs>
      </VStack>
    </>
  );
};

/**
 * NFTItems
 * @param getData
 * @param hasMore
 * @param loading
 * @param nftItems
 * @param queryString
 * @param removeFilter
 * @constructor
 */
const NFTItems = ({getData, hasMore, loading, nftItems, queryString}) => {

    /**
     * renderNFTItem
     * @param item
     * @param index
     */
    const renderNFTItem = (item, index) => {
        if (item.error) {
            return;
        }
        if (item.endTime) {
            return (
                <Anchor
                    key={item.link}
                    href={item.link}
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
                    key={item.link}
                    href={item.link}
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
            );
        }
    }

    return (
        <>

            {loading && (
                <Loading/>
            )}

            {!loading && (
                <InfiniteScroll
                    dataLength={nftItems?.length}
                    next={getData}
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
                        {nftItems.map((item, index) => (
                            <>
                                {renderNFTItem(item, index)}
                            </>
                        ))}
                    </Grid>
                </InfiniteScroll>
            )}
            {!loading && nftItems?.length <= 0 && (
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
        </>
    );
}
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
