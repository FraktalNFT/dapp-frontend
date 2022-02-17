/**
 * REACT
 */
import {useEffect, useState} from "react";
/**
 * NEXT
 */
import { useRouter } from "next/router";
import NextLink from "next/link";
/**
 * ICONS
 */
import { AiOutlineStock } from 'react-icons/ai';
import { FaCoins } from 'react-icons/fa';
import { GiCrackedShield, GiProfit } from 'react-icons/gi';

/**
 * CHAKRA UI
 */
import {
    Box,
    Container,
    List,
    ListItem,
    ListIcon,
    Grid,
    GridItem,
    Text
} from '@chakra-ui/react'
/**
 * NFT HELPER
 */
import { createObject2, createListed } from "../utils/nftHelpers";
/**
 * API GRAPH QUERY
 */
import {getSubgraphData} from "../utils/graphQueries";
/**
 * FRAKTAL Components
 */
import NFTItem from "@/components/nft-item";
import FrakButton from "@/components/button"
/**
 * STYLES
 */
import styles from "../styles/landing.module.css";
import {CREATE_NFT, EXPLORE} from "@/constants/routes";
//TODO LandingPage ADD PROPS

/**
 * LandingPage
 * @returns {any}
 * @constructor
 */
const LandingPage = () => {
    const [nftData, setNftData] = useState({});
    const router = useRouter();

    const getItem = async () => {
        //TODO - Get most popular NFT without listed items
        const data = await getSubgraphData("listed_items", "");
        const mostPopular = getMostPopular(data.listItems)[0];
        let nftObjects = await createListed(mostPopular);
        setNftData(nftObjects);
    };

    const getMostPopular = (items) => {
        return items.sort((a, b) => (a.fraktal.fraktions.length > b.fraktal.fraktions.length ? -1 : 1));
    };

    useEffect(()=>{
        getItem();
    }, []);

    return(<>
        <Grid display={{ md: 'flex' }} templateColumns='repeat(2, 1fr)' gap={30}>
            <GridItem className={styles.ladingLeft} width="100%">
                <Box>
                    <h2 className={styles.landingHeading}>Buy & Sell Fraktions of NFTs</h2>
                    <Grid className={styles.landingButtonContainer} templateColumns='repeat(2, 1fr)' gap={6}>
                        <GridItem w='100%'>
                            <FrakButton
                                onClick={() => {router.push(EXPLORE)}}
                                px="80px">Explore</FrakButton>
                        </GridItem>
                        <GridItem w='100%'>
                            <FrakButton
                                onClick={() => {router.push(CREATE_NFT)}}
                                border="2px solid #000"
                                px="80px"
                                background="#ffffff"
                                color="#000">Create</FrakButton>
                        </GridItem>
                    </Grid>
                    <Text className={styles.landingPowered}>Powered by FRAK</Text>
                    <List className={styles.landingItems} spacing={5}>
                        <ListItem>
                            <ListIcon as={FaCoins} color='yellow.500' marginRight="10px"  />
                            Earn FRAK from trading to offset gas costs
                        </ListItem>
                        <ListItem>
                            <ListIcon as={GiProfit} color='green.500' marginRight="10px" />
                            Stake FRAK and earn ETH from transaction fees
                        </ListItem>
                    </List>
                </Box>
            </GridItem>
            <GridItem  width="100%" >
                <Container>
                    {
                        nftData && (
                            <NextLink
                                href={`/nft/${nftData.tokenAddress}/details`}
                            >
                                <NFTItem
                                    height="50rem"
                                    name={nftData.name}
                                    amount={nftData.amount}
                                    price={nftData.price}
                                    imageURL={nftData.imageURL}
                                    item={null}
                                />
                            </NextLink>
                        )
                    }
                </Container>
            </GridItem>
        </Grid>
    </>);
};

export default LandingPage;