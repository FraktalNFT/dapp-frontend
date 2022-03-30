/**
 * React
 */
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
/**
 * Utils
 */
import { useWeb3Context } from "./Web3Context";
import { assetsInWallet } from "@/utils/openSeaAPI";
import {getSubgraphData, WALLET} from "@/utils/graphQueries";
/**
 * Helpers
 */
import {
    createObject,
    createOpenSeaObject,
} from "@/utils/nftHelpers";

type UserContextType = {
    fraktals: null | any[];
    fraktions: null | any[];
    nfts: null | any[];
    balance: number;
};

export const WalletContext = createContext(null);

export const WalletContextProviderFC = ({ children }) => {

    const [fraktals, setFraktals] = useState(null);
    const [fraktions, setFraktions] = useState(null);
    const [nfts, setNFTs] = useState(null);
    const [walletAssets, setWalletAssets] = useState(null);
    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState<boolean>(false);
    const { account } = useWeb3Context();

    useEffect(() => {
        if (account) {
            fetchNFTs();
        }
    }, [account]);

    useEffect(() => {
        if (window && fraktals?.length > 0) {
            const mintingNFTsString = window?.localStorage.getItem('mintingNFTs');
            fraktals?.forEach((fraktal) => {
                if (fraktal?.id === mintingNFTsString) {
                    window?.localStorage.removeItem('mintingNFTs');
                }
            });
        }
    }, [fraktals]);

    const fetchNFTs = useCallback(
        // if user not in subgraph, fails to complete and show other nfts !!
        async () => {
            try {
                setLoading(true);
                let totalNFTs = [];
                let nftsERC721_wallet;
                let nftsERC1155_wallet;
                let fraktionsObjects;
                let fraktionsObjectsClean;
                let userBalanceFormatted;
                let fraktalsClean: null | any[];
                let totalAddresses: null | string[];
                let nftObjectsClean;

                let openseaAssets = await assetsInWallet("sad", {
                    limit: 5,
                    offset: 0
                });
                console.log('opeanSea Assets', openseaAssets)

                setWalletAssets(openseaAssets.assets);
                let fobjects = await getSubgraphData(
                    WALLET,
                    account.toLocaleLowerCase()
                );

                if (fobjects && fobjects.users.length) {
                    // balance retrieval
                    let userBalance = fobjects.users[0].balance;
                    userBalanceFormatted = parseFloat(userBalance) / 10 ** 18;
                    // Fraktions retrieval
                    let validFraktions = fobjects.users[0].fraktions.filter(x => {
                        return x != null;
                    });

                    fraktionsObjects = await Promise.all(
                        validFraktions.map(x => {
                            return createObject(x);
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
                            return createObject(x);
                        })
                    );

                    if (userFraktalObjects) {
                        fraktalsClean = userFraktalObjects.filter(x => {
                            return x != null && x.imageURL;
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
                    nftsERC721_wallet = openseaAssets.assets.filter(x => {
                        return x.asset_contract.schema_name == "ERC721";
                    });

                    if (nftsERC721_wallet && nftsERC721_wallet.length) {
                        totalNFTs = totalNFTs.concat(nftsERC721_wallet);
                    }
                    nftsERC1155_wallet = openseaAssets.assets.filter(x => {
                        return x.asset_contract.schema_name == "ERC1155";
                    });

                    totalNFTs = nftsERC721_wallet.concat(nftsERC1155_wallet);
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
                            return x != null && x.imageURL;
                        });
                    } else {
                        nftObjectsClean = nftObjects;
                    }

                    setFraktals(fraktalsClean);
                    setFraktions(fraktionsObjectsClean);
                    setNFTs(nftObjectsClean);
                    setBalance(userBalanceFormatted);
                }
                //TODO: detect account and states change > refresh
            } catch (err) {
                console.error(err.message);
            } finally {
                setLoading(false);
            }
        },
        [account]
    );

    return (
        <WalletContext.Provider
            value={{ fraktals, fraktions, nfts, balance, loading, fetchNFTs, walletAssets }}
        >
            {children}
        </WalletContext.Provider>
    );
};

export const useWalletContext = () => {
    const { fraktals, fraktions, nfts, balance, loading, fetchNFTs, walletAssets } = useContext(
        WalletContext
    );
    return {
        fraktals,
        fraktions,
        nfts,
        balance,
        loading,
        fetchNFTs,
        walletAssets
    };
};