import React, { useState, useEffect } from "react";
import { Box, Grid, HStack, VStack, Text, Spinner } from "@chakra-ui/react";
import Head from "next/head";
import NextLink from "next/link";
import NFTItem from "../components/nft-item";
import Dropdown from "../components/dropdown";
import FrakButton from "../components/button";
import styles from "../styles/artists.module.css";
import { Image } from "@chakra-ui/image";
import { shortenHash } from "../utils/helpers";
import { getSubgraphData } from "../utils/graphQueries";
import { createObject2 } from "../utils/nftHelpers";
import { useWeb3Context } from "../contexts/Web3Context";
import InfiniteScroll from "react-infinite-scroll-component";
import ArtistCard from "@/components/artistCard/ArtistCard";
import { useRouter } from "next/router";
import { useENSAddress } from 'components/useENSAddress';

export default function ArtistsView() {
  const router = useRouter();
  const SORT_TYPES = ["Popular", "New"];
  const [selectionMode, setSelectionMode] = useState(false);
  const [sortType, setSortType] = useState("Popular");
  const [artists, setArtists] = useState([]);
  const [artistsItems, setArtistsItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const { marketAddress, factoryAddress, loading } = useWeb3Context();
  const [artistAddress, setArtistAddress] = useState("");
  const [inputAddress, setInputAddress] = useState("");
  
  const handleSortSelect = (item: string) => {
    setSortType(item);
    setSelectionMode(false);
  };

  function getArtistsObjects(artists, artistsItems) {
    const artistsObj = artists.map((x, i) => ({
      id: x.id,
      name: shortenHash(x.id),
      imageURL: artistsItems[i]
        ? artistsItems[i].imageURL
        : "/filler-image-1.png",
      totalGallery: x.created.length,
    }));
    return artistsObj;
  }

  async function fetchNewArtists() {
    const data = await getSubgraphData("artists", "");
    if (data && factoryAddress) {
      let onlyCreators = data.users.filter(x => {
        return x.created.length > 0;
      });
      let noImporters = onlyCreators.filter(x => {
        return x.id != factoryAddress.toLocaleLowerCase();
      });
      setArtists([...artists, ...noImporters]);
      let fraktalSamples = noImporters.map(x => {
        return x.created[0];
      }); // list the first NFT in the list of 'nfts this artist made'
      let fraktalsSamplesObjects = await Promise.all(
        fraktalSamples.map(x => {
          return createObject2(x);
        })
      );
      let artistObjects = getArtistsObjects(
        noImporters,
        fraktalsSamplesObjects
      );
      // make sure you're pulling new subgraph data
      let deduplicatedArtistObjects = artistObjects.filter(item => {
        const artistMatch = artistsItems.find(artist => artist.id === item.id);
        if (typeof artistMatch === "undefined") {
          return true;
        } else return false;
      });
      if (typeof deduplicatedArtistObjects[0] === "undefined") {
        setHasMore(false); // no new ArtistObjects, congrats on reaching the end of the internet
      } else {
        const newArray = [...artistsItems, ...deduplicatedArtistObjects];
        setArtistsItems(newArray);
      }
    }
  }

  function searchHandle(e){
    e.preventDefault();
    if(e.target.value !== ""){
      const inputVal=e.target.value;
      let address_Artist= inputVal;
      if(!inputVal.startsWith("0x")){
        setInputAddress(e.target.value);
      }
      setArtistAddress(address_Artist);
    }
  }
  const [isENSAddressValid, ethAddressFromENS] = useENSAddress(inputAddress)

  useEffect(() => {
    const fetchInitialArtists = async () => {
      const data = await getSubgraphData("firstArtists", "");
      if (data && factoryAddress) {
        let onlyCreators = data.users.filter(x => {
          return x.created.length > 0;
        });
        let noImporters = onlyCreators.filter(x => {
          return x.id != factoryAddress.toLocaleLowerCase();
        }); // why?
        setArtists(noImporters); // why?
        let fraktalSamples = noImporters.map(x => {
          return x.created[0];
        }); // list the first NFT in the list of 'nfts this artist made'
        let fraktalsSamplesObjects = await Promise.all(
          fraktalSamples.map(x => {
            return createObject2(x);
          })
        );
        let artistsObj = getArtistsObjects(noImporters, fraktalsSamplesObjects);
        if (artistsObj) {
          setArtistsItems(artistsObj);
        } else {
          setArtistsItems([]);
        }
      }
    };
    fetchInitialArtists();
  }, [factoryAddress]);

  return (
    <VStack spacing="0" mb="12.8rem">
      <Head>
        <title>Fraktal - Artists</title>
      </Head>
      <HStack w="96.4rem" spacing="0" justifyContent="space-between" mb="4rem">
  {/*     <Box position="relative" w={"280px"}>
          {!selectionMode ? (
            <FrakButton
              style={{ minWidth: "200px" }}
              isOutlined
              onClick={() => setSelectionMode(true)}
            >
              Sort: {sortType}
            </FrakButton>
          ) : (
            <Dropdown
              items={SORT_TYPES}
              onItemClick={handleSortSelect}
              position="absolute"
              mt="-3rem"
              zIndex="1"
            />
          )}
        </Box> */}
        <Text className="semi-48">Artists</Text>
      <div className={styles.searchContainer}>
          <input
            placeholder={"Search ENS or ETH address "}
            className={styles.searchInput}
            onChange={searchHandle}
          />
          {
            artistAddress !=="" &&
              <NextLink
                      href={`/artist/${artistAddress.startsWith("0x") ? artistAddress : ethAddressFromENS}`}
                      key={`link--${artistAddress}`}
                    >
                <Image src="/search.svg" />
              </NextLink>
          }
        </div>       
      </HStack>
      {!loading && artistsItems.length > 0 && (
        <>
          <InfiniteScroll
            dataLength={artistsItems.length}
            next={async () => await fetchNewArtists()}
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
              {artistsItems.map((item, i) => {
                return (
                  <NextLink
                    href={`/artist/${item.id}`}
                    key={`link--${item.id}-${i}`}
                  >
                    <ArtistCard
                      bg={item.imageURL}
                      onClick={() => router.push(`/artist/${item.id}`)}
                    />
                  </NextLink>
                );
              })}
            </Grid>
          </InfiniteScroll>
        </>
      )}
      {loading && <Spinner size="xl" />}
    </VStack>
  );
}
