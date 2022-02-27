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
const SORT_TYPES = [LOWEST_PRICE, HIGHEST_PRICE, NEWLY_LISTED];
/**
 * FRAKTAL Components
 */
import NFTItem from "../components/nft-item";
import NFTAuctionItem from "@/components/nft-auction-item";
import FrakButton from "../components/button";
import Anchor from '@/components/anchor';
import {MY_NFTS, MINT_NFT} from "@/constants/routes";

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
  const [orderDirection, setOrderDirection] = useState('desc');

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

  const changeOrder = type => {
    setOffset(0);
    setNftData([]);
    setNftItems([]);
    if (type === LOWEST_PRICE) {
        setOrderDirection('asc');
        setRefresh(true);
    } else if (type === HIGHEST_PRICE) {
      setOrderDirection('desc');
      setRefresh(true);
    } else if (type == NEWLY_LISTED) {
        setOrderDirection('desc');
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
    if (type == "All Listings") {
      sortedItems = nftData;
    } else if (type == FIXED_PRICE_TYPE) {
      sortedItems = nftData.filter((item) => !item.end);
    } else {
      sortedItems = nftData.filter((item) => item.end>0);
    }
    setNftItems(sortedItems);
  };

    /**
     * Map Auction To Fraktal
     * @param auctionData
     * @returns {Promise<any[]>}
     */
  async function mapAuctionToFraktal(auctionData) {
      let auctionDataHash = [];
      await Promise.all(auctionData?.auctions.map(async x => {
          let _hash = await getSubgraphAuction("auctionsNFT", x.fraktal);

          const itm = {
              "id":`${x.fraktal}-${x.sellerNonce}`,
              "hash":_hash.fraktalNft.hash
          };

          auctionDataHash.push(itm);
      }));
      let auctionItems = [];
      await Promise.all(auctionData?.auctions.map(async (auction, idx) => {
              let hash = auctionDataHash.filter(e=>e.id == `${auction.fraktal}-${auction.sellerNonce}`);
              Object.assign(auction, {"hash":hash[0].hash});
              const item = await createListedAuction(auction);
              auctionItems.push(item);
          }
      ));
      return auctionItems;
  }

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
      if (fraktals?.fraktalNfts.length >= 0) {
          await Promise.all(fraktals?.fraktalNfts.map(async fraktalNft => {
              let item = await getSubgraphData("listed_items_by_fraktal_id", fraktalNft.id);
              if (item.listItems[0] !== undefined) {
                  listedData.listItems.push(item.listItems[0]);
              }
          }));
      }
      return listedData;
  }

   /**
   * getData
   * @returns {Promise<void>}
   */
   async function getData() {
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
            end: curTimestamp,
            orderDirection: orderDirection
        });

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
                            key={`${item.seller}-${item.sellerNonce}`}
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
