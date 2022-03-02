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
    Link,
    Grid,
    GridItem,
    Text
} from '@chakra-ui/react'
/**
 * NFT HELPER
 */
import { fetchNftMetadata } from "../utils/nftHelpers";
/**
 * API GRAPH QUERY
 */
import {getSubgraphData} from "../utils/graphQueries";
/**
 * FRAKTAL Components
 */
import NFTItem from "@/components/nft-item";
import FrakButton from "@/components/button"
import Anchor from '@/components/anchor';
/**
 * STYLES
 */
import styles from "../styles/landing.module.css";
import {CREATE_NFT, EXPLORE, REWARDS} from "@/constants/routes";

//TODO LandingPage ADD PROPS

/**
 * LandingPage
 * @returns {any}
 * @constructor
 */
const LandingPage = () => {
    const [nftData, setNftData] = useState({});
    const router = useRouter();

    const getMostPopular = (items) => {
        return items.sort((a, b) => b.fraktal.fraktions.length - a.fraktal.fraktions.length);
    };

    useEffect(()=>{
        const getItem = async () => {
            //TODO - Get the most popular NFT without listing the items
            const data = await getSubgraphData("listed_items");
            const [mostPopular] = getMostPopular(data.listItems);
            const meta = await fetchNftMetadata(mostPopular.fraktal.hash);
            setNftData({...mostPopular, ...meta});
        };

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
                                onClick={() => {router.push(EXPLORE, null, {scroll: false})}}
                                px="80px">Explore</FrakButton>
                        </GridItem>
                        <GridItem w='100%'>
                            <FrakButton
                                onClick={() => {router.push(CREATE_NFT, null, {scroll: false})}}
                                border="2px solid #000"
                                px="80px"
                                background="#ffffff"
                                color="#000">Create</FrakButton>
                        </GridItem>
                    </Grid>
                    <Text className={styles.landingPowered}>Powered by FRAK</Text>
                    <List className={styles.landingItems} spacing={5}>
                        <ListItem
                        onClick={() => {router.push(REWARDS, null, {scroll: false})}}>
                            <ListIcon as={FaCoins} color='yellow.500' marginRight="10px"  />
                            Earn FRAK from trading to offset gas costs
                        </ListItem>
                        <ListItem
                          onClick={() => {router.push(REWARDS, null, {scroll: false})}}>
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
                            <Anchor
                                href={`/nft/${nftData.tokenAddress}/details`}
                            >
                                <NFTItem
                                    height="50rem"
                                    name={nftData.name}
                                    shares={nftData.shares}
                                    price={nftData.price}
                                    image={nftData.image}
                                    item={null}
                                />
                            </Anchor>
                        )
                    }
                </Container>
            </GridItem>
        </Grid>
    </>);
};

export default LandingPage;
