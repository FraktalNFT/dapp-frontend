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
  TabPanels,
  TabPanel,
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
import { getSubgraphData } from "../utils/graphQueries";
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
const SORT_TYPES = [LOWEST_PRICE, HIGHEST_PRICE, NEWLY_LISTED];
/**
 * FRAKTAL Components
 */
import NFTItem from "../components/nft-item";
import NFTAuctionItem from "@/components/nft-auction-item";
import FrakButton from "../components/button";
import Anchor from '@/components/anchor';
import {MY_NFTS, MINT_NFT} from "@/constants/routes";
import styles from "@/styles/rewards.module.css";
import FrakButton2 from "@/components/button2";

const Marketplace: React.FC = () => {

  const [tabIndex, setTabIndex] = useState(0)
  const [sortType, setSortType] = useState(HIGHEST_PRICE);
  const curTimestamp = Math.round(Date.now() / 1000);
  const fixedPriceRef = useRef();
  const auctionRef = useRef();

   /**
    * Use Effect
   */
   useEffect(() => {
   }, []);

  /**
  * handleSortSelect
  * @param {string} item
  */
  const handleSortSelect = (item: string) => {
  //  setSelectionMode(false);
     setSortType(item);
     if (tabIndex == 0) {
         fixedPriceRef.current.changeOrder(item);
     } else {
         auctionRef.current.changeOrder(item);
     }
  };

  const handleTabsChange = (index) => {
    setTabIndex(index);
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
          <Spacer />
          <Box sx={{ display: `flex`, gap: `16px` }}>
            <NextLink href="/my-nfts#yourFraktions">
              <FrakButton>Sell Fraktions</FrakButton>
            </NextLink>
          </Box>
        </Flex>
        <Tabs width="100%" index={tabIndex}  onChange={handleTabsChange}  isFitted variant='enclosed' size='lg' align="center" >
              <TabList mb='1em' borderBottom="1px solid #E0E0E0">
                  <Tab _selected={{ color: '#985CFF', borderColor:  '#985CFF'}}>{FIXED_PRICE_TYPE}</Tab>
                  <Tab _selected={{ color: '#985CFF', borderColor:  '#985CFF'}}>{AUCTIONS_TYPE}</Tab>
              </TabList>
              <TabPanels padding="0 10px" margin="28px 0 0 0">
                  <TabPanel>
                      <NFTTab ref={fixedPriceRef}
                              mapping={mapFixedPrice}
                              subgraphMethod="limited_items"
                              sort="desc"
                              orderBy="price" />
                  </TabPanel>
                  <TabPanel>
                      <NFTTab ref={auctionRef}
                              additionalQueryParams={{endTime: curTimestamp}}
                              mapping={mapAuctionToFraktal}
                              subgraphMethod="limited_auctions"
                              sort="desc"
                              orderBy="reservePrice" />
                  </TabPanel>
              </TabPanels>
        </Tabs>
      </VStack>
    </>
  );
};

/**
 * NFT Tab
 * @param subgraphMethod
 * @param sort
 * @param orderBy
 * @param mapping
 * @param additionalQueryParams
 * @constructor
 */
const NFTTab = forwardRef(({subgraphMethod, sort, orderBy, mapping, additionalQueryParams = {}}, ref ) => {
    const [limit, setLimit] = useState(15);
    const [offset, setOffset] = useState(0);
    const [nftItems, setNftItems] = useState([]);
    const [nftData, setNftData] = useState([]);
    const [orderDirection, setOrderDirection] = useState(sort);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [refresh, setRefresh] = useState(false);

    useImperativeHandle(ref, () => ({
        changeOrder(type) {
            setOffset(0);
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
        }
    }));

    /**
     * First loading
     */
    useEffect(() => {
        setLoading(true);
        getData();
    }, []);

    /**
     * Refresh
     */
    useEffect(()=>{
        if (refresh === true) {
            setHasMore(false);
            setLoading(true);
            getData();
        }
    }, [refresh]);

    /**
     * getData
     * @returns {Promise<void>}
     */
    async function getData() {
        const data = await getSubgraphData(subgraphMethod, "", {
            limit: limit,
            offset: offset,
            orderDirection: orderDirection,
            orderBy: orderBy,
            ...additionalQueryParams
        });

        let mappedItems = await mapping(data);

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
                            </>
                        ))}
                    </Grid>
                </InfiniteScroll>
            )}
        </>
    );
});

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
