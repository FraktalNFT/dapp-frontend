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
                let fraktionsObjects;
                let fraktionsObjectsClean;
                let userBalanceFormatted;
                let fraktalsClean: null | any[];

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
                }

                setBalance(userBalanceFormatted);
                setFraktions(fraktionsObjectsClean);
                setFraktals(fraktalsClean);
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
            value={{ fraktals, fraktions, nfts, balance, loading, fetchNFTs }}
        >
            {children}
        </WalletContext.Provider>
    );
};

export const useWalletContext = () => {
    const { fraktals, fraktions, nfts, balance, loading, fetchNFTs } = useContext(
        WalletContext
    );
    return {
        fraktals,
        fraktions,
        nfts,
        balance,
        loading,
        fetchNFTs
    };
};