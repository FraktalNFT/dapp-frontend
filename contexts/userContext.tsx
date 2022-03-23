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
import { getSubgraphData } from "@/utils/graphQueries";

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

export const UserContext = createContext(null);

export const UserContextProviderFC = ({ children }) => {

  const [walletAssets, setWalletAssets] = useState(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { account } = useWeb3Context();

  useEffect(() => {
    if (account) {
      fetchNFTs();
    }
  }, [account]);

  const fetchNFTs = useCallback(
    // if user not in subgraph, fails to complete and show other nfts !!
    async () => {
      try {
        setLoading(true);
        let openseaAssets = await assetsInWallet(account, {
          limit: 60,
          offset: 0
        });

        setWalletAssets(openseaAssets.assets);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    },
    [account]
  );

  return (
    <UserContext.Provider
      value={{ loading, walletAssets }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const { loading, walletAssets } = useContext(
    UserContext
  );
  return {
    loading,
    walletAssets
  };
};