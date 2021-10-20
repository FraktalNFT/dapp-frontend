import React, { useState, useEffect } from "react";
import { Box, Grid, HStack, VStack, Text } from "@chakra-ui/layout";
import Head from "next/head";
import NextLink from "next/link";
import NFTItem from "../components/nft-item";
import Dropdown from "../components/dropdown";
import FrakButton from "../components/button";
import styles from "../styles/artists.module.css";
import { Image } from "@chakra-ui/image";
import { shortenHash } from "../utils/helpers";
import { getSubgraphData } from '../utils/graphQueries';
import { createObject2 } from '../utils/nftHelpers';
import { useWeb3Context } from '../contexts/Web3Context';
import InfiniteScroll from "react-infinite-scroll-component";

export default function ArtistsView() {
  	const SORT_TYPES = ["Popular", "New"];
  	const [selectionMode, setSelectionMode] = useState(false);
  	const [sortType, setSortType] = useState("Popular");
  	const [artists, setArtists] = useState([]);
  	const [artistsItems, setArtistsItems] = useState([]);
	  const [hasMore, setHasMore] = useState(true);
  	const {marketAddress, factoryAddress} = useWeb3Context();
  	const handleSortSelect = (item: string) => {
    	setSortType(item);
    	setSelectionMode(false);
	};

	// why does this exist
	// it triggers an infinite rerender loop and crashes the app
	// useEffect(()=>{
	// 	if (artistsItems.length) {
	// 	let artistsObj = artists.map((x,i)=>({
	// 		id: x.id,
	// 		name: shortenHash(x.id),
	// 		imageURL: artistsItems[i]?artistsItems[i].imageURL:"/filler-image-1.png",
	// 		totalGallery:x.created.length,
	// 	}))
	// 	setArtistsItems(artistsObj)
	// 	}
	// },[artistsItems])

  function getArtistsObjects(artists, artistsItems){
    const artistsObj = artists.map((x,i)=>({
      id: x.id,
      name: shortenHash(x.id),
      imageURL: artistsItems[i]?artistsItems[i].imageURL:"/filler-image-1.png",
      totalGallery:x.created.length,
    }))
    return artistsObj;
	}

	async function fetchNewArtists() {
		const data = await getSubgraphData('artists', '')
		if (data && marketAddress) {
			let onlyCreators = data.users.filter(x=>{return x.created.length > 0 })
			let withoutFactory = onlyCreators.filter(x => { return x.id != factoryAddress.toLocaleLowerCase() }) // why?
			setArtists([...artists, ...withoutFactory]);
			let fraktalSamples = withoutFactory.map(x=>{return x.created[0]}) // list the first NFT in the list of 'nfts this artist made'
			let fraktalsSamplesObjects = await Promise.all(fraktalSamples.map(x=>{return createObject2(x)}))
			let artistObjects = getArtistsObjects(withoutFactory, fraktalsSamplesObjects)
			// make sure you're pulling new subgraph data
			let deduplicatedArtistObjects = artistObjects.filter(item => {
				const artistMatch = artistsItems.find(artist => artist.id === item.id)
				if (typeof artistMatch === 'undefined') {
					return true;
				} else return false
			})
			if (typeof deduplicatedArtistObjects[0] === 'undefined') {
				setHasMore(false); // no new ArtistObjects, congrats on reaching the end of the internet
			} else {
				const newArray = [...artistsItems, ...deduplicatedArtistObjects];
				setArtistsItems(newArray);
			}
		}
	}

	useEffect(() => {
		const fetchInitialArtists = async () => {
			const data = await getSubgraphData('artists', '')
      // console.log('data',data)
			if (data && marketAddress) {
				let onlyCreators = data.users.filter(x=>{return x.created.length > 0 })
				let withoutFactory = onlyCreators.filter(x=>{return x.id != factoryAddress.toLocaleLowerCase()}) // why?
				setArtists(withoutFactory) // why?
				let fraktalSamples = withoutFactory.map(x=>{return x.created[0]}) // list the first NFT in the list of 'nfts this artist made'
				let fraktalsSamplesObjects = await Promise.all(fraktalSamples.map(x=>{return createObject2(x)}))
				let artistsObj = getArtistsObjects(withoutFactory, fraktalsSamplesObjects)
				if (artistsObj) {
					setArtistsItems(artistsObj)
				} else {
					setArtistsItems([])
				}
			}
		};
		fetchInitialArtists();
	}, [])

  return (
    <VStack spacing='0' mb='12.8rem'>
      <Head>
        <title>Fraktal - Artists</title>
      </Head>
      <HStack w='96.4rem' spacing='0' justifyContent='space-between' mb='4rem'>
        <Box position='relative' w={"280px"}>
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
              position='absolute'
              mt='-3rem'
              zIndex='1'
            />
          )}
        </Box>
        <Text className='semi-48'>Artists</Text>
        <div className={styles.searchContainer}>
          <input
            placeholder={"Search ENS or ETH address "}
            className={styles.searchInput}
          />
          <Image src='/search.svg' />
        </div>
      </HStack>
		{artistsItems.length ?
		(
			<>
			<InfiniteScroll
              dataLength={artistsItems.length}
              next={async () => await fetchNewArtists()}
              hasMore={hasMore}
              loader={<h3> Loading...</h3>}
              endMessage={<h4>Nothing more to show</h4>}
					  >
				<Grid
					margin='0 !important'
					mb='5.6rem !important'
					w='100%'
					templateColumns='repeat(3, 1fr)'
					gap='3.2rem'
					>
					{artistsItems.map((item, i) => (
						<NextLink href={`/artist/${item.id}`} key={`link--${item.id}-${i}`}>
							<NFTItem key={`item--${artists[i]?.id}-${i}`}
              imageURL = {item.imageURL}
              name={shortenHash(item.name)}
              price={item.totalGallery}
             />
						</NextLink>
  					))}
			  </Grid>
			</InfiniteScroll>
			</>
		)
		:
		(null)
		}
    </VStack>
  );
}
