/**
 * React
 */
import { useState, useEffect} from "react";
/**
 * Chakra UI
 */
import {Box, Grid, Spinner} from "@chakra-ui/react";
/**
 * Components
 */
import InfiniteScroll from "react-infinite-scroll-component";
import NFTImportCardOS from "@/components/nft-importcard-opensea";

/**
 * InfiniteScrollNft
 * @param nftItems
 * @constructor
 */
const InfiniteScrollNft = ({getData, nftItems, setTokenToImport, hasMore, setImportingNFT}) => {


    return (
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
                    <NFTImportCardOS
                        item={item}
                        CTAText={'Import to market'}
                        onClick={() => {
                            setTokenToImport(item);
                            setImportingNFT(true);
                        }}
                    />
                ))}
            </Grid>
        </InfiniteScroll>
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

export {Loading};
export default InfiniteScrollNft;