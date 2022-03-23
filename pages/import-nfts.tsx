/**
 * React
 */
import { useEffect, useState, useCallback } from 'react';
import {useRouter} from "next/router";
import {Box, Spinner, Text} from "@chakra-ui/react";
/**
 * Components
 */
import NewNFTHeader from "@/components/newNFTHeader";
import InfiniteScrollNft from "@/components/infiniteScrollNft";
import {useWeb3Context} from "@/contexts/Web3Context";
import {assetsInWallet} from "@/utils/openSeaAPI";
import {getSubgraphData} from "@/utils/graphQueries";
import {createObject, createOpenSeaObject} from "@/utils/nftHelpers";

/**
 * MyNFTWallet
 * @constructor
 */

const MyNFTWallet = () => {
    const router = useRouter();
    const { account } = useWeb3Context();
    const [nfts, setNFTs] = useState([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    /**
     * Pagination
     */
    const [limit, setLimit] = useState(5);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    // Show Loading State
   useEffect(() => {
        if (account) {
            setIsLoading(true);
            fetchNFTs();
        }
    }, [account]);

   async function getData() {
       let totalNFTs = [];
       let nftsERC721Wallet;
       let nftsERC1155Wallet;
       let fraktionsObjects;
       let fraktionsObjectsClean;
       let fraktalsClean: null | any[];
       let totalAddresses: null | string[];
       let nftObjectsClean;

       let openseaAssets = await assetsInWallet(account, {
           limit: limit,
           offset: offset
       });

       if (openseaAssets && openseaAssets.assets && openseaAssets.assets.length === 0) {
           setHasMore(false);
           console.log('NO OPENSEA?')
           return;
       }

       let fobjects = await getSubgraphData(
           "wallet",
           account.toLocaleLowerCase()
       );

       if (fobjects && fobjects.users.length) {
           // Fraktions retrieval
           let validFraktions = fobjects.users[0].fraktions.filter(x => {
               return x.status != "retrieved";
           });

           fraktionsObjects = await Promise.all(
               validFraktions.map(x => {
                   return createObject(x.nft);
               })
           );

           if (fraktionsObjects) {
               fraktionsObjectsClean = fraktionsObjects.filter(x => {
                   return x != null;
               });
           }
           // Fraktals retrieval
           let userFraktalsFetched = fobjects.users[0].fraktals;

           let userFraktalObjects = await Promise.all(
               userFraktalsFetched.map(x => {
                   return createObject(x.nft);
               })
           );

           if (userFraktalObjects) {
               fraktalsClean = userFraktalObjects.filter(x => {
                   return x != null && x.imageURL.length && x.status != "retrieved";
               });
           }

           let userFraktalAddresses = fraktalsClean.map(x => {
               return x.id;
           });

           let userFraktionsAddreses = fraktionsObjectsClean.map(x => {
               return x.id;
           });

           totalAddresses = userFraktalAddresses.concat(userFraktionsAddreses);
       }

       if (
           openseaAssets &&
           openseaAssets.assets &&
           openseaAssets.assets.length
       ) {
           nftsERC721Wallet = openseaAssets.assets.filter(x => {
               return x.asset_contract.schema_name == "ERC721";
           });

           if (nftsERC721Wallet && nftsERC721Wallet.length) {
               totalNFTs = totalNFTs.concat(nftsERC721Wallet);
           }
           nftsERC1155Wallet = openseaAssets.assets.filter(x => {
               return x.asset_contract.schema_name == "ERC1155";
           });

           totalNFTs = nftsERC721Wallet.concat(nftsERC1155Wallet);
           if (!fobjects || !fobjects.users[0] || !fobjects.users[0].fraktals) {
               totalAddresses = [];
           }

           // NFTs filtering
           let nftsFiltered = totalNFTs.map(x => {
               if (!totalAddresses.includes(x.asset_contract.address)) {
                   return x;
               }
           });

           let nftObjects = await Promise.all(
               nftsFiltered.map(x => {
                   return createOpenSeaObject(x);
               })
           );

           if (nftObjects) {
               nftObjectsClean = nftObjects.filter(x => {
                   return x != null && x.imageURL.length;
               });
           } else {
               nftObjectsClean = nftObjects;
           }
           setHasMore(true);
           setNFTs([...nfts, ...nftObjectsClean]);
           setOffset(limit + offset);
       }
   }

   const fetchNFTs = useCallback(
        async () => {
            getData()
            setIsLoading(false);
        },
        [account]
    );

    return (
        <>
            {/* Title Elements */}
            <NewNFTHeader/>
            {/* End Title Elements */}
            {isLoading && <Spinner size="xl" />}
            {!isLoading && nfts?.length >= 1 && (
                <InfiniteScrollNft
                    hasMore={hasMore}
                    getData={getData}
                    nftItems={nfts}/>
            )}
            {!isLoading && nfts?.length  == 0 && (
                <>
                    <Text
                        sx={{
                            fontFamily: `Inter, sans-serif`,
                            fontWeight: `700`,
                            fontSize: `48px`,
                        }}
                    >
                        You have no NFTs.
                    </Text>
                </>
            )}
        </>
    );
}

export default MyNFTWallet;