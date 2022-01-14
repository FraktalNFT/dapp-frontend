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
import { BigNumber } from "ethers";
import Head from "next/head";
import NextLink from "next/link";
import { useState, useEffect } from "react";
import FrakButton from "../components/button";
import NFTItem from "../components/nft-item";
import { FrakCard } from "../types";
import { getSubgraphData } from "../utils/graphQueries";
import { createListed } from "../utils/nftHelpers";
import { FiChevronDown } from "react-icons/fi";
import InfiniteScroll from "react-infinite-scroll-component";
import Notification from "../components/notification";

const SORT_TYPES = ["Availability", "Popular", "Newly Listed"];

const Home: React.FC = () => {
  const [nftItems, setNftItems] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [sortType, setSortType] = useState("Newly Listed");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const handleSortSelect = (item: string) => {
    setSelectionMode(false);
    setSortType(item);
    changeOrder(item);
  };

  const changeOrder = type => {
    let sortedItems;
    if (type == "Availability") {
      sortedItems = nftItems.sort((a, b) =>
        parseInt(a.amount) > parseInt(b.amount) ? -1 : 1
      );
    } else if (type == "Popular") {
      sortedItems = nftItems.sort((a, b) => (a.holders > b.holders ? -1 : 1));
    } else {
      sortedItems = nftItems.sort((a, b) =>
        a.createdAt > b.createdAt ? -1 : 1
      );
    }
    setNftItems(sortedItems);
  };

  async function getData() {
    setLoading(true);
    await getMoreListedItems();
    setLoading(false);
  }

  useEffect(() => {
    if (window?.sessionStorage.getItem("nftitems")) {
      const stringedNFTItems = window?.sessionStorage.getItem("nftitems");
      const unstringedNFTItems = JSON.parse(stringedNFTItems);
      setNftItems(unstringedNFTItems);
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

  const getMoreListedItems = async () => {
    const data = await getSubgraphData("listed_items", "");
    let dataOnSale;
    if (data?.listItems?.length > 1) {
      dataOnSale = data?.listItems?.filter(x => {
        return x.fraktal.status == "open";
      }); // this goes in the graphql query
    }
    if (dataOnSale?.length > 1) {
      // console.log('dataOnSale', dataOnSale)
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
        setHasMore(false);
      } else {
        const newArray = [...nftItems, ...deduplicatedObjects];
        setNftItems(newArray);
      }
    }
  };

  // Store NFT Items in Session Storage
  useEffect(() => {
    const stringedNFTItems = JSON.stringify(nftItems);
    window?.sessionStorage?.setItem("nftitems", stringedNFTItems);
  }, [nftItems]);

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
        <Notification />
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
              <MenuItem onClick={() => handleSortSelect("Popular")}>
                Popular
              </MenuItem>
              <MenuItem onClick={() => handleSortSelect("Availability")}>
                Availability
              </MenuItem>
              <MenuItem onClick={() => handleSortSelect("Newly Listed")}>
                Newly Listed
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
                    {nftItems.map((item, index) => (
                      <NextLink
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
                      </NextLink>
                    ))}
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

export default Home;
